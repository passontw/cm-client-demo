import fetch from 'node-fetch';
import { getCookie, setCookie } from 'cookies-next';

export default async function handler(req, res) {
  console.log('hello from callback.js', req.url);
  const code = req.url.substring(
    req.url.indexOf('=') + 1,
    req.url.indexOf('&'),
  );
  // const { code } = req.body;
  console.log('code', code);
  const clientID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.ORY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);

    const response = await fetch(
      process.env.NEXT_PUBLIC_ORY_URL + '/oauth2/token',
      { method: 'POST', body: params },
    );

    const data = await response.json();
    console.log('data', data);
    if (data.access_token && data.refresh_token) {
      setCookie('access_token', data.access_token, { req, res });
      setCookie('refresh_token', data.refresh_token, { req, res });

      // const a_token = getCookie('access_token', { req, res });
      // console.log('a_token', a_token);

      const userinfoResponse = await fetch(
        process.env.NEXT_PUBLIC_ORY_URL + '/userinfo',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + data.access_token },
        },
      );
      const data2 = await userinfoResponse.json();
      if (data2.sub) {
        console.log('data2.sub', data2.sub);
        setCookie('user_name', data2.sub, { req, res });
      }
      // console.log(data2);

      res.status(200).redirect(307, '/welcome');
      // return res.status(200).json({
      //   status: 200,
      //   data2,
      // });
    }
  } catch (err) {
    console.log('swapOAuth2Token error:', err);

    return res.status(err.response.status).json({
      status: err.response.status,
      msg: err.response.data.error_description,
    });
  }

  return res.status(200).redirect(307, '/welcome');
  // return res.redirect(200, 'http://localhost:3000');
}
