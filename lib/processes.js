const extractInitials = function (name) {
  const [firstName, secondName] = name.split(' ');
  const firstLetter = firstName[0];
  const profileName = secondName ? firstLetter + secondName[0] : firstLetter;
  return profileName.toUpperCase();
};

const getPostDetails = async function (post, dbClient) {
  const user = await dbClient.getUserDetails(post.user_id);
  user.initials = extractInitials(user.name || user.username);
  return Object.assign(user, post);
};

const getPosts = async function (dbClient) {
  const posts = await dbClient.getPosts().catch(() => Promise.resolve([]));
  return await Promise.all(posts.map((post) => getPostDetails(post, dbClient)));
};

const getUserProfile = async function (dbClient, userId) {
  const userDetails = await dbClient.getUserDetails(userId);
  const rawPosts = await dbClient.getPostsByUserId(userId);
  const { username, name } = userDetails;
  const initials = extractInitials(name);
  const posts = rawPosts.map((post) => {
    const { message, posted_at } = post;
    return { username, name, message, posted_at, initials };
  });
  return { ...userDetails, initials, posts };
};

module.exports = { getPosts, getUserProfile };
