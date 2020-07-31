const sinon = require('sinon');
const { assert } = require('chai');
const App = require('../lib/app');

describe('#App', () => {
  const userId = 1;
  const postId = 1;
  const hashtags = [{ hashtag: 'html' }];

  const userDetails = { name: 'john samuel', username: 'john', userId };

  const createDummyPosts = function () {
    return [
      {
        postId: postId,
        userId,
        postedAt: new Date().toISOString(),
        message: 'hi',
      },
    ];
  };

  const createApp = function (datastore) {
    const app = new App(datastore);
    app.userId = userId;
    app.username = userDetails.username;
    app.fullName = userDetails.name;
    return app;
  };

  const expectedTableError = new Error('Error: Table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');

  describe('updateUser()', () => {
    const getUserDetailsStub = sinon.stub().resolves(userDetails);
    it('should update the userDetails in App if user is present', async () => {
      const app = new App({ getUserDetails: getUserDetailsStub });
      await app.updateUser(userId);
      assert.strictEqual(app.userId, userId);
      assert.strictEqual(app.username, userDetails.username);
      assert.strictEqual(app.fullName, userDetails.name);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
    });

    it('should reject any error', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const app = new App({ getUserDetails: getUserDetailsStub });
      try {
        await app.updateUser(userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
        assert.isUndefined(app.userId);
        assert.isUndefined(app.username);
        assert.isUndefined(app.fullName);
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      }
    });
  });

  describe('updatePost()', () => {
    it('should update the given posts with required details', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = [
        {
          initials: 'JS',
          isDeletable: true,
          isLiked: true,
          likedUsers: [{ userId: 1 }],
          message: 'hi',
          name: 'john samuel',
          postId: 1,
          postedAt: 'a few seconds ago',
          userId: 1,
          username: 'john',
          mentions: [],
          hashtags: ['html'],
        },
      ];
      const actual = await app.updatePost(userId, createDummyPosts());
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should reject any error', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const app = createApp({ getUserDetails: getUserDetailsStub });
      try {
        await app.updatePost(userId, createDummyPosts());
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      }
    });
  });

  describe('getUserFeed()', () => {
    it.skip('should resolve to the feeds posts of user', async () => {
      const getFollowingStub = sinon.stub().resolves([{ userId: 2 }]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getFollowing: getFollowingStub,
        getUserPosts: getUserPostsStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = {
        initials: 'JS',
        loggedUser: 'john',
        posts: [
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            hashtags: ['html'],
            mentions: [],
          },
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            hashtags: ['html'],
            mentions: [],
          },
        ],
      };
      const actual = await app.getUserFeed();
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
      sinon.assert.calledTwice(getUserPostsStub);
      sinon.assert.calledTwice(getUserDetailsStub);
      sinon.assert.calledTwice(getAllPostLikersStub);
    });

    it('should reject any error', async () => {
      const getFollowingStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getFollowing: getFollowingStub });
      try {
        await app.getUserFeed();
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
      }
    });
  });

  describe('savePost()', () => {
    it('should save a post', async () => {
      const savePostStub = sinon.stub().resolves(null);
      const app = createApp({ savePost: savePostStub });
      const content = 'hello';
      assert.isNull(await app.savePost(content));
      sinon.assert.calledOnce(savePostStub);
    });

    it('should reject any error', async () => {
      const savePostStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ savePost: savePostStub });
      const content = 'hello';
      try {
        await app.savePost(content);
      } catch (err) {
        sinon.assert.calledOnce(savePostStub);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('toggleLikeOnPost()', () => {
    it('should unlike a post when it is liked', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const likePostStub = sinon.stub().resolves(null);
      const unlikePostStub = sinon.stub().resolves(null);
      const app = createApp({
        getAllPostLikers: getAllPostLikersStub,
        likePost: likePostStub,
        unlikePost: unlikePostStub,
      });
      assert.isNull(await app.toggleLikeOnPost(postId));
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      sinon.assert.calledOnceWithExactly(unlikePostStub, postId, userId);
      sinon.assert.notCalled(likePostStub);
    });

    it('should like a post when it is not liked', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId: 3 }]);
      const likePostStub = sinon.stub().resolves(null);
      const unlikePostStub = sinon.stub().resolves(null);
      const app = createApp({
        getAllPostLikers: getAllPostLikersStub,
        likePost: likePostStub,
        unlikePost: unlikePostStub,
      });
      assert.isNull(await app.toggleLikeOnPost(postId));
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      sinon.assert.calledOnceWithExactly(likePostStub, postId, userId);
      sinon.assert.notCalled(unlikePostStub);
    });

    it('should reject any errors', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({
        getAllPostLikers: getAllPostLikersStub,
      });
      try {
        await app.toggleLikeOnPost(postId);
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('toggleFollowingAUser()', () => {
    const otherUserId = 2;

    it('should unFollow are user when being followed', async () => {
      const getIdByUsernameStub = sinon
        .stub()
        .resolves({ userId: otherUserId });
      const getFollowersStub = sinon.stub().resolves([{ userId }]);
      const unFollowUserStub = sinon.stub().resolves(null);
      const followUserStub = sinon.stub().resolves(null);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        unFollowUser: unFollowUserStub,
        followUser: followUserStub,
      });
      assert.isNull(await app.toggleFollowingAUser('naveen'));
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledOnceWithExactly(getFollowersStub, otherUserId);
      sinon.assert.calledOnceWithExactly(unFollowUserStub, userId, otherUserId);
      sinon.assert.notCalled(followUserStub);
    });

    it('should follow are user when not being followed', async () => {
      const getIdByUsernameStub = sinon
        .stub()
        .resolves({ userId: otherUserId });
      const getFollowersStub = sinon.stub().resolves([{ userId: 3 }]);
      const unFollowUserStub = sinon.stub().resolves(null);
      const followUserStub = sinon.stub().resolves(null);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        unFollowUser: unFollowUserStub,
        followUser: followUserStub,
      });
      assert.isNull(await app.toggleFollowingAUser('naveen'));
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledOnceWithExactly(getFollowersStub, otherUserId);
      sinon.assert.calledOnceWithExactly(followUserStub, userId, otherUserId);
      sinon.assert.notCalled(unFollowUserStub);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
      });
      try {
        await app.toggleFollowingAUser('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('deletePost()', () => {
    it('should delete a post', async () => {
      const removePostStub = sinon.stub().resolves(null);
      const app = createApp({ removePost: removePostStub });
      assert.isNull(await app.deletePost(postId));
      sinon.assert.alwaysCalledWithExactly(removePostStub, postId);
    });

    it('should reject any error', async () => {
      const removePostStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ removePost: removePostStub });
      try {
        await app.deletePost(postId);
      } catch (err) {
        sinon.assert.alwaysCalledWithExactly(removePostStub, postId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('isUsernameAvailable()', () => {
    it('should return true when username is available', async () => {
      const getIdByUsernameStub = sinon.stub().resolves();
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      assert.isTrue(await app.isUsernameAvailable('naveen'));
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });

    it('should return false when username is not available', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      assert.isFalse(await app.isUsernameAvailable('naveen'));
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      try {
        await app.isUsernameAvailable('naveen');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      }
    });
  });

  describe('saveUser()', () => {
    it('should save a user and return the userId', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const saveUserStub = sinon.stub().resolves();
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        saveUser: saveUserStub,
      });
      assert.deepStrictEqual(await app.saveUser(userDetails), { userId });
      sinon.assert.calledOnceWithExactly(saveUserStub, userDetails);
      const username = userDetails.username;
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, username);
    });

    it('should reject any error', async () => {
      const saveUserStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ saveUser: saveUserStub });
      try {
        await app.saveUser(userDetails);
      } catch (err) {
        sinon.assert.calledOnceWithExactly(saveUserStub, userDetails);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getProfilePosts()', () => {
    it('should give both liked and posted posts of given user', async () => {
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getLikedPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getUserPosts: getUserPostsStub,
        getLikedPosts: getLikedPostsStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const actual = await app.getProfilePosts({ userId });
      const expected = {
        likedPosts: [
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            hashtags: ['html'],
            mentions: [],
          },
        ],
        posts: [
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            hashtags: ['html'],
            mentions: [],
          },
        ],
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getLikedPostsStub, userId);
      sinon.assert.calledTwice(getUserDetailsStub);
      sinon.assert.calledTwice(getAllPostLikersStub);
    });

    it('should give both liked and posted posts of given user', async () => {
      const getUserPostsStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getUserPosts: getUserPostsStub });
      try {
        await app.getProfilePosts({ userId });
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getUserProfile()', () => {
    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      try {
        await app.getUserProfile('naveen');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      }
    });

    it('should resolve to user profile', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getLikedPostsStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getFollowingStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getUserPosts: getUserPostsStub,
        getLikedPosts: getLikedPostsStub,
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        getFollowing: getFollowingStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const actual = await app.getUserProfile(userDetails.username);
      const expected = {
        followers: [],
        following: [],
        initials: 'JS',
        isFollowing: false,
        likedPosts: [],
        loggedUser: 'john',
        name: 'john samuel',
        posts: [
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            hashtags: ['html'],
            mentions: [],
          },
        ],
        userId: 1,
        username: 'john',
      };
      const username = userDetails.username;
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledTwice(getUserDetailsStub);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, userId);
      sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getLikedPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, username);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
    });
  });

  describe('getUserSuggestions()', () => {
    it('should resolve to searched user suggestions', async () => {
      const getMatchingUsersStub = sinon.stub().resolves([userDetails]);
      const app = createApp({ getMatchingUsers: getMatchingUsersStub });
      const actual = await app.getUserSuggestions('john');
      const expected = [{ ...userDetails, initials: 'JS' }];
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'john');
    });

    it('should reject any error', async () => {
      const getMatchingUsersStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getMatchingUsers: getMatchingUsersStub });
      try {
        await app.getUserSuggestions('john');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'john');
      }
    });
  });

  describe('updateUserList()', () => {
    it('should update given list of users', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getFollowersStub = sinon.stub().resolves([]);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getFollowers: getFollowersStub,
      });
      const actual = await app.updateUsersList([userDetails]);
      const expected = [
        {
          initials: 'JS',
          isFollowingMe: false,
          name: 'john samuel',
          userId: 1,
          username: 'john',
        },
      ];
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
    });

    it('should reject any errors', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
      });
      try {
        await app.updateUsersList([userDetails]);
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getFollowingList()', () => {
    it('should return the list of following of a user', async () => {
      const getFollowersStub = sinon.stub().resolves([]);
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getFollowingStub = sinon.stub().resolves([{ userId }]);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
      });
      const actual = await app.getFollowingList('naveen');
      const expected = {
        followingList: [
          {
            initials: 'JS',
            isFollowingMe: false,
            name: 'john samuel',
            userId: 1,
            username: 'john',
          },
        ],
        loggedUser: 'john',
        profile: {
          initials: 'JS',
          isFollowingMe: false,
          name: 'john samuel',
          userId: 1,
          username: 'john',
        },
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledTwice(getUserDetailsStub);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      try {
        await app.getFollowingList('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getFollowersList()', () => {
    it('should return the list of followers of a user', async () => {
      const getFollowersStub = sinon.stub().resolves([userDetails]);
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getFollowers: getFollowersStub,
      });
      const actual = await app.getFollowersList('naveen');
      const expected = {
        followersList: [
          {
            initials: 'JS',
            isFollowingMe: true,
            name: 'john samuel',
            userId: 1,
            username: 'john',
          },
        ],
        loggedUser: 'john',
        profile: {
          initials: 'JS',
          isFollowingMe: true,
          name: 'john samuel',
          userId: 1,
          username: 'john',
        },
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledTwice(getUserDetailsStub);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      try {
        await app.getFollowersList('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getUserId()', () => {
    it('should resolve to the userId based on github username', async () => {
      const getIdByGithubUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({
        getIdByGithubUsername: getIdByGithubUsernameStub,
      });
      assert.deepStrictEqual(await app.getUserId('naveen'), { userId });
      sinon.assert.calledOnceWithExactly(getIdByGithubUsernameStub, 'naveen');
    });

    it('should reject any error', async () => {
      const getIdByGithubUsernameStub = sinon
        .stub()
        .rejects(expectedTableError);
      const app = createApp({
        getIdByGithubUsername: getIdByGithubUsernameStub,
      });
      try {
        await app.getUserId('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByGithubUsernameStub, 'naveen');
      }
    });
  });

  describe('getPostDetails()', () => {
    it('should give all the post details based on postId', async () => {
      const expectedPost = {
        postId,
        userId,
        postedAt: new Date(),
        message: 'hello',
      };
      const getPostStub = sinon.stub().resolves(expectedPost);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getPost: getPostStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      const expected = {
        ...expectedPost,
        ...userDetails,
        postedAt: 'a few seconds ago',
        likedUsers: [],
        isLiked: false,
        isDeletable: true,
        loggedUser: userDetails.username,
        mentions: [],
        hashtags: ['html'],
      };
      const actual = await app.getPostDetails(postId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getPostStub, postId);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should give error when post table not found', async () => {
      const getPostStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({
        getPost: getPostStub,
      });
      try {
        await app.getPostDetails(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getPostStub, postId);
      }
    });
  });

  describe('getPostLikers()', () => {
    it('should give users who liked a post based on postId', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getFollowersStub = sinon.stub().resolves([]);
      const app = createApp({
        getAllPostLikers: getAllPostLikersStub,
        getUserDetails: getUserDetailsStub,
        getFollowers: getFollowersStub,
      });
      const actual = await app.getPostLikers(postId);
      const expected = {
        list: [{ ...userDetails, isFollowingMe: false }],
        loggedUser: userDetails.username,
        postId,
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should give error when posts table not found', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getAllPostLikers: getAllPostLikersStub });
      try {
        await app.getPostLikers(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      }
    });
  });

  describe('getValidMentions()', () => {
    it('should give list of valid users mentioned in post', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
      });
      assert.deepStrictEqual(await app.getValidMentions('hii @naveen'), [
        '@naveen',
      ]);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });

    it('should give empty list when there is no valid users mentioned in post', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({});
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
      });
      assert.deepStrictEqual(await app.getValidMentions('hii @naveen'), []);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });
  });

  describe('getHashtagRelatedPosts', () => {
    it('should give all posts with the given hashtag', async () => {
      const post = {
        postId,
        postedAt: new Date(),
        userId,
        message: 'hi #html',
      };
      const getPostsByHashtagStub = sinon.stub().resolves([post]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getPostsByHashtag: getPostsByHashtagStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = {
        posts: [
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            isFollowingMe: false,
            likedUsers: [{ userId: 1 }],
            message: 'hi #html',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
            mentions: [],
            hashtags: ['html'],
          },
        ],
        loggedUser: userDetails.username,
        hashtag: 'html',
      };
      const actual = await app.getHashtagRelatedPosts('html');
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getPostsByHashtagStub, 'html');
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      sinon.assert.calledOnceWithExactly(getHashtagsByPostIdStub, postId);
    });
  });

  describe('getBookmarks()', () => {
    it('should give list of bookmarked posts of user', async () => {
      const getBookmarksStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getBookmarks: getBookmarksStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = {
        loggedUser: 'john',
        posts: [
          {
            hashtags: ['html'],
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            isFollowingMe: false,
            mentions: [],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'a few seconds ago',
            userId: 1,
            username: 'john',
          },
        ],
      };
      assert.deepStrictEqual(await app.getBookmarks(), expected);
      sinon.assert.calledOnce(getBookmarksStub);
    });

    it('should give empty list when no posts are bookmarked', async () => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const app = createApp({
        getBookmarks: getBookmarksStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = { posts: [], loggedUser: 'john' };
      assert.deepStrictEqual(await app.getBookmarks(), expected);
      sinon.assert.calledOnce(getBookmarksStub);
    });

    it('should reject any error', async () => {
      const getBookmarksStub = sinon.stub().rejects(expectedTableError);
      const app = createApp({ getBookmarks: getBookmarksStub });
      try {
        await app.getBookmarks();
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(getBookmarksStub);
      }
    });
  });
});
