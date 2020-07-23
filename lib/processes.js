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

const getPosts = async function (dbClient) {
  const posts = await dbClient.getPosts().catch(() => Promise.resolve([]));
  return await Promise.all(posts.map(post => getPostDetails(post, dbClient)));
};

module.exports = { extractProfileName, getPosts };
