const sinon = require('sinon');
const { assert } = require('chai');
const { App } = require('../lib/app');

describe('App', () => {
  describe('getPosts', () => {
    const userId = 1;
    it('should give all the posts with user details', async () => {
      const userDetails = {
        name: 'john samuel',
        username: 'john',
      };
      const posts = [{ id: 1, user_id: 1, posted_at: new Date() }];
      const getPostsStub = sinon.stub().resolves(posts);
      const getUserDetails = sinon.stub().resolves(userDetails);
      const isLikedByUser = sinon.stub().resolves(true);
      const dbClient = {
        getPosts: getPostsStub,
        getUserDetails,
        isLikedByUser,
      };
      const app = new App(dbClient);
      const expected = [
        {
          id: 1,
          user_id: 1,
          initials: 'JS',
          name: 'john samuel',
          username: 'john',
          posted_at: 'a few seconds ago',
          isLiked: true,
        },
      ];
      assert.deepStrictEqual(await app.getPosts(userId), expected);
      sinon.assert.calledOnce(getPostsStub);
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.calledWithExactly(getUserDetails, userId);
      sinon.assert.calledWithExactly(isLikedByUser, 1, userId);
    });

    it('should give an empty array when the dbClient rejects getPosts', async () => {
      const getPostsStub = sinon.stub().rejects('no table found');
      const getUserDetails = sinon.stub().resolves({});
      const dbClient = {
        getPosts: getPostsStub,
        getUserDetails,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getPosts(userId), []);
      sinon.assert.calledOnce(getPostsStub);
      sinon.assert.notCalled(getUserDetails);
    });

    it('should give an empty array when the dbClient rejects getUsers', async () => {
      const invalidUserId = 11;
      const getPostsStub = sinon.stub().resolves([{ user_id: invalidUserId }]);
      const getUserDetails = sinon.stub().rejects('no table found');
      const dbClient = {
        getPosts: getPostsStub,
        getUserDetails,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getPosts(userId), []);
      sinon.assert.calledOnce(getPostsStub);
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.calledWithExactly(getUserDetails, invalidUserId);
    });

    it('should give an empty array when the dbClient rejects isLikedByUser', async () => {
      const getPostsStub = sinon.stub().resolves([{ user_id: 1 }]);
      const getUserDetails = sinon.stub().resolves({});
      const isLikedByUser = sinon.stub().rejects('no table found');
      const dbClient = {
        getPosts: getPostsStub,
        getUserDetails,
        isLikedByUser,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getPosts(userId), []);
      sinon.assert.calledOnce(getPostsStub);
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.calledWithExactly(getUserDetails, 1);
    });

    it('should give initials from username when name is not existing', async () => {
      const userDetails = { username: 'john' };
      const posts = [{ id: 1, user_id: 1, posted_at: '2020-05-24' }];
      const getPostsStub = sinon.stub().resolves(posts);
      const getUserDetails = sinon.stub().resolves(userDetails);
      const isLikedByUser = sinon.stub().resolves(true);
      const dbClient = {
        getPosts: getPostsStub,
        getUserDetails,
        isLikedByUser,
      };
      const app = new App(dbClient);
      const expected = [
        {
          id: 1,
          user_id: 1,
          initials: 'J',
          username: 'john',
          posted_at: 'May 24, 2020',
          isLiked: true,
        },
      ];
      assert.deepStrictEqual(await app.getPosts(userId), expected);
      sinon.assert.calledOnce(getPostsStub);
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.calledWithExactly(getUserDetails, userId);
    });
  });

  describe('getUserProfile', () => {
    const user_id = 1;

    it('should give profile of user by userId', async () => {
      const userDetails = { user_id, name: 'john', username: 'john' };
      const getUserDetails = sinon.stub().resolves(userDetails);
      const getPostsByUserId = sinon
        .stub()
        .resolves([{ message: 'hi', posted_at: '2020-02-21 12:45:16' }]);
      const isLikedByUser = sinon.stub().resolves(true);
      const dbClient = { getUserDetails, getPostsByUserId, isLikedByUser };
      const app = new App(dbClient);
      const expected = {
        user_id,
        initials: 'J',
        name: 'john',
        username: 'john',
        posts: [
          {
            message: 'hi',
            posted_at: 'Feb 21, 2020',
            initials: 'J',
            name: 'john',
            username: 'john',
            isLiked: true,
            user_id: 1,
          },
        ],
      };
      assert.deepStrictEqual(await app.getUserProfile(user_id), expected);
      sinon.assert.calledTwice(getUserDetails);
      sinon.assert.calledOnce(getPostsByUserId);
      sinon.assert.calledWithExactly(getUserDetails, user_id);
      sinon.assert.calledWithExactly(getPostsByUserId, user_id);
    });

    it('should handle the rejection of getPostsByUserId', async () => {
      const userDetails = { user_id: 1, name: 'john', username: 'john' };
      const getUserDetails = sinon.stub().resolves(userDetails);
      const getPostsByUserId = sinon.stub().rejects('posts table not found');
      const dbClient = { getUserDetails, getPostsByUserId };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getUserProfile(user_id), {
        user_id,
        initials: 'J',
        name: 'john',
        username: 'john',
        posts: [],
      });
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.calledOnce(getPostsByUserId);
      sinon.assert.calledWithExactly(getUserDetails, user_id);
      sinon.assert.calledWithExactly(getPostsByUserId, user_id);
    });

    it('should handle the rejection of getUserDetails', async () => {
      const getUserDetails = sinon.stub().rejects('userId not found');
      const getPostsByUserId = sinon.stub().resolves([]);
      const dbClient = { getUserDetails, getPostsByUserId };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getUserProfile(user_id), {
        errMsg: 'Invalid userId',
        posts: [],
      });
      sinon.assert.calledOnce(getUserDetails);
      sinon.assert.notCalled(getPostsByUserId);
      sinon.assert.calledWithExactly(getUserDetails, user_id);
      sinon.assert.notCalled(getPostsByUserId);
    });
  });

  describe('addNewPost', () => {
    it('should add new post to database', async () => {
      const user_id = 1;
      const postDetails = {
        user_id,
        message: 'hi everyone',
      };
      const postId = 3;
      const addPostStub = sinon
        .stub()
        .resolves([{ ...postDetails, id: postId }]);
      const getUserDetailsStub = sinon
        .stub()
        .resolves({ user_id, name: 'sukhi' });
      const isLikedByUserStub = sinon.stub().resolves(true);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      assert.deepStrictEqual(await app.addNewPost(postDetails), {
        ...postDetails,
        id: postId,
        isLiked: true,
        posted_at: 'a few seconds ago',
        initials: 'S',
        name: 'sukhi',
      });
      sinon.assert.calledWithExactly(addPostStub, postDetails);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, user_id, postId);
    });

    it('should return a errMsg when an error occur while adding a post', async () => {
      const user_id = 1;
      const postDetails = {
        user_id,
        message: 'hi everyone',
      };
      const addPostStub = sinon
        .stub()
        .rejects(new Error('posts table not found'));

      const getUserDetailsStub = sinon
        .stub()
        .resolves({ user_id, name: 'sukhi' });
      const isLikedByUserStub = sinon.stub().resolves(true);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      assert.deepStrictEqual(await app.addNewPost(postDetails), {
        errMsg: 'posts table not found',
      });
      sinon.assert.calledWithExactly(addPostStub, postDetails);
      sinon.assert.notCalled(getUserDetailsStub);
      sinon.assert.notCalled(isLikedByUserStub);
    });
  });

  context('likePost', () => {
    it('Should should like the given post when it is not liked', async () => {
      const likePost = sinon.stub().resolves(true);
      const app = new App({ likePost });
      assert.isUndefined(await app.likePost(1, 1));
    });

    it('Should should like the given post when it is not liked', async () => {
      const unlikePost = sinon.stub().resolves(true);
      const app = new App({ unlikePost });
      assert.isUndefined(await app.unlikePost(1, 1));
    });
  });
});
