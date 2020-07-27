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

const handleNewPost = async function (request, response) {
  const app = request.app.locals.app;
  const postDetails = { user_id: 1, message: request.body.message };
  const newPost = await app.addNewPost(postDetails);
  response.json(newPost);
};

const likePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const status = await app.likePost(request.body.postId, userId);
  response.send({ status });
};

const unlikePost = async function (request, response) {
  const app = request.app.locals.app;
  const userId = 1;
  const status = await app.unlikePost(request.body.postId, userId);
  response.send({ status });
};

module.exports = {
  serveHome,
  serveProfilePage,
  likePost,
  unlikePost,
  handleNewPost,
};
