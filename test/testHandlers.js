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
  const createDummyPosts = function () {
    return [
      { postId: postId, userId: userId, postedAt: new Date(), message: 'hi' },
    ];
  };

  const getUserDetailsStub = sinon
    .stub()
    .resolves({ userId, name: 'john', username: 'john' });
  const isLikedByUserStub = sinon.stub().resolves(true);
  const getAllPostLikersStub = sinon.stub().resolves([]);
  const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
  const getFollowingStub = sinon.stub().resolves([]);
  const getFollowersStub = sinon.stub().resolves([]);
  const getIdByUsernameStub = sinon.stub().resolves({ userId });
  const getLikedPostsStub = sinon.stub().resolves([]);

  describe('GET /', () => {
    it('should serve the login page', done => {
      const app = new App({ getUserDetails: getUserDetailsStub });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/')
        .expect(OK_STATUS_CODE)
        .expect(/POSTMIT/, done);
    });
  });

  describe('GET /home', () => {
    it('Should serve the Home Page with Posts', done => {
      const app = new App({
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
      expressApp.locals.app = new App({ getUserDetails: getUserDetailsStub });
      request(expressApp)
        .get('/home')
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \//, done);
    });
  });

  describe.skip('GET /profile', () => {
    it('should serve the Profile Page with posts of that user', done => {
      expressApp.locals.app = new App({
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        isLikedByUser: isLikedByUserStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getIdByUsername: getIdByUsernameStub,
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

  describe('POST /add-new-post', () => {
    it('should response back with status true of newly added post', done => {
      const savePostStub = sinon.stub().resolves();
      expressApp.locals.app = new App({
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

  describe.skip('POST /like', () => {
    it('should like the given post when it is not liked', done => {
      const likePostStub = sinon.stub().resolves();
      const unlikePostStub = sinon.stub().resolves();
      expressApp.locals.app = new App({
        getUserDetails: getUserDetailsStub,
        unlikePost: unlikePostStub,
        likePost: likePostStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      request(expressApp)
        .post('/toggleLike')
        .set('Cookie', ['userId=1'])
        .send({ postId })
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
          sinon.assert.calledOnceWithExactly(likePostStub, postId, userId);
        })
        .expect({ status: true }, done);
    });
  });

  describe('POST /search', () => {
    it('should give all the matching users for the search input', done => {
      const getMatchingUsersStub = sinon
        .stub()
        .resolves([{ username: 'john', name: 'john' }]);
      expressApp.locals.app = new App({
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
      const saveUserStub = sinon.stub().resolves();
      expressApp.locals.app = new App({
        getUserDetails: getUserDetailsStub,
        saveUser: saveUserStub,
        getIdByUsername: getIdByUsernameStub,
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
        .expect({ status: true }, done);
    });
  });

  describe.skip('GET /user/:username', () => {
    it('should serve the Profile Page of searched user', done => {
      const user_id = 2;
      const userDetails = { username: 'jani', name: 'jani', user_id };
      const getUserIdByUsernameStub = sinon.stub().resolves({ user_id });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const isFollowerStub = sinon.stub().resolves(true);
      expressApp.locals.app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        isLikedByUser: isLikedByUserStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        isFollower: isFollowerStub,
      });
      request(expressApp)
        .get('/user/jani')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getUserIdByUsernameStub);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
          sinon.assert.calledWith(getUserDetailsStub, 2);
          sinon.assert.calledOnceWithExactly(getUserPostsStub, 2);
        })
        .expect(/jani/, done);
    });

    it('should serve the Profile Page of logged user when the searched user is logged user', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const isLikedByUserStub = sinon.stub().resolves(true);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const isFollowerStub = sinon.stub().resolves(true);
      expressApp.locals.app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        isLikedByUser: isLikedByUserStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        isFollower: isFollowerStub,
      });
      request(expressApp)
        .get('/user/john')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getUserIdByUsernameStub);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
          sinon.assert.calledWith(getUserDetailsStub, userId);
          sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
        })
        .expect(/john/, done);
    });
  });

  describe.skip('GET /auth', () => {
    it('should redirect me to the authorize url', done => {
      const app = new App({});
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

  describe.skip('GET /callback', () => {
    it('should redirect to /home if user_id cookie is present', done => {
      const getUserIdByGithubUsernameStub = sinon
        .stub()
        .resolves({ userId: userId });
      const app = new App({
        getUserIdByGithubUsername: getUserIdByGithubUsernameStub,
      });
      const auth = sinon.createStubInstance(Auth);
      auth.fetchUserDetails = sinon.stub().resolves({ login: 'sukhiboi' });
      expressApp.locals.app = app;
      expressApp.locals.auth = auth;
      request(expressApp)
        .get('/callback?code="12345')
        .expect(FOUND_STATUS_CODE)
        .expect(/Found. Redirecting to \/home/, done);
    });
    it('should redirect to / any login error occurred', done => {
      const app = new App({});
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
      const app = new App({
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

  describe.skip('POST /isUsernameAvailable', () => {
    it('should respond with true if the username is available', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves();
      const app = new App({ getUserIdByUsername: getUserIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with false if the username is not available', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const app = new App({ getUserIdByUsername: getUserIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });

  describe.skip('POST /follow', () => {
    it('should respond with true when the follower added successfully', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: 1 });
      const addFollowerStub = sinon.stub().resolves(true);
      const app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        addFollower: addFollowerStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/follow')
        .set('Cookie', ['user_id=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with false when follower added unsuccessful', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const addFollowerStub = sinon.stub().resolves(false);
      const app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        addFollower: addFollowerStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/follow')
        .set('Cookie', ['user_id=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });

  describe.skip('POST /unfollow', () => {
    it('should respond with true when the follower added successfully', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: 1 });
      const removeFollowerStub = sinon.stub().resolves(true);
      const app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        removeFollower: removeFollowerStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/unfollow')
        .set('Cookie', ['user_id=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with false when follower added unsuccessful', done => {
      const getUserIdByUsernameStub = sinon.stub().resolves({ userId: userId });
      const removeFollowerStub = sinon.stub().resolves(false);
      const app = new App({
        getUserIdByUsername: getUserIdByUsernameStub,
        removeFollower: removeFollowerStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/unfollow')
        .set('Cookie', ['user_id=1'])
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });

  describe.skip('GET /user/:username/following', () => {
    it('should serve followings of given user', done => {
      const followings = [{ name: 'samuel', username: 'samuel', userId: 2 }];
      const dbClient = {
        getUserDetails: sinon.stub().resolves(userDetails),
        getFollowing: sinon.stub().resolves(followings),
        getUserIdByUsername: sinon.stub().resolves({ userId: userId }),
      };
      expressApp.locals.app = new App(dbClient);
      request(expressApp)
        .get('/user/:john/following')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledTwice(dbClient.getUserDetails);
          sinon.assert.calledOnce(dbClient.getFollowing);
          sinon.assert.calledOnce(dbClient.getUserIdByUsername);
        })
        .expect(/john/, done);
    });
  });

  describe.skip('GET /user/:username/followers', () => {
    it('should serve followings of given user', done => {
      const followers = [{ userId: 2, name: 'samuel', username: 'samuel' }];
      const dbClient = {
        getUserDetails: sinon.stub().resolves(userDetails),
        getFollowers: sinon.stub().resolves(followers),
        getUserIdByUsername: sinon.stub().resolves({ userId: userId }),
        isFollower: sinon.stub().resolves(true),
      };
      expressApp.locals.app = new App(dbClient);
      request(expressApp)
        .get('/user/:john/followers')
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledTwice(dbClient.getUserDetails);
          sinon.assert.calledOnce(dbClient.getFollowers);
          sinon.assert.calledOnce(dbClient.getUserIdByUsername);
        })
        .expect(/john/, done);
    });
  });

  describe.skip('POST /deletePost', () => {
    it('should respond status true when deletion happened successfully', done => {
      const deletePostStub = sinon.stub().resolves(postId);
      const app = new App({ deletePost: deletePostStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/deletePost')
        .send({ postId })
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond status false when deletion is not happened', done => {
      const deletePostStub = sinon.stub().rejects(new Error('table not found'));
      const app = new App({ deletePost: deletePostStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/deletePost')
        .send({ postId })
        .set('Cookie', ['user_id=1'])
        .expect(OK_STATUS_CODE)
        .expect({ status: false }, done);
    });
  });
});
