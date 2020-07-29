const sinon = require('sinon');
const { assert } = require('chai');
const DBClient = require('../lib/DBClient');

describe('#DBClient', () => {
  const expectedTableError = new Error('Error: table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');
  const user_id = 1;

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
      const client = new DBClient({ run: runStub });
      const latestPostDetails = await client.addPost(postDetails);
      assert.isTrue(latestPostDetails);
      sinon.assert.calledOnce(runStub);
    });

    it('should reject when unable to add a new post', async () => {
      const tableError = new Error('Error: posts table not found');
      const runStub = sinon.stub().yields(tableError);
      const client = new DBClient({ run: runStub });
      const postDetails = { user_id: 2, message: 'hello' };
      const result = await client.addPost(postDetails);
      assert.isFalse(result);
      sinon.assert.calledOnce(runStub);
    });
  });

  describe('likePost()', () => {
    const user_id = 1,
      postId = 1;

    it('should resolve to true after liking a post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isTrue(await client.likePost(user_id, postId));
      sinon.assert.calledOnce(runStub);
    });

    it('should resolve false when there is any error', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new DBClient({ run: runStub });
      assert.isFalse(await client.likePost(user_id, postId));
      sinon.assert.calledOnce(runStub);
    });
  });

  describe('unlikePost()', () => {
    const user_id = 1,
      postId = 1;

    it('should resolve to true after unlinking a post', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      assert.isTrue(await client.unlikePost(postId, user_id));
      sinon.assert.calledOnce(runStub);
    });

    it('should resolve false when there is any error', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new DBClient({ run: runStub });
      assert.isFalse(await client.unlikePost(postId, user_id));
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

  describe('getAllLikedUsers()', () => {
    it('should give list of users who liked the given post', async () => {
      const expected = [{ user_id, post_id: 1 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getAllLikedUsers(user_id);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new DBClient({ all: allStub });
      try {
        assert.isNull(await dbClient.getAllLikedUsers(user_id));
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
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getMatchingUsers('j');
      assert.deepStrictEqual(actual, expectedUsersList);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when user table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new DBClient({ all: allStub });
      try {
        assert.isNull(await dbClient.getMatchingUsers('j'));
      } catch (error) {
        assert.strictEqual(error, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('saveUser()', () => {
    const userDetails = {
      githubUsername: 'hello',
      username: 'me',
      dob: '2001-02-18',
      bio: 'something',
      name: 'someone',
    };
    it('should resolve to true when user details saved', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      const result = await client.saveUser(userDetails);
      assert.isTrue(result);
      sinon.assert.calledOnce(runStub);
    });

    it("should reject error when user details doesn't saved", async () => {
      const errorToBeThrown = new Error('users table not found');
      const runStub = sinon.stub().yields(errorToBeThrown);
      const client = new DBClient({ run: runStub });
      try {
        await client.saveUser(userDetails);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('getUserIdByGithubUsername()', () => {
    it('should resolve to userId from username', async () => {
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(null, user_id);
      const client = new DBClient({ get: getStub });
      const result = await client.getUserIdByGithubUsername(githubUsername);
      assert.strictEqual(result, user_id);
      sinon.assert.calledOnce(getStub);
    });

    it('should resolve to undefined when userId not found', async () => {
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(null);
      const client = new DBClient({ get: getStub });
      const result = await client.getUserIdByGithubUsername(githubUsername);
      assert.isUndefined(result);
      sinon.assert.calledOnce(getStub);
    });

    it('should reject when an error occurred', async () => {
      const expectedError = new Error('users table not found');
      const githubUsername = 'someone';
      const getStub = sinon.stub().yields(expectedError);
      const client = new DBClient({ get: getStub });
      try {
        await client.getUserIdByGithubUsername(githubUsername);
      } catch (err) {
        assert.strictEqual(err, expectedError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('getUserIdByUsername()', () => {
    it('should give userId from username', async () => {
      const getStub = sinon.stub().yields(null, { user_id });
      const client = new DBClient({ get: getStub });
      const result = await client.getUserIdByUsername('john');
      assert.deepStrictEqual(result, { user_id });
      sinon.assert.calledOnce(getStub);
    });

    it('should reject when an error occurred', async () => {
      const expectedError = new Error('users table not found');
      const getStub = sinon.stub().yields(expectedError);
      const client = new DBClient({ get: getStub });
      try {
        await client.getUserIdByUsername('john');
      } catch (err) {
        assert.strictEqual(err, expectedError);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('addFollower()', () => {
    it('should add the follower into the table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      const result = await client.addFollower(1, 2);
      assert.isTrue(result);
      sinon.assert.calledOnce(runStub);
    });

    it("should reject error when follower table doesn't exists", async () => {
      const errorToBeThrown = new Error('users table not found');
      const runStub = sinon.stub().yields(errorToBeThrown);
      const client = new DBClient({ run: runStub });
      try {
        await client.addFollower(1, 2);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('removeFollower()', () => {
    it('should remove the follower from the table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new DBClient({ run: runStub });
      const result = await client.removeFollower(1, 2);
      assert.isTrue(result);
      sinon.assert.calledOnce(runStub);
    });

    it("should reject error when follower table doesn't exists", async () => {
      const errorToBeThrown = new Error('users table not found');
      const runStub = sinon.stub().yields(errorToBeThrown);
      const client = new DBClient({ run: runStub });
      try {
        await client.removeFollower(1, 2);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('isFollower()', () => {
    it('should give true when the given user is following', async () => {
      const getStub = sinon.stub().yields(null, { user_id: 1, follower_id: 2 });
      const client = new DBClient({ get: getStub });
      const result = await client.isFollower(1, 2);
      assert.isTrue(result);
      sinon.assert.calledOnce(getStub);
    });

    it('should give false when the given user is not following', async () => {
      const getStub = sinon.stub().yields(null, null);
      const client = new DBClient({ get: getStub });
      const result = await client.isFollower(1, 2);
      assert.isFalse(result);
      sinon.assert.calledOnce(getStub);
    });

    it("should reject error when follower table doesn't exists", async () => {
      const errorToBeThrown = new Error('users table not found');
      const getStub = sinon.stub().yields(errorToBeThrown);
      const client = new DBClient({ get: getStub });
      try {
        await client.isFollower(1, 2);
      } catch (err) {
        assert.strictEqual(err, errorToBeThrown);
        sinon.assert.calledOnce(getStub);
      }
    });
  });

  describe('getFollowers()', () => {
    it('should give list of followers who following the given user', async () => {
      const expected = [{ user_id: 2 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getFollowers(user_id);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new DBClient({ all: allStub });
      try {
        assert.isNull(await dbClient.getFollowers(user_id));
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getFollowings()', () => {
    it('should give list of followers who following the given user', async () => {
      const expected = [{ follower_id: 2 }];
      const allStub = sinon.stub().yields(null, expected);
      const dbClient = new DBClient({ all: allStub });
      const actual = await dbClient.getFollowings(user_id);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const dbClient = new DBClient({ all: allStub });
      try {
        assert.isNull(await dbClient.getFollowings(user_id));
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });
});
