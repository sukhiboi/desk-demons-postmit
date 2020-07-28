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
    it('should serve the login page', done => {
      const app = new App({});
      expressApp.locals.app = app;
      request(expressApp)
        .get('/')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(/POSTMIT/, done);
    });
  });

  describe('GET /home', () => {
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
        .get('/home')
        .set('Cookie', ['user_id=1'])
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
        .set('Cookie', ['user_id=1'])
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
    it('should response back with status true of newly added post', done => {
      const addPostStub = sinon.stub().resolves(true);
      expressApp.locals.app = new App({
        addPost: addPostStub,
      });
      request(expressApp)
        .post('/add-new-post')
        .send({ message: 'hi' })
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(addPostStub, {
            user_id,
            message: 'hi',
          });
        })
        .expect({ status: true }, done);
    });

    it('should response back with status false if an error occurred', done => {
      const addPostStub = sinon.stub().resolves(false);
      expressApp.locals.app = new App({ addPost: addPostStub });
      request(expressApp)
        .post('/add-new-post')
        .set('Cookie', ['user_id=1'])
        .send(dummyPost)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(addPostStub);
          sinon.assert.calledOnceWithExactly(addPostStub, {
            user_id,
            ...dummyPost,
          });
        })
        .expect({ status: false }, done);
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
        .set('Cookie', ['user_id=1'])
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
        .set('Cookie', ['user_id=1'])
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
        .set('Cookie', ['user_id=1'])
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
        .set('Cookie', ['user_id=1'])
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

  describe('POST /search', () => {
    it('should give all the matching users for the search input', done => {
      const getMatchingUsersStub = sinon
        .stub()
        .resolves([{ username: 'john' }]);
      expressApp.locals.app = new App({
        getMatchingUsers: getMatchingUsersStub,
      });
      request(expressApp)
        .post('/search')
        .set('Cookie', ['user_id=1'])
        .send({ searchInput: 'j' })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'j');
        })
        .expect([{ username: 'john', initials: 'J' }], done);
    });
  });

  describe('POST /save-user', () => {
    it('should save a user in database', done => {
      const saveUserStub = sinon.stub().resolves();
      const getUserIdByGithubUsernameStub = sinon.stub().resolves({ user_id });
      expressApp.locals.app = new App({
        saveUser: saveUserStub,
        getUserIdByGithubUsername: getUserIdByGithubUsernameStub,
      });
      const userDetails = {
        githubUsername: 'hello',
        username: 'me',
        dob: '2001-02-18',
        bio: 'something',
        name: 'someone',
      };
      request(expressApp)
        .post('/save-user')
        .send(userDetails)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(saveUserStub, userDetails);
        })
        .expect({ user_id }, done);
    });

    it('should response back with errMessage if saveUser fails', done => {
      const expectedError = new Error('table not found');
      const saveUserStub = sinon.stub().rejects(expectedError);
      const getUserIdByGithubUsernameStub = sinon.stub().resolves({ user_id });
      expressApp.locals.app = new App({
        saveUser: saveUserStub,
        getUserIdByGithubUsername: getUserIdByGithubUsernameStub,
      });
      const userDetails = {
        githubUsername: 'hello',
        username: 'me',
        dob: '2001-02-18',
        bio: 'something',
        name: 'someone',
      };
      request(expressApp)
        .post('/save-user')
        .send(userDetails)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(saveUserStub, userDetails);
        })
        .expect({ errMsg: expectedError.message }, done);
    });
  });

  describe('GET /profile/:username', () => {
    it('should serve the Profile Page of searched user', done => {
      const userDetails = { username: 'jani', name: 'jani', user_id: 2 };
      const getUserIdByUsernameStub = sinon.stub().resolves(2);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllLikedUsersStub = sinon.stub().resolves([]);
      const getPostsByUserIdStub = sinon.stub().resolves(createDummyPosts());
      expressApp.locals.app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getPostsByUserId: getPostsByUserIdStub,
        isLikedByUser: isLikedByUserStub,
        getAllLikedUsers: getAllLikedUsersStub,
      });
      request(expressApp)
        .get('/user/jani')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getUserIdByUsernameStub);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnce(getPostsByUserIdStub);
          sinon.assert.calledWith(getUserDetailsStub, 2);
          sinon.assert.calledOnceWithExactly(getPostsByUserIdStub, 2);
        })
        .expect(/jani/, done);
    });
  });

  it('should serve the Profile Page of logged user when the searched user is logged user', done => {
    const getUserIdByUsernameStub = sinon.stub().resolves(user_id);
    const getUserDetailsStub = sinon.stub().resolves(userDetails);
    const isLikedByUserStub = sinon.stub().resolves(true);
    const getAllLikedUsersStub = sinon.stub().resolves([]);
    const getPostsByUserIdStub = sinon.stub().resolves(createDummyPosts());
    expressApp.locals.app = new App({
      getUserIdByUsername: getUserIdByUsernameStub,
      getUserDetails: getUserDetailsStub,
      getPostsByUserId: getPostsByUserIdStub,
      isLikedByUser: isLikedByUserStub,
      getAllLikedUsers: getAllLikedUsersStub,
    });
    request(expressApp)
      .get('/user/john')
      .set('Cookie', ['user_id=1'])
      .expect(OK_STATUS_CODE)
      .expect(() => {
        sinon.assert.calledOnce(getUserIdByUsernameStub);
        sinon.assert.calledTwice(getUserDetailsStub);
        sinon.assert.calledOnce(getPostsByUserIdStub);
        sinon.assert.calledWith(getUserDetailsStub, user_id);
        sinon.assert.calledOnceWithExactly(getPostsByUserIdStub, user_id);
      })
      .expect(/john/, done);
  });
});
