const { assert } = require('chai');
const sinon = require('sinon');
const { DBClient } = require('../lib/DBClient');

describe('DBClient', () => {
  describe('getPosts', () => {
    it('should give all the records from the posts table', async () => {
      const expected = [{ id: 1 }];
      const all = (str, callback) => callback(null, expected);
      const dbClient = new DBClient({ all });
      try {
        const actual = await dbClient.getPosts();
        assert.deepStrictEqual(actual, expected);
      } catch (err) {
        assert.isNull(err);
      }

      //
    });

    it('should give error when the posts table is not existing', async () => {
      const expected = 'table posts not exists';
      const all = (str, callback) => callback(expected, null);
      const dbClient = new DBClient({ all });
      try {
        const posts = await dbClient.getPosts();
        assert.isNull(posts);
      } catch (err) {
        assert.deepStrictEqual(err, expected);
      }
    });
  });

  describe('getUserDetails', () => {
    it('should resolve the user details of a valid userId', async () => {
      const expectedUserDetail = {
        id: 1,
        username: 'sukhiboi',
        name: 'sukhdev',
      };
      const getStub = sinon.stub().yields(null, expectedUserDetail);
      const client = new DBClient({ get: getStub });
      const userId = 1;
      const userDetails = await client.getUserDetails(userId);
      assert.deepStrictEqual(userDetails, expectedUserDetail);
      sinon.assert.calledOnce(getStub);
    });

    it('should reject giving user details for invalid userId', async () => {
      const expectedError = new Error('userId not found');
      const getStub = sinon.stub().yields(expectedError, null);
      const client = new DBClient({ get: getStub });
      const userId = 1;

      try {
        await client.getUserDetails(userId);
      } catch (err) {
        assert.equal(err, expectedError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });
});
