const request = require('supertest');
const sinon = require('sinon');
const expressApp = require('../lib/routes');
const App = require('../lib/app');
const Auth = require('../lib/auth');

const OK_STATUS_CODE = 200;
const FOUND_STATUS_CODE = 302;

describe('#Handlers', () => {
  const userId = 1;
  const postId = 1;
  const hashtags = [{ hashtag: 'html' }];
  const responses = [
    { postId: 2, message: 'hi', postedAt: new Date(), userId },
  ];

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
      const getBookmarksStub = sinon.stub().resolves([]);
      const getFollowingStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getRepostsByUserIdStub = sinon.stub().resolves([]);
      const getAllRepostsStub = sinon.stub().resolves([]);
      const app = createApp({
        getReplyingTo: getReplyingToStub,
        getAllReposts: getAllRepostsStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getAllResponses: getAllResponsesStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getUserDetails: getUserDetailsStub,
        getFollowing: getFollowingStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getBookmarks: getBookmarksStub,
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
        .send({ searchInput: '@j' })
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
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllPostLikersStub = sinon.stub().resolves([]);
      const getUserPostsStub = sinon.stub().resolves(createDummyPosts());
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getLikedPostsStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves();
      const getUserResponsesStub = sinon.stub().resolves([]);
      const getRepostsByUserIdStub = sinon.stub().resolves([]);
      const getAllRepostsStub = sinon.stub().resolves([]);
      expressApp.locals.app = createApp({
        getAllReposts: getAllRepostsStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getUserResponses: getUserResponsesStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
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
      const getBookmarksStub = sinon.stub().resolves([]);
      const getFollowingStub = sinon.stub().resolves([]);
      const getFollowersStub = sinon.stub().resolves([]);
      const getLikedPostsStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves();
      const getUserResponsesStub = sinon.stub().resolves([]);
      const getRepostsByUserIdStub = sinon.stub().resolves([]);
      const getAllRepostsStub = sinon.stub().resolves([]);
      expressApp.locals.app = createApp({
        getAllReposts: getAllRepostsStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getUserResponses: getUserResponsesStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
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

  describe('GET /user/:username/likes', () => {
    let getIdByUsernameStub,
      getBookmarksStub,
      getAllPostLikersStub,
      getUserPostsStub,
      getFollowingStub,
      getFollowersStub,
      getLikedPostsStub,
      getAllResponsesStub,
      getHashtagsByPostIdStub,
      getReplyingToStub,
      getUserResponsesStub,
      getRepostsByUserIdStub,
      getAllRepostsStub;
    beforeEach(() => {
      getUserResponsesStub = sinon.stub().resolves([]);
      getIdByUsernameStub = sinon.stub().resolves({ userId });
      getBookmarksStub = sinon.stub().resolves([]);
      getAllPostLikersStub = sinon.stub().resolves([]);
      getUserPostsStub = sinon.stub().resolves([]);
      getFollowingStub = sinon.stub().resolves([]);
      getFollowersStub = sinon.stub().resolves([]);
      getLikedPostsStub = sinon.stub().resolves(createDummyPosts());
      getAllResponsesStub = sinon.stub().resolves(responses);
      getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      getReplyingToStub = sinon.stub().resolves();
      getRepostsByUserIdStub = sinon.stub().resolves([]);
      getAllRepostsStub = sinon.stub().resolves([]);
    });
    it('should serve the Profile Page of searched user with liked posts', done => {
      const userId = 2;
      const userDetails = { username: 'jani', name: 'jani', userId };
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getUserResponses: getUserResponsesStub,
        getAllReposts: getAllRepostsStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getReplyingTo: getReplyingToStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getAllResponses: getAllResponsesStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
      });
      request(expressApp)
        .get('/user/jani/likes')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getIdByUsernameStub);
          sinon.assert.calledThrice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
        })
        .expect(/jani/, done);
    });
    it('should serve the Profile Page of searched user with liked posts', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getRepostsByUserId: getRepostsByUserIdStub,
        getAllReposts: getAllRepostsStub,
        getUserResponses: getUserResponsesStub,
        getReplyingTo: getReplyingToStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getAllResponses: getAllResponsesStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
      });
      request(expressApp)
        .get('/user/john/likes')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getIdByUsernameStub);
          sinon.assert.calledThrice(getUserDetailsStub);
          sinon.assert.calledOnce(getUserPostsStub);
          sinon.assert.calledWith(getUserDetailsStub, userId);
          sinon.assert.calledOnceWithExactly(getUserPostsStub, userId);
        })
        .expect(/john/, done);
    });
  });

  describe('GET /user/:username/replies', () => {
    const [dummyPost] = createDummyPosts();
    let getIdByUsernameStub,
      getBookmarksStub,
      getAllPostLikersStub,
      getUserPostsStub,
      getFollowingStub,
      getFollowersStub,
      getLikedPostsStub,
      getAllResponsesStub,
      getHashtagsByPostIdStub,
      getReplyingToStub,
      getUserResponsesStub,
      getPostStub,
      getRepostsByUserIdStub,
      getAllRepostsStub;
    beforeEach(() => {
      getUserResponsesStub = sinon.stub().resolves([{ postId, responseId: 2 }]);
      getIdByUsernameStub = sinon.stub().resolves({ userId });
      getAllRepostsStub = sinon.stub().resolves([]);
      getBookmarksStub = sinon.stub().resolves([]);
      getAllPostLikersStub = sinon.stub().resolves([]);
      getUserPostsStub = sinon.stub().resolves([]);
      getFollowingStub = sinon.stub().resolves([]);
      getFollowersStub = sinon.stub().resolves([]);
      getLikedPostsStub = sinon.stub().resolves([]);
      getAllResponsesStub = sinon.stub().resolves(responses);
      getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      getReplyingToStub = sinon.stub().resolves();
      getPostStub = sinon.stub().resolves(dummyPost);
      getRepostsByUserIdStub = sinon.stub().resolves([]);
    });
    it('should serve the Profile Page of searched user with replied posts', done => {
      const userId = 2;
      const userDetails = { username: 'jani', name: 'jani', userId };
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getAllReposts: getAllRepostsStub,
        getUserResponses: getUserResponsesStub,
        getPost: getPostStub,
        getRepostsByUserId: getRepostsByUserIdStub,
        getReplyingTo: getReplyingToStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getAllResponses: getAllResponsesStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
      });
      request(expressApp)
        .get('/user/jani/replies')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getIdByUsernameStub);
          sinon.assert.callCount(getUserDetailsStub, 4);
          sinon.assert.calledOnce(getUserPostsStub);
        })
        .expect(/jani/, done);
    });
    it('should serve the Profile Page of searched user with replied posts', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      expressApp.locals.app = createApp({
        getAllReposts: getAllRepostsStub,
        getPost: getPostStub,
        getUserResponses: getUserResponsesStub,
        getReplyingTo: getReplyingToStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getAllResponses: getAllResponsesStub,
        getIdByUsername: getIdByUsernameStub,
        getUserDetails: getUserDetailsStub,
        getUserPosts: getUserPostsStub,
        getAllPostLikers: getAllPostLikersStub,
        getFollowing: getFollowingStub,
        getFollowers: getFollowersStub,
        getLikedPosts: getLikedPostsStub,
        getBookmarks: getBookmarksStub,
        getRepostsByUserId: getRepostsByUserIdStub,
      });
      request(expressApp)
        .get('/user/john/replies')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(getIdByUsernameStub);
          sinon.assert.callCount(getUserDetailsStub, 4);
          sinon.assert.calledOnce(getUserPostsStub);
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
    it('should respond with true if the same username is asked for', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'john' })
        .expect(OK_STATUS_CODE)
        .expect({ status: true }, done);
    });
    it('should respond with false if the username is not available', done => {
      const getIdByUsernameStub = sinon.stub().resolves({ userId });
      const app = createApp({ getIdByUsername: getIdByUsernameStub });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/isUsernameAvailable')
        .send({ username: 'sukhiboi' })
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
      const getBookmarksStub = sinon.stub().resolves([]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllRepostsStub = sinon.stub().resolves([]);
      const app = createApp({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getPost: getPostStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getBookmarks: getBookmarksStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get(`/post/${postId}`)
        .set('Cookie', ['userId=1'])
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getPostStub, postId);
          sinon.assert.calledThrice(getUserDetailsStub);
          sinon.assert.calledTwice(getAllPostLikersStub);
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

  describe('GET /hashtag/:hashtag', () => {
    it('should respond with posts related to given hashtag', done => {
      const post = {
        postId,
        postedAt: new Date(),
        userId,
        message: 'hi #html',
      };
      const getPostsByHashtagStub = sinon.stub().resolves([post]);
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getBookmarksStub = sinon.stub().resolves([]);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllRepostsStub = sinon.stub().resolves([]);
      const app = createApp({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getPostsByHashtag: getPostsByHashtagStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
        getBookmarks: getBookmarksStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/hashtag/html')
        .set('Cookie', ['userId=1'])
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getPostsByHashtagStub, 'html');
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
          sinon.assert.calledOnceWithExactly(getHashtagsByPostIdStub, postId);
        })
        .expect(/john/, done);
    });
  });

  describe('GET /user/bookmarks', () => {
    it('should give bookmarks page with all bookmarked posts', done => {
      const getBookmarksStub = sinon.stub().resolves(createDummyPosts());
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const getHashtagsByPostIdStub = sinon.stub().resolves(hashtags);
      const getAllResponsesStub = sinon.stub().resolves(responses);
      const getReplyingToStub = sinon.stub().resolves();
      const getAllRepostsStub = sinon.stub().resolves([]);
      const app = createApp({
        getAllReposts: getAllRepostsStub,
        getReplyingTo: getReplyingToStub,
        getAllResponses: getAllResponsesStub,
        getBookmarks: getBookmarksStub,
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
        getHashtagsByPostId: getHashtagsByPostIdStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/user/bookmarks')
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledTwice(getBookmarksStub);
          sinon.assert.calledTwice(getUserDetailsStub);
          sinon.assert.calledOnce(getAllPostLikersStub);
          sinon.assert.calledOnce(getHashtagsByPostIdStub);
        })
        .expect(/Bookmarks/, done);
    });
  });

  describe('POST /toggleBookmark', () => {
    it('should add the post in bookmarks if it is not bookmarked', done => {
      const getBookmarksStub = sinon.stub().resolves([]);
      const addBookmarkStub = sinon.stub().resolves();
      const app = createApp({
        getBookmarks: getBookmarksStub,
        addBookmark: addBookmarkStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/toggleBookmark')
        .send({ postId })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
          sinon.assert.calledOnceWithExactly(addBookmarkStub, postId, userId);
        })
        .expect({ status: true }, done);
    });

    it('should remove the post from bookmarks if it is bookmarked', done => {
      const getBookmarksStub = sinon.stub().resolves(createDummyPosts());
      const removeBookmarkStub = sinon.stub().resolves();
      const app = createApp({
        getBookmarks: getBookmarksStub,
        removeBookmark: removeBookmarkStub,
      });
      expressApp.locals.app = app;
      request(expressApp)
        .post('/toggleBookmark')
        .send({ postId })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getBookmarksStub, userId);
          sinon.assert.calledOnceWithExactly(
            removeBookmarkStub,
            postId,
            userId
          );
        })
        .expect({ status: true }, done);
    });
  });

  describe('GET /logout()', () => {
    it('should clear the userCookies', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const app = createApp({ getUserDetails: getUserDetailsStub });
      expressApp.locals.app = app;
      request(expressApp)
        .get('/logout')
        .set('Cookie', ['userId=1'])
        .expect(FOUND_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
        })
        .expect(/Redirect/, done);
    });
  });

  describe('POST /add-new-post', () => {
    it('should add the new response', done => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const savePostStub = sinon.stub().resolves();
      const addResponseStub = sinon.stub().resolves();
      expressApp.locals.app = createApp({
        getUserDetails: getUserDetailsStub,
        savePost: savePostStub,
        addResponse: addResponseStub,
      });
      request(expressApp)
        .post('/saveResponse')
        .send({ message: 'hi', postId })
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledOnce(savePostStub);
          sinon.assert.calledOnce(addResponseStub);
        })
        .expect({ status: true }, done);
    });
  });

  describe('POST /update-user()', () => {
    const updateDetails = {
      name: 'newName',
      username: 'newUsername',
      dob: new Date().toJSON(),
      bio: 'newBio',
    };
    it('should update the user details', done => {
      const updateUserDetailsStub = sinon.stub().resolves();
      expressApp.locals.app = createApp({
        updateUserDetails: updateUserDetailsStub,
      });
      request(expressApp)
        .post('/edit-profile')
        .send(updateDetails)
        .set('Cookie', ['userId=1'])
        .expect(OK_STATUS_CODE)
        .expect(() => {
          sinon.assert.calledWithExactly(
            updateUserDetailsStub,
            userId,
            updateDetails
          );
        })
        .expect({ status: true }, done);
    });
  });
});
