const request = require('supertest');
const sinon = require('sinon');
const { app } = require('../lib/app');
const OK_STATUS_CODE = 200;

describe('Handlers', () => {
  const userId = 1;
  context('Request for Home Page', () => {
    it('Should serve the Home Page with Posts', (done) => {
      const userDetails = { name: 'john', username: 'john' };
      const getPosts = sinon.stub().resolves([{ id: 1, user_id: 1 }]);
      const getUserDetails = sinon.stub().resolves(userDetails);
      const isLikedByUser = sinon.stub().resolves(true);
      app.locals.dbClient = { getPosts, getUserDetails, isLikedByUser };
      request(app)
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
      app.locals.dbClient = { getUserDetails, getPostsByUserId };
      request(app)
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
      const postDetails = { user_id: 1, message: 'hi everyone' };
      const addPostStub = sinon.stub().resolves(postDetails);
      app.locals.dbClient = { addPost: addPostStub };
      request(app)
        .post('/add-new-post')
        .send(postDetails)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(addPostStub);
          sinon.assert.calledOnceWithExactly(addPostStub, postDetails);
        })
        .expect(/hi everyone/, done);
    });
  });

  context('Request for Liking a post', () => {
    it('Should should like the given post when it is not liked', (done) => {
      const likePost = sinon.stub().resolves(true);
      app.locals.dbClient = { likePost };
      request(app)
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
      app.locals.dbClient = { unlikePost };
      request(app)
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
