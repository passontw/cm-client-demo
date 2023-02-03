import fetch from 'node-fetch';

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

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', 'http://127.0.0.1:3000/api/auth/callback');

    const response = await fetch(
      process.env.NEXT_PUBLIC_ORY_URL + '/oauth2/token',
      { method: 'POST', body: params },
    );

    const data = await response.json();
    console.log('data', data);
    if (data.access_token && data.refresh_token) {
      return res.status(200).json({
        status: 200,
        data,
      });
    }
  } catch (err) {
    console.log('swapOAuth2Token error:', err);

    return res.status(err.response.status).json({
      status: err.response.status,
      msg: err.response.data.error_description,
    });
  }
  return response;
}
