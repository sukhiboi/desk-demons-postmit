/* eslint-disable no-console */
/* eslint-disable camelcase */
const app = require('express')();
const axios = require('axios');
const clientId = 'your_client_id';
const clientSecret = 'your_client_secret';

const getGithubAccessToken = async function (OAuthDetails) {
  const headers = { headers: { accept: 'application/json' } };
  const url = 'https://github.com/login/oauth/access_token';
  const response = await axios.post(url, OAuthDetails, headers);
  return response.data.access_token;
};

const getUserDetailsByAccessToken = async function (accessToken) {
  const options = { headers: { Authorization: `token ${accessToken}` } };
  const response = await axios.get('https://api.github.com/user', options);
  return response.data;
};

const fetchUserDetails = async function (request, response) {
  const OAuthDetails = {
    client_id: clientId,
    client_secret: clientSecret,
    code: request.query.code,
  };
  try {
    const accessToken = await getGithubAccessToken(OAuthDetails);
    const userDetails = await getUserDetailsByAccessToken(accessToken);
    response.json(userDetails);
  } catch (err) {
    response.send(err);
  }
};

const authorizeUser = function (request, response) {
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
  response.redirect(url);
};

app.get('/', authorizeUser);
app.get('/callback', fetchUserDetails);
const PORT = 8000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
