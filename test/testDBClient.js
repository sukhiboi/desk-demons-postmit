const sinon = require('sinon');
const { assert } = require('chai');
const { DBClient } = require('../lib/DBClient');

describe('DBClient', () => {
  describe('getPosts', () => {
    it('should give all the records from the posts table', async () => {
      const expected = [{ id: 1 }];
      const all = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all });
      try {
        const actual = await dbClient.getPosts();
        assert.deepStrictEqual(actual, expected);
      } catch (err) {
        assert.isNull(err);
      }
    });

    it('should not give aby records when posts table is empty', async () => {
      const expected = [];
      const all = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all });
      try {
        const actual = await dbClient.getPosts();
        assert.deepStrictEqual(actual, expected);
      } catch (err) {
        assert.isNull(err);
      }
    });

    it('should give error when the posts table is not existing', async () => {
      const expected = new Error('table posts not exists');
      const all = sinon.stub().yields(expected, null);
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

  describe('getPostsByUserId', () => {
    it('should resolve the posts of a valid userId', async () => {
      const expectedPosts = [
        { id: 1, userId: 2, message: 'hi', posted_at: '2020-02-21 12:45:16' },
      ];
      const allStub = sinon.stub().yields(null, expectedPosts);
      const client = new DBClient({ all: allStub });
      const userId = 2;
      const posts = await client.getPostsByUserId(userId);
      assert.deepStrictEqual(posts, expectedPosts);
      sinon.assert.calledOnce(allStub);
    });

    it('should reject giving posts for invalid userId', async () => {
      const expectedError = new Error('userId not found');
      const allStub = sinon.stub().yields(expectedError, null);
      const client = new DBClient({ all: allStub });
      const userId = 2;
      try {
        await client.getPostsByUserId(userId);
      } catch (err) {
        assert.equal(err, expectedError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('addPost', () => {
    it('should should resolve to OK when post added to the database', async () => {
      const latestPosts = { message: 'hi' };
      const runStub = sinon.stub().yields(null);
      const allStub = sinon.stub().yields(null, [latestPosts]);
      const client = new DBClient({ run: runStub, all: allStub });
      const postDetails = { user_id: 2, message: 'hello' };
      const result = await client.addPost(postDetails);
      assert.deepStrictEqual(result, [latestPosts]);
      sinon.assert.calledOnce(runStub);
      sinon.assert.calledOnce(allStub);
    });

    it('should should reject with err when posts table doesn\'t exists', async () => {
      const tableError = new Error('posts table not found');
      const runStub = sinon.stub().yields(tableError);
      const allStub = sinon.stub().yields(tableError, null);
      const client = new DBClient({ run: runStub, all: allStub });
      const postDetails = { user_id: 2, message: 'hello' };
      try {
        await client.addPost(postDetails);
      } catch (err) {
        sinon.assert.calledOnce(runStub);
        sinon.assert.notCalled(allStub);
        assert.deepEqual(err, tableError);
      }
    });
  });

  describe('likePost', () => {
    it('should like given post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isUndefined(await client.likePost(1, 1));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when the likes table is not existing', async () => {
      const expected = new Error('no table found');
      const runStub = sinon.stub().yields(expected);
      const client = new DBClient({ run: runStub });
      try {
        assert.isUndefined(await client.likePost(1, 1));
        sinon.assert.calledOnce(runStub);
      } catch (err) {
        assert.deepStrictEqual(err, expected);
      }
    });
  });

  describe('unlikePost', () => {
    it('should unlike given post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isUndefined(await client.unlikePost(1, 1));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when the likes table is not existing', async () => {
      const expected = new Error('no table found');
      const runStub = sinon.stub().yields(expected);
      const client = new DBClient({ run: runStub });
      try {
        assert.isUndefined(await client.unlikePost(1, 1));
        sinon.assert.calledOnce(runStub);
      } catch (err) {
        assert.deepStrictEqual(err, expected);
      }
    });
  });

  describe('isLikedByUSer', () => {
    it('should give true when the given post is liked by the user', async () => {
      const getStub = sinon.stub().yields(null, 'liked by user');
      const client = new DBClient({ get: getStub });
      assert.isTrue(await client.isLikedByUser(1, 1));
      sinon.assert.calledOnce(getStub);
    });

    it('should give error when the likes table is not existing', async () => {
      const expected = new Error('no table found');
      const getStub = sinon.stub().yields(expected);
      const client = new DBClient({ get: getStub });
      try {
        assert.isTrue(await client.isLikedByUser(1, 1));
        sinon.assert.calledOnce(getStub);
      } catch (err) {
        assert.deepStrictEqual(err, expected);
      }
    });
  });
});
