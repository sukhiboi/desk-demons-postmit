const getGithubAccessToken = async function (OAuthDetails, axios) {
  const headers = { headers: { accept: 'application/json' } };
  const url = 'https://github.com/login/oauth/access_token';
  const response = await axios.post(url, OAuthDetails, headers);
  return response.data.access_token;
};

const getUserDetailsByAccessToken = async function (accessToken, axios) {
  const options = { headers: { Authorization: `token ${accessToken}` } };
  const response = await axios.get('https://api.github.com/user', options);
  return response.data;
};

class Auth {
  constructor(clientId, clientSecret, axios) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.axios = axios;
  }
  getAuthorizeUrl() {
    const client_id_param = `client_id=${this.clientId}`;
    return `https://github.com/login/oauth/authorize?${client_id_param}`;
  }
  async fetchUserDetails(code) {
    const OAuthDetails = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    };
    try {
      const accessToken = await getGithubAccessToken(OAuthDetails, this.axios);
      const userDetails = await getUserDetailsByAccessToken(
        accessToken,
        this.axios
      );
      return userDetails;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Auth;
