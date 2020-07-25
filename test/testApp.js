const sinon = require('sinon');
const { assert } = require('chai');
const App = require('../lib/app');

describe('#App', () => {
  const user_id = 1,
    postId = 1;

  const userDetails = {
    name: 'john samuel',
    username: 'john',
    user_id,
  };
  const createDummyPosts = function () {
    return [{ id: postId, user_id, posted_at: new Date(), message: 'hi' }];
  };

  const [dummyPost] = createDummyPosts();

  const expectedTableError = new Error('Error: post table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');

  describe('getPostDetails()', () => {
    const [dummyPost] = createDummyPosts();

    it('should resolve to postDetails of user with user_id', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const dbClient = {
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getPostDetails(user_id, dummyPost), {
        id: 1,
        initials: 'JS',
        isLiked: true,
        message: 'hi',
        name: 'john samuel',
        posted_at: 'a few seconds ago',
        user_id: 1,
        username: 'john',
        likedUsers: [],
      });
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, user_id, postId);
    });

    it('should resolve to empty array if getUsersDetails fails', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const isLikedByUserStub = sinon.stub().rejects(expectedTableError);
      const dbClient = {
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      };
      const app = new App(dbClient);
      try {
        await app.getPostDetails(user_id, dummyPost);
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
      }
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.notCalled(isLikedByUserStub);
    });

    it('should resolve to empty array if isLikedByUser fails', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().rejects(expectedTableError);
      const dbClient = {
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      };
      const app = new App(dbClient);
      try {
        await app.getPostDetails(user_id, dummyPost);
      } catch (err) {
        assert.deepStrictEqual(err, expectedTableError);
      }
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, user_id, postId);
    });
  });

  describe('getAllPosts()', () => {
    it('should resolve all posts with user details', async () => {
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      };
      const app = new App(dbClient);
      const expectedPosts = {
        posts: [
          {
            id: postId,
            user_id,
            initials: 'JS',
            name: 'john samuel',
            username: 'john',
            posted_at: 'a few seconds ago',
            isLiked: true,
            message: 'hi',
            likedUsers: [],
          },
        ],
        initials: 'JS',
      };
      assert.deepStrictEqual(await app.getAllPosts(user_id), expectedPosts);
      sinon.assert.calledWith(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, postId, user_id);
    });

    it('should resolve to empty array if getAllPosts fails', async () => {
      const getAllPostsStub = sinon.stub().rejects(expectedTableError);
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const isLikedByUserStub = sinon.stub().rejects(expectedTableError);
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getAllPosts(user_id), { posts: [] });
      sinon.assert.calledOnce(getAllPostsStub);
      sinon.assert.notCalled(getUserDetailsStub);
    });

    it('should not give any posts when getUsersDetails fails', async () => {
      const getAllPostsStub = sinon.stub().rejects(expectedTableError);
      const getUserDetailsStub = sinon.stub().resolves({});
      const isLikedByUserStub = sinon.stub().rejects();
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      };
      const app = new App(dbClient);
      const actual = await app.getAllPosts(user_id);
      assert.deepStrictEqual(actual, { posts: [] });
      sinon.assert.calledOnce(getAllPostsStub);
      sinon.assert.notCalled(isLikedByUserStub);
    });

    it('should resolve to empty array if isLikedByUser fails', async () => {
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().rejects(expectedTableError);
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getAllPosts(user_id), { posts: [] });
      sinon.assert.calledOnce(getAllPostsStub);
      sinon.assert.calledOnce(isLikedByUserStub);
    });

    it('should give initials from username when name is not existing', async () => {
      const userDetails = { username: 'john', user_id };
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      };
      const app = new App(dbClient);
      const expected = {
        posts: [
          {
            id: postId,
            user_id,
            initials: 'J',
            username: 'john',
            posted_at: 'a few seconds ago',
            isLiked: true,
            message: 'hi',
            likedUsers: [],
          },
        ],
        initials: 'J',
      };
      assert.deepStrictEqual(await app.getAllPosts(user_id), expected);
      sinon.assert.calledOnce(getAllPostsStub);
      sinon.assert.calledWithExactly(getUserDetailsStub, user_id);
    });
  });

  describe('getUserProfile()', () => {
    it('should resolve to user profile of a user with valid id', async () => {
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getPostsByUserIdStub = sinon.stub().resolves(createDummyPosts());
      const isLikedByUserStub = sinon.stub().resolves(false);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const dbClient = {
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        getPostsByUserId: getPostsByUserIdStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      };
      const app = new App(dbClient);
      const expected = {
        user_id,
        initials: 'JS',
        name: 'john samuel',
        username: 'john',
        likedPosts: [],
        posts: [
          {
            id: postId,
            message: 'hi',
            posted_at: 'a few seconds ago',
            initials: 'JS',
            name: 'john samuel',
            username: 'john',
            isLiked: false,
            user_id: 1,
            likedUsers: [],
          },
        ],
      };
      const actual = await app.getUserProfile(user_id);
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledWithExactly(getPostsByUserIdStub, user_id);
      sinon.assert.calledWithExactly(isLikedByUserStub, postId, user_id);
    });

    it('should handle the rejection of getPostsByUserId', async () => {
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getPostsByUserIdStub = sinon.stub().rejects(expectedTableError);
      const dbClient = {
        getUserDetails: getUserDetailsStub,
        getPostsByUserId: getPostsByUserIdStub,
        getAllPosts: getAllPostsStub,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getUserProfile(user_id), {
        user_id,
        initials: 'JS',
        name: 'john samuel',
        username: 'john',
        posts: [],
        likedPosts: [],
      });
      sinon.assert.calledWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledWithExactly(getPostsByUserIdStub, user_id);
    });

    it('should handle the rejection of getUserDetails', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const getPostsByUserIdStub = sinon.stub().resolves([]);
      const dbClient = {
        getUserDetails: getUserDetailsStub,
        getPostsByUserId: getPostsByUserIdStub,
      };
      const app = new App(dbClient);
      assert.deepStrictEqual(await app.getUserProfile(user_id), {
        errMsg: 'Invalid userId',
        posts: [],
        likedPosts: [],
      });
      sinon.assert.notCalled(getPostsByUserIdStub);
      sinon.assert.calledWithExactly(getUserDetailsStub, user_id);
    });
  });

  describe('addNewPost()', () => {
    it('should resolve to details of the new post', async () => {
      const addPostStub = sinon.stub().resolves(dummyPost);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      });
      assert.deepStrictEqual(await app.addNewPost(dummyPost), {
        name: 'john samuel',
        username: 'john',
        user_id: 1,
        initials: 'JS',
        id: 1,
        posted_at: 'a few seconds ago',
        message: 'hi',
        isLiked: true,
        likedUsers: [],
      });
      sinon.assert.calledOnceWithExactly(addPostStub, dummyPost);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, user_id, postId);
    });

    it('should resolves the errMsg if addPost fails', async () => {
      const addPostStub = sinon.stub().rejects(expectedTableError);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      assert.deepStrictEqual(await app.addNewPost(dummyPost), {
        errMsg: 'Error: post table not found',
      });
      sinon.assert.calledOnceWithExactly(addPostStub, dummyPost);
      sinon.assert.notCalled(getUserDetailsStub);
      sinon.assert.notCalled(isLikedByUserStub);
    });

    it('should resolves the errMsg if getUserDetails fails', async () => {
      const addPostStub = sinon.stub().resolves(dummyPost);
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      assert.deepStrictEqual(await app.addNewPost(dummyPost), {
        errMsg: 'Error: Invalid userId',
      });
      sinon.assert.calledOnceWithExactly(addPostStub, dummyPost);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.notCalled(isLikedByUserStub);
    });

    it('should resolves the errMsg if isLikedByUser fails', async () => {
      const addPostStub = sinon.stub().resolves(dummyPost);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().rejects(expectedTableError);
      const app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      assert.deepStrictEqual(await app.addNewPost(dummyPost), {
        errMsg: 'Error: post table not found',
      });
      sinon.assert.calledOnceWithExactly(addPostStub, dummyPost);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
      sinon.assert.calledOnceWithExactly(isLikedByUserStub, user_id, postId);
    });
  });

  describe('likePost', () => {
    it('should like the given post when it is not liked', async () => {
      const likePost = sinon.stub().resolves();
      const app = new App({ likePost });
      assert.isUndefined(await app.likePost(postId, user_id));
    });
  });

  describe('unlikePost', async () => {
    it('should unlike the given post when it is liked', async () => {
      const unlikePost = sinon.stub().resolves();
      const app = new App({ unlikePost });
      assert.isUndefined(await app.unlikePost(postId, user_id));
    });
  });
});
