const { assert } = require('chai');
const sinon = require('sinon');
const Auth = require('../lib/auth');

describe('#Auth ', () => {
  const clientId = 12345;
  const clientSecret = 67890;
  const code = 1234567890;
  const access_token = 1234;
  const data = { login: 'sukhiboi', name: 'sukhdev' };
  describe('getAuthorizeUrl', () => {
    it('should give the authorizeUrl', () => {
      const auth = new Auth(clientId, clientSecret, {});
      const authorize_param = `/authorize?client_id=${clientId}`;
      const expected = `https://github.com/login/oauth${authorize_param}`;
      assert.strictEqual(auth.getAuthorizeUrl(), expected);
    });
  });
  describe('fetchUserDetails', () => {
    it('should return userDetails for given code', async () => {
      const axiosGetStub = sinon.stub().resolves({ data });
      const axiosPostStub = sinon.stub().resolves({ data: { access_token } });
      const auth = new Auth(clientId, clientSecret, {
        get: axiosGetStub,
        post: axiosPostStub,
      });
      assert.deepStrictEqual(await auth.fetchUserDetails(code), data);
    });
    it('should return err if there is any error', async () => {
      const error = new Error('not found');
      const axiosPostStub = sinon.stub().rejects(error);
      const axiosGetStub = sinon.stub().rejects(error);
      const auth = new Auth(clientId, clientSecret, {
        get: axiosGetStub,
        post: axiosPostStub,
      });
      assert.deepStrictEqual(await auth.fetchUserDetails(code), error);
    });
  });
});
