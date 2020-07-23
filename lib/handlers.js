const extractProfileName = function (name) {
  const [firstName, secondName] = name.split(' ');
  const firstLetter = firstName[0];
  const profileName = secondName ? firstLetter + secondName[0] : firstLetter;
  return profileName;
};

const getPostDetails = async function (post, dbClient) {
  const user = await dbClient.getUserDetails(post.user_id);
  user.initials = extractProfileName(user.name || user.username);
  return Object.assign(user, post);
};

const getPosts = async function (request, response) {
  const dbClient = request.app.locals.dbClient;
  let posts = await dbClient.getPosts();
  posts = await Promise.all(posts.map(post => getPostDetails(post, dbClient)));
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

module.exports = { getPosts, getUserProfile };
