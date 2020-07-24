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

class App {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getPostDetails(userId, post) {
    const user = await this.dbClient
      .getUserDetails(post.user_id)
      .catch(() => Promise.reject());
    post.isLiked = await this.dbClient
      .isLikedByUser(userId, post.id)
      .catch(() => Promise.reject());
    user.initials = extractInitials(user.name || user.username);
    post.posted_at = parseTimeStamp(post.posted_at);
    return Object.assign(user, post);
  }

  async getPosts(userId) {
    try {
      const posts = await this.dbClient.getPosts();
      const postPromises = posts.map((post) =>
        this.getPostDetails(userId, post)
      );
      return await Promise.all(postPromises);
    } catch (err) {
      return [];
    }
  }

  async getUserProfile(userId) {
    try {
      const userDetails = await this.dbClient.getUserDetails(userId);
      const rawPosts = await this.dbClient
        .getPostsByUserId(userId)
        .catch(() => []);
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
  }

  async addNewPost(postDetails) {
    try {
      const [latestPost] = await this.dbClient.addPost(postDetails);
      const latestPostDetails = await this.getPostDetails(
        postDetails.user_id,
        latestPost
      );
      return latestPostDetails;
    } catch (err) {
      return { errMsg: err.message };
    }
  }

  async likePost(postId, userId) {
    await this.dbClient.likePost(postId, userId);
  }

  async unlikePost(postId, userId) {
    await this.dbClient.unlikePost(postId, userId);
  }
}

module.exports = { App };
