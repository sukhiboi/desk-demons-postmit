const serveIndexPage = async function (request, response) {
  response.render('index');
};

const authorizeUser = function (request, response) {
  const auth = request.app.locals.auth;
  response.redirect(auth.getAuthorizeUrl());
};

const serveHome = async function (request, response) {
  const userId = request.cookies.userId;
  const app = request.app.locals.newApp;
  const postsWithUserInitial = await app.getUserFeed(userId);
  response.render('home', postsWithUserInitial);
};

const serveUserProfile = async function (request, response) {
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await app.getUserProfile(userId, username);
  if (userId === userProfile.userId) {
    response.render('profile', userProfile);
    return;
  }
  response.render('searchedUserProfile', userProfile);
};

const handleNewPost = async function (request, response) {
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  const message = request.body.message;
  await app.savePost(userId, message);
  response.json({ status: true });
};

const toggleLike = async function (request, response) {
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  await app.toggleLikeOnPost(request.body.postId, userId);
  response.json({ status: true });
};

const toggleFollowUnFollow = async function (request, response) {
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  const username = request.body.username;
  await app.toggleFollowingAUser(userId, username);
  response.json({ status: true });
};

const search = async function (request, response) {
  const app = request.app.locals.newApp;
  const searchInput = request.body.searchInput;
  const searchResult = await app.getUserSuggestions(searchInput);
  response.send(searchResult);
};

const serveFollowingList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  const followingList = await app.getFollowingList(username, userId);
  response.render('following', followingList);
};

const serveFollowersList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.newApp;
  const userId = request.cookies.userId;
  const followerList = await app.getFollowersList(username, userId);
  response.render('following', followerList);
};

const handleUserProfile = async function (request, response) {
  const { code, error } = request.query;
  if (error) {
    return response.redirect('/');
  }
  const { auth, app } = request.app.locals;
  const { login } = await auth.fetchUserDetails(code);
  const id = await app.getUserId(login);
  if (id && Number(id.userId)) {
    response.cookie('userId', id.userId);
    return response.redirect('/home');
  }
  response.render('moreDetails', { username: login });
};

const saveUser = async function (request, response) {
  const app = request.app.locals.newApp;
  const id = await app.saveUser(request.body);
  response.cookie('userId', id.userId);
  response.json({ status: true });
};

const checkUsernameAvailability = async function (request, response) {
  const username = request.body.username;
  const app = request.app.locals.newApp;
  const status = await app.isUsernameAvailable(username);
  response.json({ status });
};

const deletePost = async function (request, response) {
  const postId = request.body.postId;
  const app = request.app.locals.newApp;
  await app.deletePost(postId);
  response.json({ status: true });
};

module.exports = {
  serveIndexPage,
  handleUserProfile,
  serveHome,
  saveUser,
  handleNewPost,
  search,
  serveUserProfile,
  authorizeUser,
  checkUsernameAvailability,
  toggleFollowUnFollow,
  serveFollowingList,
  serveFollowersList,
  deletePost,
  toggleLike,
};
