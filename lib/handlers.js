const { extractProfileName, getPosts } = require('./processes');

const serveHome = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const posts = await getPosts(dbClient);
  response.render('index', { posts });
};

const getUserProfile = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const userId = 1;
  const userDetails = await dbClient.getUserDetails(userId);
  const initials = extractProfileName(userDetails.name);
  const rawPosts = await dbClient.getPostsByUserId(userId);
  const { username, name } = userDetails;
  const posts = rawPosts.map(post => {
    const { message, posted_at } = post;
    return { username, name, message, posted_at, initials };
  });
  const userProfile = { ...userDetails, initials, posts };
  response.render('profile', userProfile);
};

module.exports = { serveHome, getUserProfile };
