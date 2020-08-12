const sinon = require('sinon');
const { assert } = require('chai');
const User = require('../src/user');

describe('#User', () => {
  const userId = 1;
  const postId = 1;

  const userDetails = {
    name: 'john samuel',
    username: 'john',
    userId,
    dob: '2020-08-03',
    imageUrl: 'url',
    joinedDate: '2020-08-03',
  };
  const hashtags = [{ hashtag: 'html' }];
  const responses = [
    { postId: 2, message: 'response', postedAt: '2020-08-03', ...userDetails },
  ];

  const reposts = [
    { ...userDetails, postId, message: 'repost', postedAt: '2020-08-03' },
  ];

  const createDummyPosts = function () {
    return [
      {
        postId: postId,
        postedAt: '2020-08-03',
        message: 'post',
        imageUrl: 'url',
        ...userDetails,
      },
    ];
  };
  const createUser = function (datastore) {
    return new User(datastore, { ...userDetails, imageUrl: 'url' });
  };

  const expectedTableError = new Error('Error: Table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');

  describe('static create()', () => {
    it('should update the userDetails in User if user is present', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const user = await User.create(
        { getUserDetails: getUserDetailsStub },
        userId
      );
      assert.instanceOf(user, User);
      assert.strictEqual(user.userId, userId);
      assert.strictEqual(user.username, userDetails.username);
      assert.strictEqual(user.fullName, userDetails.name);
      assert.strictEqual(user.imageUrl, 'url');
      assert.strictEqual(user.initials, 'JS');
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
    });

    it('should reject any error', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      try {
        await User.create({ getUserDetails: getUserDetailsStub }, userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      }
    });
  });

  describe('updatePostActions()', () => {
    it('should give all the post related actions of the given post', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getBookmarksStub = sinon.stub().resolves([postId]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getAllPostLikers: getAllPostLikersStub,
        getAllResponses: getAllResponsesStub,
        getBookmarks: getBookmarksStub,
        getAllReposts: getAllRepostsStub,
      });
      const expected = {
        isBookmarked: false,
        isDeletable: false,
        isLiked: true,
        isReposted: false,
        likedUsers: [
          {
            userId: 1,
          },
        ],
        postId: 1,
        responseCount: 1,
        repostCount: 0,
      };
      const actual = await user.updatePostActions(userId, { postId });
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should handle all the errors', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        getAllPostLikers: getAllPostLikersStub,
      });
      try {
        await user.updatePostActions(userId, { postId });
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      }
    });
  });

  describe('updatePosts()', () => {
    it('should update the given posts with required details', async () => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves({ username: 'ram' });
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
        getAllResponses: getAllResponsesStub,
        getReplyingTo: getReplyingToStub,
      });
      const expected = [
        {
          ...userDetails,
          repostCount: 0,
          initials: 'JS',
          isDeletable: true,
          isLiked: true,
          likedUsers: [{ userId: 1 }],
          message: 'post',
          postId: 1,
          postedAt: '2020-08-03',
          isBookmarked: false,
          mentions: [],
          hashtags: ['html'],
          replyingTo: 'ram',
          responseCount: 1,
          isReposted: false,
        },
      ];
      const actual = await user.updatePosts(userId, createDummyPosts());
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should reject any error', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getAllPostLikers: getAllPostLikersStub });
      try {
        await user.updatePosts(userId, createDummyPosts());
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      }
    });
  });

  describe('getPostDetails()', () => {
    it('should give all the post details based on postId', async () => {
      const expectedPost = {
        ...userDetails,
        postId,
        postedAt: '2020-08-03',
        responseCount: 1,
        message: 'hello',
        isBookmarked: false,
      };
      const getPostStub = sinon.stub().resolves(expectedPost);
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getPost: getPostStub,
        getAllPostLikers: getAllPostLikersStub,
        getBookmarks: getBookmarksStub,
      });
      const expected = {
        imageUrl: 'url',
        initials: 'JS',
        loggedUser: 'john',
        fullName: userDetails.name,
        post: {
          repostCount: 0,
          hashtags: ['html'],
          initials: 'JS',
          isBookmarked: false,
          isDeletable: true,
          imageUrl: 'url',
          isLiked: false,
          likedUsers: [],
          mentions: [],
          message: 'hello',
          name: 'john samuel',
          postId: 1,
          postedAt: '2020-08-03',
          responseCount: 1,
          userId: 1,
          username: 'john',
          isReposted: false,
          dob: '2020-08-03',
          joinedDate: '2020-08-03',
        },
        responses: [
          {
            repostCount: 0,
            hashtags: ['html'],
            initials: 'JS',
            isBookmarked: false,
            imageUrl: 'url',
            isDeletable: true,
            isLiked: false,
            likedUsers: [],
            mentions: [],
            message: 'response',
            name: 'john samuel',
            postId: 2,
            postedAt: '2020-08-03',
            responseCount: 1,
            userId: 1,
            username: 'john',
            dob: '2020-08-03',
            joinedDate: '2020-08-03',
            isReposted: false,
          },
        ],
      };
      const actual = await user.getPostDetails(postId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getPostStub, postId);
      sinon.assert.calledTwice(getAllPostLikersStub);
    });

    it('should give error when post table not found', async () => {
      const getPostStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        getPost: getPostStub,
      });
      try {
        await user.getPostDetails(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getPostStub, postId);
      }
    });
  });

  describe('getUserFeed()', () => {
    it('should resolve to the feeds posts of user', async () => {
      const getFollowingStub = sinon
        .stub()
        .resolves([{ userId: 2, username: 'Ram' }]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllRepostsStub = sinon.stub().resolves([]);
      const getRepostsByUserIdStub = sinon.stub().resolves(reposts);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getFollowing: getFollowingStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
        getRepostsByUserId: getRepostsByUserIdStub,
      });
      const expected = {
        imageUrl: 'url',
        initials: 'JS',
        loggedUser: 'john',
        fullName: userDetails.name,
        posts: [
          {
            repostCount: 0,
            dob: '2020-08-03',
            hashtags: ['html'],
            imageUrl: 'url',
            initials: 'JS',
            isBookmarked: false,
            isDeletable: true,
            isLiked: true,
            joinedDate: '2020-08-03',
            likedUsers: [{ userId: 1 }],
            mentions: [],
            message: 'post',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            responseCount: 1,
            userId: 1,
            isReposted: false,
            username: 'john',
          },
          {
            isReposted: false,
            repostCount: 0,
            dob: '2020-08-03',
            hashtags: ['html'],
            imageUrl: 'url',
            initials: 'JS',
            isBookmarked: false,
            isDeletable: true,
            isLiked: true,
            joinedDate: '2020-08-03',
            likedUsers: [{ userId: 1 }],
            mentions: [],
            message: 'repost',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            repostedBy: 'Ram',
            responseCount: 1,
            userId: 1,
            username: 'john',
          },
          {
            isReposted: false,
            dob: '2020-08-03',
            repostCount: 0,
            hashtags: ['html'],
            imageUrl: 'url',
            initials: 'JS',
            isBookmarked: false,
            isDeletable: true,
            isLiked: true,
            joinedDate: '2020-08-03',
            likedUsers: [{ userId: 1 }],
            mentions: [],
            message: 'post',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            responseCount: 1,
            userId: 1,
            username: 'john',
          },
          {
            isReposted: false,
            dob: '2020-08-03',
            hashtags: ['html'],
            repostCount: 0,
            imageUrl: 'url',
            initials: 'JS',
            isBookmarked: false,
            isDeletable: true,
            isLiked: true,
            joinedDate: '2020-08-03',
            likedUsers: [{ userId: 1 }],
            mentions: [],
            message: 'repost',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            repostedBy: 'john',
            responseCount: 1,
            userId: 1,
            username: 'john',
          },
        ],
      };
      const actual = await user.getUserFeed();
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
      sinon.assert.calledTwice(getUserPostsStub);
    });

    it('should reject any error', async () => {
      const getFollowingStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getFollowing: getFollowingStub });
      try {
        await user.getUserFeed();
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
      }
    });
  });

  describe('savePost()', () => {
    it('should save a post', async () => {
      const savePostStub = sinon.stub().resolves(null);
      const user = createUser({ savePost: savePostStub });
      const content = 'hello';
      assert.isNull(await user.savePost(content));
      sinon.assert.calledOnce(savePostStub);
    });

    it('should reject any error', async () => {
      const savePostStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ savePost: savePostStub });
      const content = 'hello';
      try {
        await user.savePost(content);
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
      const user = createUser({
        getAllPostLikers: getAllPostLikersStub,
        likePost: likePostStub,
        unlikePost: unlikePostStub,
      });
      assert.isNull(await user.toggleLikeOnPost(postId));
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      sinon.assert.calledOnceWithExactly(unlikePostStub, postId, userId);
      sinon.assert.notCalled(likePostStub);
    });

    it('should like a post when it is not liked', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId: 3 }]);
      const likePostStub = sinon.stub().resolves(null);
      const unlikePostStub = sinon.stub().resolves(null);
      const user = createUser({
        getAllPostLikers: getAllPostLikersStub,
        likePost: likePostStub,
        unlikePost: unlikePostStub,
      });
      assert.isNull(await user.toggleLikeOnPost(postId));
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      sinon.assert.calledOnceWithExactly(likePostStub, postId, userId);
      sinon.assert.notCalled(unlikePostStub);
    });

    it('should reject any errors', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        getAllPostLikers: getAllPostLikersStub,
      });
      try {
        await user.toggleLikeOnPost(postId);
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
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        unFollowUser: unFollowUserStub,
        followUser: followUserStub,
      });
      assert.isNull(await user.toggleFollowingAUser('naveen'));
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
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        unFollowUser: unFollowUserStub,
        followUser: followUserStub,
      });
      assert.isNull(await user.toggleFollowingAUser('naveen'));
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledOnceWithExactly(getFollowersStub, otherUserId);
      sinon.assert.calledOnceWithExactly(followUserStub, userId, otherUserId);
      sinon.assert.notCalled(unFollowUserStub);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
      });
      try {
        await user.toggleFollowingAUser('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('deletePost()', () => {
    it('should delete a post', async () => {
      const removePostStub = sinon.stub().resolves(null);
      const user = createUser({ removePost: removePostStub });
      assert.isNull(await user.deletePost(postId));
      sinon.assert.alwaysCalledWithExactly(removePostStub, postId);
    });

    it('should reject any error', async () => {
      const removePostStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ removePost: removePostStub });
      try {
        await user.deletePost(postId);
      } catch (err) {
        sinon.assert.alwaysCalledWithExactly(removePostStub, postId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getProfilePosts()', () => {
    it('should give both liked and posted posts of given user', async () => {
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getLikedPostsStub = sinon.stub().resolves(createDummyPosts());
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getUserResponsesStub = sinon.stub().resolves([]);
      const getRepostsByUserIdStub = sinon.stub().resolves([]);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getUserResponses: getUserResponsesStub,
        getAllResponses: getAllResponsesStub,
        getAllPostLikers: getAllPostLikersStub,
        getUserPosts: getUserPostsStub,
        getLikedPosts: getLikedPostsStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
        getReplyingTo: getReplyingToStub,
        getRepostsByUserId: getRepostsByUserIdStub,
      });
      const actual = await user.getProfilePosts({ userId });
      const expected = {
        likedPosts: [
          {
            repostCount: 0,
            ...userDetails,
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            responseCount: 1,
            message: 'post',
            postId: 1,
            postedAt: '2020-08-03',
            isBookmarked: false,
            hashtags: ['html'],
            mentions: [],
            isReposted: false,
          },
        ],
        posts: [
          {
            ...userDetails,
            repostCount: 0,
            initials: 'JS',
            isDeletable: true,
            responseCount: 1,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'post',
            postId: 1,
            postedAt: '2020-08-03',
            isBookmarked: false,
            hashtags: ['html'],
            mentions: [],
            isReposted: false,
          },
        ],
        responsePosts: [],
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getLikedPostsStub, userId);
      sinon.assert.calledTwice(getAllPostLikersStub);
    });

    it('should handle any error', async () => {
      const getUserPostsStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getUserPosts: getUserPostsStub });
      try {
        await user.getProfilePosts({ userId });
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getUserProfile()', () => {
    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getIdByUsername: getIdByUsernameStub });
      try {
        await user.getUserProfile('naveen');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      }
    });

    it('should resolve to user profile', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getBookmarksStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getLikedPostsStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getFollowingStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getUserResponsesStub = sinon.stub().resolves([]);
      const getRepostsByUserIdStub = sinon.stub().resolves([]);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getUserResponses: getUserResponsesStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getUserPosts: getUserPostsStub,
        getLikedPosts: getLikedPostsStub,
        getIdByUsername: getIdByUsernameStub,
        getFollowers: getFollowersStub,
        getFollowing: getFollowingStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
      });
      const actual = await user.getUserProfile(userDetails.username);
      const expected = {
        followers: [],
        following: [],
        initials: 'JS',
        imageUrl: 'url',
        isFollowing: false,
        likedPosts: [],
        loggedUser: 'john',
        fullName: userDetails.name,
        dob: '2020-08-03',
        joinedDate: '2020-08-03',
        name: 'john samuel',
        username: 'john',
        profileUrl: 'url',
        userId,
        responsePosts: [],
        posts: [
          {
            imageUrl: 'url',
            responseCount: 1,
            repostCount: 0,
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'post',
            postId: 1,
            postedAt: '2020-08-03',
            isBookmarked: false,
            hashtags: ['html'],
            mentions: [],
            name: 'john samuel',
            username: 'john',
            userId,
            dob: '2020-08-03',
            joinedDate: '2020-08-03',
            isReposted: false,
          },
        ],
      };
      const username = userDetails.username;
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, userId);
      sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getLikedPostsStub, userId);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, username);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
    });
  });

  describe('getSearchSuggestions()', () => {
    it('should resolve to searched user suggestions', async () => {
      const getMatchingUsersStub = sinon.stub().resolves([userDetails]);
      const user = createUser({ getMatchingUsers: getMatchingUsersStub });
      const actual = await user.getSearchSuggestions('@john');
      const expected = [{ ...userDetails, initials: 'JS' }];
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'john');
    });

    it('should give hashtag suggestions', async () => {
      const getMatchingHashtagsStub = sinon
        .stub()
        .resolves([{ hashtag: 'html' }]);
      const user = createUser({ getMatchingHashtags: getMatchingHashtagsStub });
      const actual = await user.getSearchSuggestions('#ht');
      const expected = ['html'];
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getMatchingHashtagsStub, 'ht');
    });

    it('should reject any error', async () => {
      const getMatchingUsersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getMatchingUsers: getMatchingUsersStub });
      try {
        await user.getSearchSuggestions('john');
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'john');
      }
    });
  });

  describe('getFollowingList()', () => {
    it('should return the list of following of a user', async () => {
      const getFollowersStub = sinon.stub().resolves([]);
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getFollowingStub = sinon.stub().resolves([userDetails]);
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
      });
      const actual = await user.getFollowingList('naveen');
      const expected = {
        followingList: [
          {
            initials: 'JS',
            isFollowingMe: false,
            name: 'john samuel',
            userId: 1,
            username: 'john',
            dob: '2020-08-03',
            joinedDate: '2020-08-03',
            imageUrl: 'url',
          },
        ],
        imageUrl: 'url',
        initials: 'JS',
        loggedUser: 'john',
        fullName: userDetails.name,
        profile: {
          imageUrl: 'url',
          initials: 'JS',
          isFollowingMe: false,
          name: 'john samuel',
          userId: 1,
          username: 'john',
          dob: '2020-08-03',
          joinedDate: '2020-08-03',
        },
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getFollowingStub, userId);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getIdByUsername: getIdByUsernameStub });
      try {
        await user.getFollowingList('naveen');
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
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getFollowers: getFollowersStub,
      });
      const actual = await user.getFollowersList('naveen');
      const expected = {
        followersList: [
          {
            initials: 'JS',
            isFollowingMe: true,
            name: 'john samuel',
            userId: 1,
            username: 'john',
            dob: '2020-08-03',
            imageUrl: 'url',
            joinedDate: '2020-08-03',
          },
        ],
        loggedUser: 'john',
        imageUrl: 'url',
        initials: 'JS',
        fullName: userDetails.name,
        profile: {
          initials: 'JS',
          imageUrl: 'url',
          isFollowingMe: true,
          name: 'john samuel',
          userId: 1,
          username: 'john',
          dob: '2020-08-03',
          joinedDate: '2020-08-03',
        },
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
    });

    it('should reject any error', async () => {
      const getIdByUsernameStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getIdByUsername: getIdByUsernameStub });
      try {
        await user.getFollowersList('naveen');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getPostLikers()', () => {
    it('should give users who liked a post based on postId', async () => {
      const getAllPostLikersStub = sinon.stub().resolves([userDetails]);
      const getFollowersStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllPostLikers: getAllPostLikersStub,
        getFollowers: getFollowersStub,
      });
      const actual = await user.getPostLikers(postId);
      const expected = {
        likers: [
          {
            ...userDetails,
            isFollowingMe: false,
          },
        ],
        imageUrl: 'url',
        initials: 'JS',
        loggedUser: userDetails.username,
        fullName: userDetails.name,
        postId,
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });

    it('should give error when posts table not found', async () => {
      const getAllPostLikersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getAllPostLikers: getAllPostLikersStub });
      try {
        await user.getPostLikers(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
      }
    });
  });

  describe('getValidMentions()', () => {
    it('should give list of valid users mentioned in post', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
      });
      assert.deepStrictEqual(await user.getValidMentions('hii @naveen'), [
        'naveen',
      ]);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });

    it('should give empty list when there is no valid users mentioned in post', async () => {
      const getIdByUsernameStub = sinon.stub().resolves({});
      const user = createUser({
        getIdByUsername: getIdByUsernameStub,
      });
      assert.deepStrictEqual(await user.getValidMentions('hii @naveen'), []);
      sinon.assert.calledOnceWithExactly(getIdByUsernameStub, 'naveen');
    });
  });

  describe('getHashtagRelatedPosts', () => {
    it('should give all posts with the given hashtag', async () => {
      const post = {
        postId,
        postedAt: '2020-08-03',
        message: 'hi #html',
        ...userDetails,
      };
      const getPostsByHashtagStub = sinon.stub().resolves([post]);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getBookmarksStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getPostsByHashtag: getPostsByHashtagStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
      });
      const expected = {
        posts: [
          {
            initials: 'JS',
            repostCount: 0,
            responseCount: 1,
            isDeletable: true,
            isLiked: true,
            isFollowingMe: false,
            likedUsers: [{ userId: 1 }],
            message: 'hi #html',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            isBookmarked: false,
            userId: 1,
            username: 'john',
            mentions: [],
            hashtags: ['html'],
            dob: '2020-08-03',
            joinedDate: '2020-08-03',
            imageUrl: 'url',
            isReposted: false,
          },
        ],
        loggedUser: userDetails.username,
        hashtag: 'html',
        imageUrl: 'url',
        initials: 'JS',
        fullName: userDetails.name,
      };
      const actual = await user.getHashtagRelatedPosts('html');
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getPostsByHashtagStub, 'html');
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
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getBookmarks: getBookmarksStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = {
        loggedUser: 'john',
        imageUrl: 'url',
        initials: 'JS',
        fullName: userDetails.name,
        posts: [
          {
            repostCount: 0,
            imageUrl: 'url',
            hashtags: ['html'],
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            responseCount: 1,
            isFollowingMe: false,
            mentions: [],
            message: 'post',
            name: 'john samuel',
            postId: 1,
            postedAt: '2020-08-03',
            isBookmarked: true,
            userId: 1,
            username: 'john',
            dob: '2020-08-03',
            joinedDate: '2020-08-03',
            isReposted: false,
          },
        ],
      };
      assert.deepStrictEqual(await user.getBookmarks(), expected);
      sinon.assert.calledTwice(getBookmarksStub);
    });

    it('should give empty list when no posts are bookmarked', async () => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const user = createUser({
        getBookmarks: getBookmarksStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      const expected = {
        posts: [],
        loggedUser: 'john',
        imageUrl: 'url',
        initials: 'JS',
        fullName: userDetails.name,
      };
      assert.deepStrictEqual(await user.getBookmarks(), expected);
      sinon.assert.calledOnce(getBookmarksStub);
    });

    it('should reject any error', async () => {
      const getBookmarksStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getBookmarks: getBookmarksStub });
      try {
        await user.getBookmarks();
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnce(getBookmarksStub);
      }
    });
  });

  describe('isBookmarked()', () => {
    it('should give true if bookmarked by user', async () => {
      const getBookmarksStub = sinon.stub().resolves(createDummyPosts());
      const user = createUser({ getBookmarks: getBookmarksStub });
      assert.isTrue(await user.isBookmarked(postId));
      sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
    });

    it('should give false if not bookmarked by user', async () => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const user = createUser({ getBookmarks: getBookmarksStub });
      assert.isFalse(await user.isBookmarked(postId));
      sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
    });

    it('should reject any error', async () => {
      const getBookmarksStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getBookmarks: getBookmarksStub });
      try {
        await user.isBookmarked(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
      }
    });
  });

  describe('toggleBookmarkOnPost()', () => {
    it('should add post to bookmarks if it is not bookmarked', async () => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const addBookmarkStub = sinon.stub().resolves();
      const user = createUser({
        getBookmarks: getBookmarksStub,
        addBookmark: addBookmarkStub,
      });
      assert.isUndefined(await user.toggleBookmarkOnPost(postId));
      sinon.assert.calledOnceWithExactly(addBookmarkStub, postId, userId);
      sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
    });

    it('should remove post from bookmarks if it is bookmarked', async () => {
      const getBookmarksStub = sinon.stub().resolves(createDummyPosts());
      const removeBookmarkStub = sinon.stub().resolves();
      const user = createUser({
        getBookmarks: getBookmarksStub,
        removeBookmark: removeBookmarkStub,
      });
      assert.isUndefined(await user.toggleBookmarkOnPost(postId));
      sinon.assert.calledOnceWithExactly(removeBookmarkStub, postId, userId);
      sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
    });

    it('should reject any error', async () => {
      const getBookmarksStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getBookmarks: getBookmarksStub });
      try {
        await user.toggleBookmarkOnPost(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
      }
    });
  });

  describe('saveResponse()', () => {
    it('should save a response', async () => {
      const savePostStub = sinon.stub().resolves(null);
      const user = createUser({ savePost: savePostStub });
      const content = 'hello';
      assert.isNull(await user.saveResponse(content, postId));
      sinon.assert.calledOnce(savePostStub);
    });

    it('should give error when table not found', async () => {
      const savePostStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ savePost: savePostStub });
      const content = 'hello';
      try {
        await user.saveResponse(content, postId);
      } catch (err) {
        sinon.assert.calledOnce(savePostStub);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });

  describe('getUserResponsesWithPosts()', () => {
    it('should give me all the responses and posts in order', async () => {
      const [dummyPost] = createDummyPosts();
      const getUserResponsesStub = sinon.stub().resolves([
        { postId, responseId: 2 },
        { postId, responseId: 3 },
      ]);
      const getPostStub = sinon.stub().resolves(dummyPost);
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves({ username: 'ram' });
      const getAllRepostsStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
        getAllResponses: getAllResponsesStub,
        getReplyingTo: getReplyingToStub,
        getUserResponses: getUserResponsesStub,
        getPost: getPostStub,
      });
      const expected = [
        {
          childPost: true,
          dob: '2020-08-03',
          hashtags: ['html'],
          imageUrl: 'url',
          repostCount: 0,
          initials: 'JS',
          isBookmarked: false,
          isDeletable: true,
          isFollowingMe: false,
          isLiked: true,
          joinedDate: '2020-08-03',
          likedUsers: [{ userId: 1 }],
          mentions: [],
          message: 'post',
          name: 'john samuel',
          parentPost: true,
          postId: 1,
          postedAt: '2020-08-03',
          replyingTo: 'ram',
          responseCount: 1,
          userId: 1,
          username: 'john',
          isReposted: false,
        },
        {
          repostCount: 0,
          childPost: true,
          dob: '2020-08-03',
          hashtags: ['html'],
          imageUrl: 'url',
          initials: 'JS',
          isBookmarked: false,
          isDeletable: true,
          isFollowingMe: false,
          isLiked: true,
          joinedDate: '2020-08-03',
          likedUsers: [{ userId: 1 }],
          mentions: [],
          message: 'post',
          name: 'john samuel',
          parentPost: true,
          postId: 1,
          postedAt: '2020-08-03',
          replyingTo: 'ram',
          responseCount: 1,
          userId: 1,
          username: 'john',
          isReposted: false,
        },
        {
          repostCount: 0,
          childPost: true,
          dob: '2020-08-03',
          hashtags: ['html'],
          imageUrl: 'url',
          initials: 'JS',
          isBookmarked: false,
          isDeletable: true,
          isFollowingMe: false,
          isLiked: true,
          joinedDate: '2020-08-03',
          likedUsers: [{ userId: 1 }],
          mentions: [],
          message: 'post',
          name: 'john samuel',
          parentPost: true,
          postId: 1,
          postedAt: '2020-08-03',
          replyingTo: 'ram',
          responseCount: 1,
          userId: 1,
          username: 'john',
          isReposted: false,
        },
      ];
      const actual = await user.getUserResponsesWithPosts(userId);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnce(getUserResponsesStub);
      sinon.assert.calledThrice(getAllPostLikersStub);
      sinon.assert.calledThrice(getReplyingToStub);
      sinon.assert.calledThrice(getHashtagsByPostIdStub);
      sinon.assert.calledThrice(getBookmarksStub);
      sinon.assert.calledThrice(getReplyingToStub);
      sinon.assert.callCount(getPostStub, 4);
    });
    it('should reject any error', async () => {
      const getUserResponsesStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getUserResponses: getUserResponsesStub });
      try {
        await user.getUserResponsesWithPosts(userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getUserResponsesStub, userId);
      }
    });
  });

  describe('updateUserDetails()', () => {
    const updateDetails = {
      name: 'newName',
      username: 'newUsername',
      dob: '2020-08-03',
      bio: 'newBio',
    };
    it('should update user details', async () => {
      const updateUserDetailsStub = sinon.stub().resolves();
      const user = createUser({
        updateUserDetails: updateUserDetailsStub,
      });
      assert.isUndefined(await user.updateUserDetails(updateDetails));
      sinon.assert.calledOnceWithExactly(
        updateUserDetailsStub,
        userId,
        updateDetails
      );
    });

    it('should reject any error', async () => {
      const updateUserDetailsStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        updateUserDetails: updateUserDetailsStub,
      });
      try {
        await user.updateUserDetails(updateDetails);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(
          updateUserDetailsStub,
          userId,
          updateDetails
        );
      }
    });
  });

  describe('toggleRepost()', () => {
    it('should add the repost to reposts table when the user is not reposted that', async () => {
      const getAllRepostsStub = sinon.stub().resolves([]);
      const undoRepostStub = sinon.stub().resolves();
      const repostStub = sinon.stub().resolves();
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        undoRepost: undoRepostStub,
        repost: repostStub,
      });
      assert.isUndefined(await user.toggleRepost(postId));
      sinon.assert.calledOnceWithExactly(getAllRepostsStub, postId);
      sinon.assert.calledOnceWithExactly(repostStub, postId, userId);
    });

    it('should remove the repost from reposts table when the user is  reposted that', async () => {
      const getAllRepostsStub = sinon.stub().resolves([{ userId, postId }]);
      const undoRepostStub = sinon.stub().resolves();
      const repostStub = sinon.stub().resolves();
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        undoRepost: undoRepostStub,
        repost: repostStub,
      });
      assert.isUndefined(await user.toggleRepost(postId));
      sinon.assert.calledOnceWithExactly(getAllRepostsStub, postId);
      sinon.assert.calledOnceWithExactly(undoRepostStub, postId, userId);
    });
  });

  describe('getRepostedUsers()', () => {
    it('should give users who liked a post based on postId', async () => {
      const getAllRepostsStub = sinon.stub().resolves([userDetails]);
      const getFollowersStub = sinon.stub().resolves([]);
      const user = createUser({
        getAllReposts: getAllRepostsStub,
        getFollowers: getFollowersStub,
      });
      const actual = await user.getRepostedUsers(postId);
      const expected = {
        repostedUsers: [
          {
            ...userDetails,
            isFollowingMe: false,
          },
        ],
        imageUrl: 'url',
        initials: 'JS',
        loggedUser: userDetails.username,
        postId,
        fullName: userDetails.name,
      };
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
      sinon.assert.calledOnceWithExactly(getAllRepostsStub, postId);
    });

    it('should give error when posts table not found', async () => {
      const getAllRepostsStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({ getAllPostLikers: getAllRepostsStub });
      try {
        await user.getPostLikers(postId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
        sinon.assert.calledOnceWithExactly(getAllRepostsStub, postId);
      }
    });
  });

  describe('updateUserList()', () => {
    it('should update given list of users', async () => {
      const getFollowersStub = sinon.stub().resolves([]);
      const user = createUser({
        getFollowers: getFollowersStub,
      });
      const actual = await user.updateUsersList([userDetails]);
      const expected = [
        {
          initials: 'JS',
          isFollowingMe: false,
          name: 'john samuel',
          userId: 1,
          username: 'john',
          dob: '2020-08-03',
          joinedDate: '2020-08-03',
          imageUrl: 'url',
        },
      ];
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
    });

    it('should reject any errors', async () => {
      const getFollowersStub = sinon.stub().rejects(expectedTableError);
      const user = createUser({
        getFollowers: getFollowersStub,
      });
      try {
        await user.updateUsersList([userDetails]);
      } catch (err) {
        sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
        assert.deepStrictEqual(err, expectedTableError);
      }
    });
  });
});
