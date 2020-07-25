const { extractInitials, parseTimeStamp } = require('./helperFunctions');

class App {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getPostDetails(userId, post) {
    const user = await this.dbClient
      .getUserDetails(post.user_id)
      .catch(err => Promise.reject(err));
    post.isLiked = await this.dbClient
      .isLikedByUser(userId, post.id)
      .catch((err) => Promise.reject(err));
    const initials = extractInitials(user.name || user.username);
    post.posted_at = parseTimeStamp(post.posted_at);
    return { ...post, ...user, initials };
  }

  async getAllPosts(userId) {
    try {
      const posts = await this.dbClient.getAllPosts();
      const postPromises = posts.map(post => this.getPostDetails(userId, post));
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
      const initials = extractInitials(userDetails.name);
      const postPromises = rawPosts.map(post =>
        this.getPostDetails(userId, post)
      );
      const posts = await Promise.all(postPromises);
      return { ...userDetails, initials, posts };
    } catch (error) {
      return { errMsg: 'Invalid userId', posts: [] };
    }
  }

  async addNewPost(postDetails) {
    try {
      const [latestPost] = await this.dbClient.addPost(postDetails);
      const latestPostDetails = await this.getPostDetails(
        latestPost.user_id,
        latestPost
      );
      return latestPostDetails;
    } catch (err) {
      return { errMsg: err.message };
    }
  }

  async likePost(postId, userId) {
    return await this.dbClient.likePost(postId, userId);
  }

  async unlikePost(postId, userId) {
    return await this.dbClient.unlikePost(postId, userId);
  }
}

module.exports = App;
