const sinon = require('sinon');
const { assert } = require('chai');
const DBClient = require('../lib/DBClient');

describe('#DBClient', () => {
  const expectedTableError = new Error('Error: post table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');

  describe('getPosts()', () => {
    it('should resolve to all the records from the posts table', async () => {
      const expected = [{ id: 1 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getAllPosts();
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should resolve to empty array when posts table is empty', async () => {
      const allStub = sinon.stub().yields(null, []);
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getAllPosts();
      assert.deepStrictEqual(actual, []);
      sinon.assert.calledOnce(allStub);
    });

    it('should reject with err when posts table does not exists', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new DBClient({ all: allStub });
      try {
        const posts = await dbClient.getAllPosts();
        assert.isNull(posts);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
      }
      sinon.assert.calledOnce(allStub);
    });
  });

  describe('getUserDetails()', () => {
    it('should resolve to user details of a valid userId', async () => {
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
      const getStub = sinon.stub().yields(expectedUserDetailsError, null);
      const client = new DBClient({ get: getStub });
      const userId = 1;
      try {
        const userDetails = await client.getUserDetails(userId);
        assert.isNull(userDetails);
      } catch (err) {
        assert.equal(err, expectedUserDetailsError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('getPostsByUserId()', () => {
    it('should resolve to posts of a valid userId', async () => {
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
      const allStub = sinon.stub().yields(expectedUserDetailsError, null);
      const client = new DBClient({ all: allStub });
      const userId = 2;
      try {
        const posts = await client.getPostsByUserId(userId);
        assert.isNull(posts);
      } catch (err) {
        assert.equal(err, expectedUserDetailsError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('addPost()', () => {
    it('should resolve to details of the post added', async () => {
      const postDetails = { user_id: 1, message: 'hi' };
      const runStub = sinon.stub().yields(null);
      const getStub = sinon.stub().yields(null, [postDetails]);
      const client = new DBClient({ run: runStub, get: getStub });
      const latestPostDetails = await client.addPost(postDetails);
      assert.deepStrictEqual(latestPostDetails, [postDetails]);
      sinon.assert.calledOnce(runStub);
      sinon.assert.calledOnce(getStub);
    });

    it('should reject when unable to add a new post', async () => {
      const tableError = new Error('Error: posts table not found');
      const runStub = sinon.stub().yields(tableError);
      const allStub = sinon.stub().yields(tableError, null);
      const client = new DBClient({ run: runStub, all: allStub });
      const postDetails = { user_id: 2, message: 'hello' };
      try {
        await client.addPost(postDetails);
      } catch (err) {
        assert.deepEqual(err, tableError);
        sinon.assert.calledOnce(runStub);
        sinon.assert.notCalled(allStub);
      }
    });
  });

  describe('likePost()', () => {
    const user_id = 1,
      postId = 1;

    it('should resolve to undefined after liking a post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isUndefined(await client.likePost(user_id, postId));
      sinon.assert.calledOnce(runStub);
    });

    it('should reject with err when posts table does not exists', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new DBClient({ run: runStub });
      try {
        await client.likePost(user_id, postId);
      } catch (err) {
        assert.equal(err, expectedTableError);
      }
      sinon.assert.calledOnce(runStub);
    });
  });

  describe('unlikePost()', () => {
    const user_id = 1,
      postId = 1;

    it('should resolve to undefined after unlinking a post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isUndefined(await client.unlikePost(postId, user_id));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when the likes table is not existing', async () => {
      const expected = new Error('no table found');
      const runStub = sinon.stub().yields(expected);
      const client = new DBClient({ run: runStub });
      try {
        await client.unlikePost(postId, user_id);
      } catch (err) {
        assert.equal(err, expected);
      }
      sinon.assert.calledOnce(runStub);
    });
  });

  describe('isLikedByUser()', () => {
    const user_id = 1,
      postId = 1;

    it('should resolve to true when post is liked by user', async () => {
      const getStub = sinon.stub().yields(null, [{ isLiked: true }]);
      const client = new DBClient({ get: getStub });
      assert.isTrue(await client.isLikedByUser(user_id, postId));
      sinon.assert.calledOnce(getStub);
    });

    it('should resolve to false when post is not liked by user', async () => {
      const getStub = sinon.stub().yields(null);
      const client = new DBClient({ get: getStub });
      assert.isFalse(await client.isLikedByUser(user_id, postId));
      sinon.assert.calledOnce(getStub);
    });

    it('should reject with err when posts table does not exists', async () => {
      const getStub = sinon.stub().yields(expectedTableError);
      const client = new DBClient({ get: getStub });
      try {
        await client.isLikedByUser(user_id, postId);
      } catch (err) {
        assert.equal(err, expectedTableError);
      }
      sinon.assert.calledOnce(getStub);
    });
  });

  describe('getLatestPostOfUser()', () => {
    it('should resolve to latest post of the given userId', async () => {
      const expected = [{ id: 1, message: 'hi' }];
      const getStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ get: getStub });
      const actual = await dbClient.getLatestPostOfUser();
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(getStub);
    });

    it('should resolve to empty array when user have no posts', async () => {
      const expected = [];
      const getStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ get: getStub });
      const actual = await dbClient.getLatestPostOfUser();
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(getStub);
    });

    it('should reject with err when posts table does not exists', async () => {
      const getStub = sinon.stub().yields(expectedTableError);
      const dbClient = new DBClient({ get: getStub });
      try {
        await dbClient.getLatestPostOfUser();
      } catch (err) {
        assert.equal(err, expectedTableError);
      }
      sinon.assert.calledOnce(getStub);
    });
  });
});
