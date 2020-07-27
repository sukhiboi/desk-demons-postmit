const { fetchUserDetails } = require('./auth');

const serveIndexPage = async function (request, response) {
  response.render('index');
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
  const userId = 1;
  const { username } = request.params;
  const userProfile = await app.getSearchedUserProfile(userId, username);
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

const search = async function (request, response) {
  const app = request.app.locals.app;
  const searchResult = await app.search(request.body.searchInput);
  response.send(searchResult);
};

const handleUserProfile = async function (request, response) {
  const code = request.query.code;
  const { login } = await fetchUserDetails(code);
  const app = request.app.locals.app;
  const isValidUser = await app.isValidUser(login);
  if (isValidUser) {
    return response.redirect('/home');
  }
  response.render('moreDetails', { username: login });
};

const saveUser = async function (request, response) {
  const app = request.app.locals.app;
  const id = await app.saveUser(request.body);
  if (Number(id.user_id)) {
    response.cookie('user_id', id.user_id);
  }
  response.json(id);
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
};
