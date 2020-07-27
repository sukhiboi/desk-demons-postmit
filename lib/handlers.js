const serveHome = async function (request, response) {
  const userId = 1;
  const app = request.app.locals.app;
  const postsWithUserInitial = await app.getAllPosts(userId);
  response.render('index', postsWithUserInitial);
};

const serveProfilePage = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const userProfile = await app.getUserProfile(userId);
  response.render('profile', userProfile);
};

const serveSearchedUserProfile = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const { username } = request.params;
  const userProfile = await app.getSearchedUserProfile(userId, username);
  // console.log(userProfile);
  response.render('searchedUserProfile', userProfile);
};

const handleNewPost = async function (request, response) {
  const app = request.app.locals.app;
  const postDetails = { user_id: 1, message: request.body.message };
  const status = await app.addNewPost(postDetails);
  response.json({ status });
};

const likePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const status = await app.likePost(request.body.postId, userId);
  response.json({ status });
};

const unlikePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const status = await app.unlikePost(request.body.postId, userId);
  response.json({ status });
};

const search = async function (request, response) {
  const app = request.app.locals.app;
  const searchResult = await app.search(request.body.searchInput);
  response.send(searchResult);
};

module.exports = {
  serveHome,
  serveProfilePage,
  likePost,
  unlikePost,
  handleNewPost,
  search,
  serveSearchedUserProfile,
};
