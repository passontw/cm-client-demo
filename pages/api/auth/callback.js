// import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log('hello from callback.js');
  const { code } = req.body;
  console.log('code', code);
}
