const { getPosts, getUserProfile, addNewPost } = require('./processes');

const serveHome = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const posts = await getPosts(dbClient);
  response.render('index', { posts });
};

const serveProfilePage = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const userId = 1;
  const userProfile = await getUserProfile(dbClient, userId);
  response.render('profile', userProfile);
};

const handleNewPost = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const newPost = await addNewPost(dbClient, request.body);
  response.json(newPost);
};

module.exports = { serveHome, serveProfilePage, handleNewPost };
