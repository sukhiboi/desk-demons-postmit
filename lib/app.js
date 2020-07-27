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
      .catch(err => Promise.reject(err));
    post.likedUsers = await this.dbClient.getAllLikedUsers(post.id);
    const initials = extractInitials(user.name || user.username);
    post.posted_at = parseTimeStamp(post.posted_at);
    return { ...post, ...user, initials };
  }

  async getAllPosts(userId) {
    try {
      const posts = await this.dbClient.getAllPosts();
      const { name, username } = await this.dbClient.getUserDetails(userId);
      const postPromises = posts.map(post => this.getPostDetails(userId, post));
      const initials = extractInitials(name || username);
      return { posts: await Promise.all(postPromises), initials };
    } catch (err) {
      return { posts: [] };
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
      const allPosts = await this.getAllPosts(userId);
      const likedPosts = allPosts.posts.filter(post => post.isLiked);
      const posts = await Promise.all(postPromises);
      return { ...userDetails, initials, posts, likedPosts };
    } catch (error) {
      return { errMsg: 'Invalid userId', posts: [], likedPosts: [] };
    }
  }

  async addNewPost(postDetails) {
    try {
      const latestPost = await this.dbClient.addPost(postDetails);
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
    const isLikedByUser = await this.dbClient.isLikedByUser(userId, postId);
    if (isLikedByUser) {
      return false;
    }
    return await this.dbClient.likePost(postId, userId);
  }

  async unlikePost(postId, userId) {
    const isLikedByUser = await this.dbClient.isLikedByUser(userId, postId);
    if (isLikedByUser) {
      return await this.dbClient.unlikePost(postId, userId);
    }
    return false;
  }

  async search(searchInput) {
    const searchResult = await this.dbClient.getMatchingUsers(searchInput);
    searchResult.forEach(user => {
      user.initials = extractInitials(user.name || user.username);
    });
    return searchResult;
  }
}

module.exports = App;
