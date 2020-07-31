const request = require('supertest');
const sinon = require('sinon');
const expressApp = require('../lib/expressApp');
const App = require('../lib/app');
const Auth = require('../lib/auth');

const OK_STATUS_CODE = 200;
const FOUND_STATUS_CODE = 302;

describe('#Handlers', () => {
  const userId = 1,
    postId = 1;

  const userDetails = {
    name: 'john samuel',
    username: 'john',
    userId: userId,
  };

  const createApp = function (datastore) {
    const app = new App(datastore);
    app.userId = userId;
    app.username = userDetails.username;
    app.fullName = userDetails.name;
    return app;
  };

  const createDummyPosts = function () {
    return [
      { postId: postId, userId: userId, postedAt: new Date(), message: 'hi' },
    ];
  };

  describe('GET /', () => {
    it('should serve the login page', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const app = createApp({ getUserDetails: getUserDetailsStub });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/')
        .expect(OK_STATUS_CODE)
        .expect(/POSTMIT/, done);
    });
  });

  describe('GET /home', () => {
    it('Should serve the Home Page with Posts', done => {
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const app = createApp({
        getUserDetails: getUserDetailsStub,
        getFollowing: getFollowingStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/home')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getFollowingStub);
        })
        .expect(/J/, done);
    });

    it('Should redirect to / when user is not logged in', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({ getUserDetails: getUserDetailsStub });
      request(expressApp)
        .get('/home')
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \//, done);
    });
  });

  describe('POST /add-new-post', () => {
    it('should response back with status true of newly added post', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const savePostStub = sinon.stub().resolves();
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        savePost: savePostStub,
      });
      request(expressApp)
        .post('/add-new-post')
        .send({ message: 'hi' })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(savePostStub);
        })
        .expect({ status: true }, done);
    });
  });

  describe('POST /toggleLike', () => {
    it('should like the given post when it is not liked', done => {
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const likePostStub = sinon.stub().resolves();
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        likePost: likePostStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      request(expressApp)
        .post('/toggleLike')
        .set('Cookie', ['userId=1'])
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getAllPostLikersStub);
          sinon.assert.calledOnceWithExactly(likePostStub, postId, userId);
        })
        .expect({ status: true }, done);
    });
    it('should unlike the given post when it is liked', done => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const unlikePostStub = sinon.stub().resolves();
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        unlikePost: unlikePostStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      request(expressApp)
        .post('/toggleLike')
        .set('Cookie', ['userId=1'])
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
          sinon.assert.calledOnceWithExactly(unlikePostStub, postId, userId);
        })
        .expect({ status: true }, done);
    });
  });

  describe('POST /search', () => {
    it('should give all the matching users for the search input', done => {
      const getMatchingUsersStub = sinon
        .stub()
        .resolves([{ username: 'john', name: 'john' }]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        getMatchingUsers: getMatchingUsersStub,
      });
      request(expressApp)
        .post('/search')
        .set('Cookie', ['userId=1'])
        .send({ searchInput: 'j' })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getMatchingUsersStub, 'j');
        })
        .expect([{ username: 'john', name: 'john', initials: 'J' }], done);
    });
  });

  describe('POST /save-user', () => {
    it('should save a user in database', done => {
      const userDetails = {
        githubUsername: 'hello',
        username: 'me',
        dob: '2001-02-18',
        bio: 'something',
        name: 'someone',
      };
      const saveUserStub = sinon.stub().resolves();
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        saveUser: saveUserStub,
        getIdByUsername: getIdByUsernameStub,
      });
      request(expressApp)
        .post('/save-user')
        .send(userDetails)
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(saveUserStub, userDetails);
        })
        .expect({ status: true }, done);
    });
  });

  describe('GET /user/:username', () => {
    it('should serve the Profile Page of searched user', done => {
      const userId = 2;
      const userDetails = { username: 'jani', name: 'jani', userId };
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getLikedPostsStub = sinon.stub().resolves([]);
      expressApp.locals.app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
      });
      request(expressApp)
        .get('/user/jani')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getIdByUsernameStub);
          sinon.assert.calledThrice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
          sinon.assert.calledWith(getUserDetailsStub, 2);
          sinon.assert.calledOnceWithExactly(getUserPostsStub, 2);
        })
        .expect(/jani/, done);
    });

    it('should serve the Profile Page of logged user when the searched user is logged user', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getLikedPostsStub = sinon.stub().resolves([]);
      expressApp.locals.app = createApp({
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
      });
      request(expressApp)
        .get('/user/john')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledThrice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
          sinon.assert.calledWith(getUserDetailsStub, userId);
          sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
        })
        .expect(/john/, done);
    });
  });

  describe('GET /auth', () => {
    it('should redirect me to the authorize url', done => {
      const app = createApp({});
      const auth = sinon.createStubInstance(Auth);
      auth.getAuthorizeUrl = sinon.stub().returns('/redirect');
      expressApp.locals.app = app;
      expressApp.locals.auth = auth;
      request(expressApp)
        .get('/auth')
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \/redirect/, done);
    });
  });

  describe('GET /callback', () => {
    it('should redirect to /home if userId cookie is present', done => {
      const getIdByGithubUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({
        getIdByGithubUsername: getIdByGithubUsernameStub,
      });
      const auth = sinon.createStubInstance(Auth);
      auth.fetchUserDetails = sinon.stub().resolves({ login: 'sukhiboi' });
      expressApp.locals.app = app;
      expressApp.locals.auth = auth;
      request(expressApp)
        .get('/callback?code="12345')
        .set('Cookie', ['userId=1'])
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \/home/, done);
    });
    it('should redirect to / any login error occurred', done => {
      const app = createApp({});
      const auth = sinon.createStubInstance(Auth);
      auth.fetchUserDetails = sinon.stub().resolves({ login: 'sukhiboi' });
      expressApp.locals.app = app;
      expressApp.locals.auth = auth;
      request(expressApp)
        .get('/callback?error="access denied')
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \//, done);
    });
    it('should render moreDetails page if iam a new user', done => {
      const getUserIdByGithubUsernameStub = sinon.stub().resolves();
      const app = createApp({
        getUserIdByGithubUsername: getUserIdByGithubUsernameStub,
      });
      const auth = sinon.createStubInstance(Auth);
      auth.fetchUserDetails = sinon.stub().resolves({ login: 'sukhiboi' });
      expressApp.locals.app = app;
      expressApp.locals.auth = auth;
      request(expressApp)
        .get('/callback?code="12345')
        .expect(OK_STATUS_CODE)
        .expect(/sukhiboi/, done);
    });
  });

  describe('POST /isUsernameAvailable', () => {
    it('should respond with true if the username is available', done => {
      const getIdByUsernameStub = sinon.stub().resolves();
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with false if the username is not available', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });

  describe('POST /toggleFollow', () => {
    it('should respond with true when the follow happened', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId: 1 });
      const getFollowersStub = sinon.stub().resolves([]);
      const followUserStub = sinon.stub().resolves(true);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        followUser: followUserStub,
        getFollowers: getFollowersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/toggleFollow')
        .set('Cookie', ['userId=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with true when the unfollow happened', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const getFollowersStub = sinon.stub().resolves([{ userId }]);
      const unFollowUserStub = sinon.stub().resolves(true);
      const app = createApp({
        getIdByUsername: getIdByUsernameStub,
        unFollowUser: unFollowUserStub,
        getFollowers: getFollowersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/toggleFollow')
        .set('Cookie', ['userId=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
  });

  describe('GET /user/:username/following', () => {
    it('should serve followings of given user', done => {
      const datastore = {
        getUserDetails: sinon.stub().resolves(userDetails),
        getFollowing: sinon.stub().resolves([{ userId: 2 }]),
        getFollowers: sinon.stub().resolves([]),
        getIdByUsername: sinon.stub().resolves({ userId }),
      };
      expressApp.locals.app = createApp(datastore);
      request(expressApp)
        .get('/user/john/following')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledThrice(datastore.getUserDetails);
          sinon.assert.calledOnce(datastore.getFollowing);
          sinon.assert.calledOnce(datastore.getIdByUsername);
        })
        .expect(/john/, done);
    });
  });

  describe('GET /user/:username/followers', () => {
    it('should serve followings of given user', done => {
      const datastore = {
        getUserDetails: sinon.stub().resolves(userDetails),
        getFollowing: sinon.stub().resolves([]),
        getFollowers: sinon.stub().resolves([{ userId: 2 }]),
        getIdByUsername: sinon.stub().resolves({ userId }),
      };
      expressApp.locals.app = createApp(datastore);
      request(expressApp)
        .get('/user/john/followers')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledThrice(datastore.getUserDetails);
          sinon.assert.calledTwice(datastore.getFollowers);
          sinon.assert.calledOnce(datastore.getIdByUsername);
        })
        .expect(/john/, done);
    });
  });

  describe('POST /deletePost', () => {
    it('should respond status true when deletion happened successfully', done => {
      const removePostStub = sinon.stub().resolves(postId);
      const app = createApp({ removePost: removePostStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/deletePost')
        .send({ postId })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond status false when deletion is not happened', done => {
      const removePostStub = sinon.stub().rejects(new Error('table not found'));
      const app = createApp({ removePost: removePostStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/deletePost')
        .send({ postId })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });

  describe('GET /post/:postId', () => {
    it('should response back with postDetails', done => {
      const expectedPost = {
        postId,
        userId,
        postedAt: new Date(),
        message: 'hello',
      };
      const getPostStub = sinon.stub().resolves(expectedPost);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const app = createApp({
        getPost: getPostStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get(`/post/${postId}`)
        .set('Cookie', ['userId=1'])
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getPostStub, postId);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
        })
        .expect(/hello/, done);
    });
  });

  describe('GET /post/:postId/likes', () => {
    it('should response back with user who like that post', done => {
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getFollowersStub = sinon.stub().resolves([]);
      const app = createApp({
        getAllPostLikers: getAllPostLikersStub,
        getUserDetails: getUserDetailsStub,
        getFollowers: getFollowersStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get(`/post/${postId}/likes`)
        .set('Cookie', ['userId=1'])
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getFollowersStub, userId);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
        })
        .expect(/john/, done);
    });
  });
});
