const serveIndexPage = async function (request, response) {
  response.render('index');
};

const authorizeUser = function (request, response) {
  const auth = request.app.locals.auth;
  response.redirect(auth.getAuthorizeUrl());
};

const serveHome = async function (request, response) {
  const app = request.app.locals.app;
  const postsWithUserInitial = await app.getUserFeed();
  response.render('home', postsWithUserInitial);
};

const serveUserProfile = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.userId;
  const { username } = request.params;
  const userProfile = await app.getUserProfile(username);
  if (userId === userProfile.userId) {
    response.render('profile', userProfile);
    return;
  }
  response.render('searchedUserProfile', userProfile);
};

const handleNewPost = async function (request, response) {
  const app = request.app.locals.app;
  const message = request.body.message;
  await app.savePost(message);
  response.json({ status: true });
};

const expandPost = async function (request, response) {
  const app = request.app.locals.app;
  const postId = Number(request.params.postId);
  const postDetails = await app.getPostDetails(postId);
  response.render('postPage', postDetails);
};

const getPostLikers = async function (request, response) {
  const app = request.app.locals.app;
  const postId = Number(request.params.postId);
  const userList = await app.getPostLikers(postId);
  response.render('userList', userList);
};

const toggleLike = async function (request, response) {
  const app = request.app.locals.app;
  await app.toggleLikeOnPost(request.body.postId);
  response.json({ status: true });
};

const toggleFollowUnFollow = async function (request, response) {
  const app = request.app.locals.app;
  const username = request.body.username;
  await app.toggleFollowingAUser(username);
  response.json({ status: true });
};

const search = async function (request, response) {
  const app = request.app.locals.app;
  const searchInput = request.body.searchInput;
  const searchResult = await app.getUserSuggestions(searchInput);
  response.send(searchResult);
};

const serveFollowingList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const followingList = await app.getFollowingList(username);
  response.render('following', followingList);
};

const serveFollowersList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const followerList = await app.getFollowersList(username);
  response.render('following', followerList);
};

const handleUserProfile = async function (request, response) {
  const { code, error } = request.query;
  if (error) {
    return response.redirect('/');
  }
  const { auth, app } = request.app.locals;
  const { login } = await auth.fetchUserDetails(code);
  const id = await app.getUserId(login).catch(() => {});
  if (id && Number(id.userId)) {
    response.cookie('userId', id.userId);
    return response.redirect('/home');
  }
  response.render('moreDetails', { username: login });
};

const saveUser = async function (request, response) {
  const app = request.app.locals.app;
  const id = await app.saveUser(request.body);
  response.cookie('userId', id.userId);
  response.json({ status: true });
};

const checkUsernameAvailability = async function (request, response) {
  const username = request.body.username;
  const app = request.app.locals.app;
  const status = await app.isUsernameAvailable(username);
  response.json({ status });
};

const deletePost = async function (request, response) {
  const postId = request.body.postId;
  const app = request.app.locals.app;
  try {
    await app.deletePost(postId);
    response.json({ status: true });
  } catch (err) {
    response.json({ status: false });
  }
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
  getPostLikers,
  checkUsernameAvailability,
  toggleFollowUnFollow,
  serveFollowingList,
  serveFollowersList,
  deletePost,
  toggleLike,
  expandPost,
};
