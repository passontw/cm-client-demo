import axios from "axios";
import { setCookie } from "cookies-next";

const { NEXT_ORY_COOKIE_NAME, NEXT_KRATOS_ADMIN_URL } = process.env;

export default async function handler(req, res) {
  try {
    const cookieString = `${NEXT_ORY_COOKIE_NAME}=${req.cookies[NEXT_ORY_COOKIE_NAME]}`;

    const { data } = await axios.request(
      `${NEXT_KRATOS_ADMIN_URL}/api/.ory/sessions/whoami`,
      {
        method: "get",
        headers: {
          cookie: cookieString,
        },
      }
    );
    
    const { data: sessions } = await axios.request(
      `${NEXT_KRATOS_ADMIN_URL}/api/.ory/sessions`,
      {
        method: "get",
        headers: {
          cookie: cookieString,
        },
      }
      );

      const deactivedSessionPromises = sessions.map(session => {
        return axios.request(
          `${NEXT_KRATOS_ADMIN_URL}/api/.ory/sessions/${session.id}`,
          {
            method: "delete",
            headers: {
              cookie: cookieString,
            },
          }
          );
      });

      await Promise.all(deactivedSessionPromises);

    const email = data?.identity?.traits?.email;
    if (email) {
      setCookie("user_name", email, { req, res });
    }
  } catch (err) {
    console.log("swapOAuth2Token error:", err);

    return res.status(err.response.status).json({
      status: err.response.status,
      msg: err.response.data.error_description,
    });
  }

  return res.status(200).redirect(307, "/welcome");
  // return res.redirect(200, 'http://localhost:3000');
}
