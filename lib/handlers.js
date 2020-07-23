const extractProfileName = (name) => {
  const parts = name.split(' ');
  const firstLetters = parts.map((part) => part.split('')[0]);
  const initials = firstLetters.join('');
  return initials;
};

const getPostDetails = async (post, dbClient) => {
  const user = await dbClient.getUserDetails(post.user_id);
  user.profileName = extractProfileName(user.name || user.username);
  return Object.assign(user, post);
};

const getPosts = async function (req, res) {
  const dbClient = req.app.locals.dbClient;
  let posts = await dbClient.getPosts();
  posts = await Promise.all(
    posts.map(async (post) => await getPostDetails(post, dbClient))
  );
  res.render('index', { posts });
};

const getUserProfile = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  const userId = 2;
  const userDetails = await dbClient.getUserDetails(userId);
  const initials = extractProfileName(userProfile.name);
  const userProfile = { ...userDetails, initials };
  response.render('profile', userDetails);
};

module.exports = { getPosts, getUserProfile };
