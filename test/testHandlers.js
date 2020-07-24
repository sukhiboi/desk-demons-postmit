const request = require('supertest');
const sinon = require('sinon');
const { assert } = require('chai');
const { expressApp } = require('../lib/expressApp');
// const app = require('../lib/app');
const { App } = require('../lib/app');
const OK_STATUS_CODE = 200;

describe('Handlers', () => {
  const userId = 1;
  context('Request for Home Page', () => {
    it('Should serve the Home Page with Posts', (done) => {
      const userDetails = { name: 'john', username: 'john' };
      const getPosts = sinon.stub().resolves([{ id: 1, user_id: 1 }]);
      const getUserDetails = sinon.stub().resolves(userDetails);
      const isLikedByUser = sinon.stub().resolves(true);
      const app = new App({ getPosts, getUserDetails, isLikedByUser });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/')
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getPosts);
          sinon.assert.calledOnce(getUserDetails);
          sinon.assert.calledOnceWithExactly(getUserDetails, userId);
        })
        .expect(/john/, done);
    });
  });

  context('Request for  Profile Page', () => {
    it('Should serve the Profile Page with posts of that user', (done) => {
      const userDetails = { name: 'john', username: 'john' };
      const getUserDetails = sinon.stub().resolves(userDetails);
      const getPostsByUserId = sinon.stub().resolves([{ message: 'hi' }]);
      expressApp.locals.app = new App({
        getUserDetails,
        getPostsByUserId,
      });
      request(expressApp)
        .get('/profile')
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getUserDetails);
          sinon.assert.calledOnce(getPostsByUserId);
          sinon.assert.calledOnceWithExactly(getUserDetails, userId);
          sinon.assert.calledOnceWithExactly(getPostsByUserId, userId);
        })
        .expect(/john/, done);
    });
  });

  context('Request for adding a new post', () => {
    it('should add a new post to database', (done) => {
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
      expressApp.locals.app = new App({
        addPost: addPostStub,
        getUserDetails: getUserDetailsStub,
        isLikedByUser: isLikedByUserStub,
      });
      const expectedResponse = {
        ...postDetails,
        id: postId,
        isLiked: true,
        posted_at: 'a few seconds ago',
        initials: 'S',
        name: 'sukhi',
      };
      request(expressApp)
        .post('/add-new-post')
        .send(postDetails)
        .expect(OK_STATUS_CODE)
        .expect((response) => {
          assert.deepStrictEqual(response.body, expectedResponse);
          sinon.assert.calledOnceWithExactly(addPostStub, postDetails);
          sinon.assert.calledOnceWithExactly(getUserDetailsStub, user_id);
          sinon.assert.calledOnceWithExactly(
            isLikedByUserStub,
            user_id,
            postId
          );
        })
        .expect(/hi everyone/, done);
    });

    it('should return error message if an error occurred', (done) => {
      const postDetails = { user_id: 1, message: 'hi everyone' };
      const addPostStub = sinon
        .stub()
        .rejects(new Error('posts table not found'));
      expressApp.locals.app = new App({ addPost: addPostStub });
      request(expressApp)
        .post('/add-new-post')
        .send(postDetails)
        .expect(OK_STATUS_CODE)
        .expect((response) => {
          assert.deepStrictEqual(response.body, {
            errMsg: 'posts table not found',
          });
          sinon.assert.calledOnce(addPostStub);
          sinon.assert.calledOnceWithExactly(addPostStub, postDetails);
        })
        .expect(/posts table not found/, done);
    });
  });

  context('Request for Liking a post', () => {
    it('Should should like the given post when it is not liked', (done) => {
      const likePost = sinon.stub().resolves(true);
      expressApp.locals.app = new App({ likePost });
      request(expressApp)
        .post('/like')
        .send({ postId: 5 })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(likePost);
          sinon.assert.calledOnceWithExactly(likePost, 5, userId);
        })
        .expect({}, done);
    });
  });

  context('Request for Unliking a post', () => {
    it('Should should unlike the given post when it is liked', (done) => {
      const unlikePost = sinon.stub().resolves(true);
      expressApp.locals.app = new App({ unlikePost });
      request(expressApp)
        .post('/unlike')
        .send({ postId: 5 })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(unlikePost);
          sinon.assert.calledOnceWithExactly(unlikePost, 5, userId);
        })
        .expect({}, done);
    });
  });
});
