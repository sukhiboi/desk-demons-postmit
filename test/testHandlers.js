const request = require('supertest');
const sinon = require('sinon');
const expressApp = require('../lib/expressApp');
const App = require('../lib/app');
const OK_STATUS_CODE = 200;

describe('#Handlers', () => {
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

  describe('GET /', () => {
    it('Should serve the Home Page with Posts', done => {
      const getAllPostsStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const app = new App({
        getAllPosts: getAllPostsStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/')
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getAllPostsStub);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
        })
        .expect(/john/, done);
    });
  });

  describe('GET /profile', () => {
    it('should serve the Profile Page with posts of that user', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const getPostsByUserIdStub = sinon.stub().resolves(createDummyPosts());
      expressApp.locals.app = new App({
        getUserDetails: getUserDetailsStub,
        getPostsByUserId: getPostsByUserIdStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      });
      request(expressApp)
        .get('/profile')
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnce(getPostsByUserIdStub);
          sinon.assert.calledWith(getUserDetailsStub, user_id);
          sinon.assert.calledOnceWithExactly(getPostsByUserIdStub, user_id);
        })
        .expect(/john/, done);
    });
  });

  describe('POST /add-new-post', () => {
    const dummyPost = { message: 'hi' };
    it('should response back with details of newly added post', done => {
      const [resolvedPost] = createDummyPosts();
      const addPostStub = sinon.stub().resolves(resolvedPost);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      expressApp.locals.app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      });
      request(expressApp)
        .post('/add-new-post')
        .send({ message: 'hi' })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(addPostStub, {
            user_id,
            message: 'hi',
          });
          sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
        })
        .expect(/hi/, done);
    });

    it('should response back with error message if an error occurred', done => {
      const addPostStub = sinon
        .stub()
        .rejects(new Error('posts table not found'));
      expressApp.locals.app = new App({ addPost: addPostStub });
      request(expressApp)
        .post('/add-new-post')
        .send(dummyPost)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(addPostStub);
          sinon.assert.calledOnceWithExactly(addPostStub, {
            user_id,
            ...dummyPost,
          });
        })
        .expect(/posts table not found/, done);
    });
  });

  describe('POST /like', () => {
    it('should like the given post when it is not liked', done => {
      const isLikedByUserStub = sinon.stub().resolves(false);
      const likePostStub = sinon.stub().resolves(true);
      expressApp.locals.app = new App({
        likePost: likePostStub,
        isLikedByUser: isLikedByUserStub,
      });
      request(expressApp)
        .post('/like')
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(isLikedByUserStub);
          sinon.assert.calledOnce(likePostStub);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
          sinon.assert.calledOnceWithExactly(likePostStub, postId, user_id);
        })
        .expect({ status: true }, done);
    });
    it('should not like the given post when it is liked', done => {
      const isLikedByUserStub = sinon.stub().resolves(true);
      const likePostStub = sinon.stub().resolves(false);
      expressApp.locals.app = new App({
        likePost: likePostStub,
        isLikedByUser: isLikedByUserStub,
      });
      request(expressApp)
        .post('/like')
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(isLikedByUserStub);
          sinon.assert.notCalled(likePostStub);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
        })
        .expect({ status: false }, done);
    });
  });

  describe('POST /unlike', () => {
    it('should unlike the given post when it is liked', done => {
      const isLikedByUserStub = sinon.stub().resolves(true);
      const unlikePostStub = sinon.stub().resolves(true);
      expressApp.locals.app = new App({
        unlikePost: unlikePostStub,
        isLikedByUser: isLikedByUserStub,
      });
      request(expressApp)
        .post('/unlike')
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(isLikedByUserStub);
          sinon.assert.calledOnce(unlikePostStub);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
          sinon.assert.calledOnceWithExactly(unlikePostStub, postId, user_id);
        })
        .expect({ status: true }, done);
    });
    it('should not unlike the given post when it is not liked', done => {
      const isLikedByUserStub = sinon.stub().resolves(false);
      const unlikePostStub = sinon.stub().resolves(false);
      expressApp.locals.app = new App({
        unlikePost: unlikePostStub,
        isLikedByUser: isLikedByUserStub,
      });
      request(expressApp)
        .post('/unlike')
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(isLikedByUserStub);
          sinon.assert.notCalled(unlikePostStub);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
        })
        .expect({ status: false }, done);
    });
  });
});
