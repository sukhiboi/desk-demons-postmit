/* eslint-disable camelcase */
const extractProfileName = (name) => {
  const parts = name.split(' ');
  const firstLetters = parts.map((part) => {
    const [letter] = part.split('');
    return letter;
  });
  const initials = firstLetters.join('');
  return initials;
};

const getPostDetails = async (post, dbClient) => {
  const user = await dbClient.getUserDetails(post.user_id);
  user.initials = extractProfileName(user.name || user.username);
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
  const userId = 1;
  const userDetails = await dbClient.getUserDetails(userId);
  const initials = extractProfileName(userDetails.name);
  const rawPosts = await dbClient.getPostsByUserId(userId);
  const { username, name } = userDetails;
  const posts = rawPosts.map((post) => {
    const { message, posted_at } = post;
    return { username, name, message, posted_at, initials };
  });
  const userProfile = { ...userDetails, initials, posts };
  response.render('profile', userProfile);
};

module.exports = { getPosts, getUserProfile };
