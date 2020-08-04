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

    it('should give error when follower table doesn\'t exists', async () => {
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

    it('should reject error when follower table doesn\'t exists', async () => {
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

  describe('getPost()', () => {
    it('should give post details based on postId', async () => {
      const expected = {
        postId,
        userId,
        message: 'hello',
        postedAt: new Date(),
      };
      const getStub = sinon.stub().yields(null, expected);
      const client = new Datastore({ get: getStub });
      const postDetails = await client.getPost(postId);
      assert.deepStrictEqual(postDetails, expected);
      sinon.assert.calledOnce(getStub);
    });

    it('should give error when table not found', async () => {
      const getStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ get: getStub });
      try {
        await client.getPost(postId);
      } catch (err) {
        sinon.assert.calledOnce(getStub);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getHashtagsByPostId', () => {
    it('should give all hashtags related to given post', async () => {
      const expected = { hashtag: 'html' };
      const allStub = sinon.stub().yields(null, [expected]);
      const client = new Datastore({ all: allStub });
      const hashtags = await client.getHashtagsByPostId(postId);
      assert.deepStrictEqual(hashtags, [expected]);
      sinon.assert.calledOnce(allStub);
    });
    it('should give error when the hashtags table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      try {
        await client.getHashtagsByPostId(postId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getBookmarks()', () => {
    it('should give all bookmarks related to given user', async () => {
      const expected = [{ postId }];
      const allStub = sinon.stub().yields(null, expected);
      const client = new Datastore({ all: allStub });
      assert.deepStrictEqual(await client.getBookmarks(userId), expected);
      sinon.assert.calledOnce(allStub);
    });
    it('should give empty list when there is no bookmarks related to given user', async () => {
      const expected = [];
      const allStub = sinon.stub().yields(null, expected);
      const client = new Datastore({ all: allStub });
      assert.deepStrictEqual(await client.getBookmarks(userId), expected);
      sinon.assert.calledOnce(allStub);
    });
    it('should give error when the bookmarks table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      try {
        await client.getBookmarks(userId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getPostsByHashtag', () => {
    it('should give all posts which has the given hashtag', async () => {
      const expected = [
        { postId, message: 'hello', postedAt: new Date(), userId },
      ];
      const allStub = sinon.stub().yields(null, expected);
      const client = new Datastore({ all: allStub });
      const posts = await client.getPostsByHashtag('html');
      assert.deepStrictEqual(posts, expected);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when the table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      try {
        await client.getPostsByHashtag('html');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('addHashtag', () => {
    it('should save a hashtag to hashtag table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.addHashtag('html', postId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when hashtag table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.addHashtag('html', postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('addBookmark()', () => {
    it('should save a hashtag to hashtag table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.addBookmark(postId, userId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when hashtag table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.addBookmark(postId, userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('removeBookmark()', () => {
    it('should save a hashtag to hashtag table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.removeBookmark(postId, userId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when hashtag table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.removeBookmark(postId, userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('getMatchingHashtags()', () => {
    it('should return matching hashtags', async () => {
      const expectedHashtags = [{ hashtag: 'html' }];
      const allStub = sinon.stub().yields(null, expectedHashtags);
      const client = new Datastore({ all: allStub });
      const hashtags = await client.getMatchingHashtags('ht');
      assert.deepStrictEqual(hashtags, [{ hashtag: 'html' }]);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when hashtags table doesn\'t exists', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      try {
        await client.getMatchingHashtags('ht');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('getAllResponses()', () => {
    it('should give all the responses of the given post', async () => {
      const expectedResponses = [{ responseId: 2 }];
      const allStub = sinon.stub().yields(null, expectedResponses);
      const client = new Datastore({ all: allStub });
      const responses = await client.getAllResponses(postId);
      assert.deepStrictEqual(responses, expectedResponses);
      sinon.assert.calledOnce(allStub);
    });

    it('should give error when response table not found', async () => {
      const allStub = sinon.stub().yields(expectedTableError, null);
      const client = new Datastore({ all: allStub });
      try {
        await client.getAllResponses(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(allStub);
      }
    });
  });

  describe('addResponse()', () => {
    const responseId = 2;
    it('should add response into responses table', async () => {
      const runStub = sinon.stub().yields(null);
      const client = new Datastore({ run: runStub });
      assert.isUndefined(await client.addResponse(postId, responseId));
      sinon.assert.calledOnce(runStub);
    });

    it('should give error when responses table not found', async () => {
      const runStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ run: runStub });
      try {
        await client.addResponse(postId, responseId);
      } catch (err) {
        assert.strictEqual(err, expectedTableError);
        sinon.assert.calledOnce(runStub);
      }
    });
  });

  describe('getReplyinhTo()', () => {
    it('should give me the username if the given postId is a reply', async () => {
      const expected = { username: 'ram' };
      const getStub = sinon.stub().yields(null, expected);
      const client = new Datastore({ get: getStub });
      assert.deepStrictEqual(await client.getReplyingTo(postId), expected);
    });
    it('should not give me the username if the given postId is not a reply', async () => {
      const getStub = sinon.stub().yields(null);
      const client = new Datastore({ get: getStub });
      assert.isUndefined(await client.getReplyingTo(postId));
    });
    it('should reject any error', async () => {
      const getStub = sinon.stub().yields(expectedTableError);
      const client = new Datastore({ get: getStub });
      try {
        await client.getReplyingTo(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });
});
