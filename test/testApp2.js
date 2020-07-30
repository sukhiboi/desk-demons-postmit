const sinon = require('sinon');
const { assert } = require('chai');
const App = require('../lib/app');

describe('#App', () => {
  const userId = 1;
  const postId = 1;

  const userDetails = { name: 'john samuel', username: 'john', userId };

  const createDummyPosts = function () {
    return [{ postId: postId, userId, postedAt: new Date(), message: 'hi' }];
  };

  const createApp = function (datastore) {
    const app = new App(datastore);
    app.userId = userId;
    app.username = userDetails.username;
    app.fullName = userDetails.name;
    return app;
  };
  // const [dummyPost] = createDummyPosts();

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
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
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
    it('should resolve to the feedsposts of user', async () => {
      const getFollowingStub = sinon.stub().resolves([{ userId: 2 }]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const app = createApp({
        getFollowing: getFollowingStub,
        getUserPosts: getUserPostsStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
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
          },
          {
            initials: 'JS',
            isDeletable: true,
            isLiked: true,
            likedUsers: [{ userId: 1 }],
            message: 'hi',
            name: 'john samuel',
            postId: 1,
            postedAt: 'Invalid date',
            userId: 1,
            username: 'john',
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
});
