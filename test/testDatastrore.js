const sinon = require('sinon');
const { assert } = require('chai');
const Datastore = require('../lib/datastore');

describe('#Datastore', () => {
  const expectedTableError = new Error('Error: table not found');
  const userId = 1;
  const postId = 1;

  describe('getUserDetails()', () => {
    it('should give user details of an existing userId', async () => {
      const expectedUserDetails = {
        userId: 1,
        username: 'sukhiboi',
        name: 'sukhdev',
      };
      const getStub = sinon.stub().yields(null, expectedUserDetails);
      const client = new Datastore({ get: getStub });
      const userDetails = await client.getUserDetails(userId);
      assert.deepStrictEqual(userDetails, expectedUserDetails);
      sinon.assert.calledOnce(getStub);
    });

    it('should give error when the user table is not found', async () => {
      const getStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ get: getStub });
      try {
        const userDetails = await client.getUserDetails(userId);
        assert.isNull(userDetails);
      } catch (err) {
        assert.equal(err, expectedTableError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('getUserPosts()', () => {
    it('should give all the posts of the given user', async () => {
      const expectedPosts = [
        {
          postId: 1,
          userId: 2,
          message: 'hi',
          posted_at: '2020-02-21 12:45:16',
        },
      ];
      const allStub = sinon.stub().yields(null, expectedPosts);
      const client = new Datastore({ all: allStub });
      const userId = 2;
      const posts = await client.getUserPosts(userId);
      assert.deepStrictEqual(posts, expectedPosts);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when the posts table is not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      const userId = 2;
      try {
        const posts = await client.getUserPosts(userId);
        assert.isNull(posts);
      } catch (err) {
        assert.equal(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('savePost()', () => {
    it('should save the details of the post', async () => {
      const postDetails = { user_id: 1, message: 'hi' };
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      const latestPostDetails = await client.savePost(postDetails);
      assert.isUndefined(latestPostDetails);
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when the post table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      const postDetails = { user_id: 2, message: 'hello' };
      try {
        await client.savePost(postDetails);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('likePost()', () => {
    it('should add like to likes table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.likePost(userId, postId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when likes table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.likePost(userId, postId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('unlikePost()', () => {
    it('should remove like from likes table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.unlikePost(postId, userId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when likes table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.unlikePost(postId, userId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('getAllPostLikers()', () => {
    it('should give list of likes of given post', async () => {
      const expected = [{ userId, postId }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new Datastore({ all: allStub });
      const actual = await dbClient.getAllPostLikers(postId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when likes table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new Datastore({ all: allStub });
      try {
        assert.isNull(await dbClient.getAllPostLikers(postId));
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getMatchingUsers()', () => {
    it('should give list of matching users with the search input', async () => {
      const expectedUsersList = [{ name: 'john', username: 'john' }];
      const allStub = sinon.stub().yields(null, expectedUsersList);
      const dbClient = new Datastore({ all: allStub });
      const actual = await dbClient.getMatchingUsers('j');
      assert.deepStrictEqual(actual, expectedUsersList);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when user table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new Datastore({ all: allStub });
      try {
        assert.isNull(await dbClient.getMatchingUsers('j'));
      } catch (error) {
        assert.strictEqual(error, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getIdByGithubUsername()', () => {
    it('should resolve to userId from username', async () => {
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(null, userId);
      const client = new Datastore({ get: getStub });
      const result = await client.getIdByGithubUsername(githubUsername);
      assert.strictEqual(result, userId);
      sinon.assert.calledOnce(getStub);
    });

    it('should resolve to undefined when userId not found', async () => {
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(null);
      const client = new Datastore({ get: getStub });
      const result = await client.getIdByGithubUsername(githubUsername);
      assert.isUndefined(result);
      sinon.assert.calledOnce(getStub);
    });

    it('should reject when an error occurred', async () => {
      const expectedError = new Error('users table not found');
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(expectedError);
      const client = new Datastore({ get: getStub });
      try {
        await client.getIdByGithubUsername(githubUsername);
      } catch (err) {
        assert.strictEqual(err, expectedError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('getIdByUsername()', () => {
    it('should give userId from username', async () => {
      const getStub = sinon.stub().yields(null, { userId });
      const client = new Datastore({ get: getStub });
      const result = await client.getIdByUsername('john');
      assert.deepStrictEqual(result, { userId });
      sinon.assert.calledOnce(getStub);
    });

    it('should reject when an error occurred', async () => {
      const expectedError = new Error('users table not found');
      const getStub = sinon.stub().yields(expectedError);
      const client = new Datastore({ get: getStub });
      try {
        await client.getIdByUsername('john');
      } catch (err) {
        assert.strictEqual(err, expectedError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('followUser()', () => {
    it('should add the follower into the table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      const result = await client.followUser(1, 2);
      assert.isUndefined(result);
      sinon.assert.calledOnce(runStub);
    });

    it("should give error when follower table doesn't exists", async () => {
      const errorToBeThrown = new Error('users table not found');
      const runStub = sinon.stub().yields(errorToBeThrown);
      const client = new Datastore({ run: runStub });
      try {
        await client.followUser(1, 2);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('unFollowUser()', () => {
    it('should remove the follower from the table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      const result = await client.unFollowUser(1, 2);
      assert.isUndefined(result);
      sinon.assert.calledOnce(runStub);
    });

    it("should reject error when follower table doesn't exists", async () => {
      const errorToBeThrown = new Error('users table not found');
      const runStub = sinon.stub().yields(errorToBeThrown);
      const client = new Datastore({ run: runStub });
      try {
        await client.unFollowUser(1, 2);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('getFollowers()', () => {
    it('should give list of followers who following the given user', async () => {
      const expected = [{ userId: 2 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new Datastore({ all: allStub });
      const actual = await dbClient.getFollowers(userId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new Datastore({ all: allStub });
      try {
        assert.isNull(await dbClient.getFollowers(userId));
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getFollowing()', () => {
    it('should give list of followers who following the given user', async () => {
      const expected = [{ userId: 2 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new Datastore({ all: allStub });
      const actual = await dbClient.getFollowing(userId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new Datastore({ all: allStub });
      try {
        assert.isNull(await dbClient.getFollowing(userId));
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getLikedPosts()', () => {
    it('should give liked posts of given user', async () => {
      const expected = [{ userId: 2 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new Datastore({ all: allStub });
      const actual = await dbClient.getLikedPosts(userId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when the likes table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new Datastore({ all: allStub });
      try {
        assert.isNull(await dbClient.getLikedPosts(userId));
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('removePost()', () => {
    it('should delete the given post and return post id', async () => {
      const execStub = sinon.stub().yields(null);
      const dbClient = new Datastore({ exec: execStub });
      assert.isUndefined(await dbClient.removePost(postId));
    });
    it('should reject when any error occurred', async () => {
      const execStub = sinon.stub().yields(expectedTableError);
      const dbClient = new Datastore({ exec: execStub });
      try {
        await dbClient.removePost(postId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
      }
    });
  });

  describe('saveUser()', () => {
    it('should save the user details into the user table', async () => {
      const userDetails = { userId };
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.saveUser(userDetails));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when the user table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      const postDetails = { user_id: 2, message: 'hello' };
      try {
        await client.saveUser(postDetails);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });
});
