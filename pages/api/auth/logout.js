import { deleteCookie } from 'cookies-next';

export default function handler(req, res) {
  deleteCookie('access_token', {req, res});
  deleteCookie('refresh_token', { req, res });
  res.status(200).json({ success: true })
}
