const serveIndexPage = async function (request, response) {
  response.render('index');
};

const authorizeUser = function (request, response) {
  const auth = request.app.locals.auth;
  response.redirect(auth.getAuthorizeUrl());
};

const serveHome = async function (request, response) {
  const userId = request.cookies.user_id;
  const app = request.app.locals.app;
  const postsWithUserInitial = await app.getAllPosts(userId);
  response.render('home', postsWithUserInitial);
};

const serveProfilePage = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const userProfile = await app.getUserProfile(userId);
  response.render('profile', userProfile);
};

const serveSearchedUserProfile = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const { username } = request.params;
  const userProfile = await app.getSearchedUserProfile(userId, username);
  if (userId === userProfile.user_id) {
    response.render('profile', userProfile);
    return;
  }
  response.render('searchedUserProfile', userProfile);
};

const handleNewPost = async function (request, response) {
  const app = request.app.locals.app;
  const user_id = request.cookies.user_id;
  const postDetails = { user_id, message: request.body.message };
  const status = await app.addNewPost(postDetails);
  response.json({ status });
};

const likePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const status = await app.likePost(request.body.postId, userId);
  response.json({ status });
};

const unlikePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const status = await app.unlikePost(request.body.postId, userId);
  response.json({ status });
};

const follow = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const status = await app.follow(request.body.username, userId);
  response.json({ status });
};

const unfollow = async function (request, response) {
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const status = await app.unfollow(request.body.username, userId);
  response.json({ status });
};

const search = async function (request, response) {
  const app = request.app.locals.app;
  const searchResult = await app.search(request.body.searchInput);
  response.send(searchResult);
};

const serveFollowingList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
  const followingList = await app.getFollowingList(username, userId);
  response.render('following', followingList);
};

const serveFollowersList = async function (request, response) {
  const username = request.params.username;
  const app = request.app.locals.app;
  const userId = request.cookies.user_id;
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
  if (id && Number(id.user_id)) {
    response.cookie('user_id', id.user_id);
    return response.redirect('/home');
  }
  response.render('moreDetails', { username: login });
};

const saveUser = async function (request, response) {
  const app = request.app.locals.app;
  const id = await app.saveUser(request.body);
  if (id && Number(id.user_id)) {
    response.cookie('user_id', id.user_id);
  }
  response.json(id);
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
  const status = await app.deletePost(postId);
  response.json({ status });
};

module.exports = {
  serveIndexPage,
  handleUserProfile,
  serveHome,
  serveProfilePage,
  likePost,
  unlikePost,
  saveUser,
  handleNewPost,
  search,
  serveSearchedUserProfile,
  authorizeUser,
  checkUsernameAvailability,
  follow,
  unfollow,
  serveFollowingList,
  serveFollowersList,
  deletePost,
};
