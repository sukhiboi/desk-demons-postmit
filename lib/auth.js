const axios = require('axios');
const clientId = 'a10adde55f64586894bf';
const clientSecret = '260e6be0ce6751f5557dda1192b1a3fa5b18993b';

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

const fetchUserDetails = async function (code) {
  const OAuthDetails = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
  };
  try {
    const accessToken = await getGithubAccessToken(OAuthDetails);
    const userDetails = await getUserDetailsByAccessToken(accessToken);
    return userDetails;
  } catch (err) {
    return err;
  }
};

const authorizeUser = function (request, response) {
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
  response.redirect(url);
};

module.exports = { authorizeUser, fetchUserDetails };
