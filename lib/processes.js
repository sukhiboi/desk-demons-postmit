const moment = require('moment');

const extractInitials = function (name) {
  const firstLetterIdx = 0;
  const [firstName, secondName] = name.split(' ');
  const firstLetter = firstName[firstLetterIdx];
  const profileName = secondName
    ? firstLetter + secondName[firstLetterIdx]
    : firstLetter;
  return profileName.toUpperCase();
};

const parseTimeStamp = function (timeStamp) {
  const timestampFromNow = moment(timeStamp).fromNow();
  if (timestampFromNow.match(/hour|minute|second/)) {
    return timestampFromNow;
  }
  return moment(timeStamp).format('ll');
};

const getPostDetails = async function (dbClient, userId, post) {
  const user = await dbClient
    .getUserDetails(post.user_id)
    .catch(() => Promise.reject());
  post.isLiked = await dbClient
    .isLikedByUser(userId, post.id)
    .catch(() => Promise.reject());
  user.initials = extractInitials(user.name || user.username);
  post.posted_at = parseTimeStamp(post.posted_at);
  return Object.assign(user, post);
};

const getPosts = async function (dbClient, userId) {
  try {
    const posts = await dbClient.getPosts();
    const postPromises = posts.map(getPostDetails.bind(null, dbClient, userId));
    return await Promise.all(postPromises);
  } catch (err) {
    return [];
  }
};

const getUserProfile = async function (dbClient, userId) {
  try {
    const userDetails = await dbClient.getUserDetails(userId);
    const rawPosts = await dbClient.getPostsByUserId(userId).catch(() => []);
    const { username, name } = userDetails;
    const initials = extractInitials(name);
    const posts = rawPosts.map((post) => {
      const { message } = post;
      const posted_at = parseTimeStamp(post.posted_at);
      return { username, name, message, posted_at, initials };
    });
    return { ...userDetails, initials, posts };
  } catch (error) {
    return { errMsg: 'Invalid userId', posts: [] };
  }
};

const addNewPost = async function (dbClient, postDetails) {
  return await dbClient.addPost(postDetails);
};

module.exports = { getPosts, getUserProfile, addNewPost };
