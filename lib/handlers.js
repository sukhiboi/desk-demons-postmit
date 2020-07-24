const { getPosts, getUserPosts } = require('./processes');

const serveHome = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const posts = await getPosts(dbClient);
  response.render('index', { posts });
};

const serveProfilePage = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const userId = 1;
  const userProfile = await getUserPosts(dbClient, userId);
  response.render('profile', userProfile);
};

module.exports = { serveHome, serveProfilePage };
