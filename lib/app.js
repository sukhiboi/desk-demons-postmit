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

  async getPostsLikedBy(userId, posts) {
    const LikedPosts = await posts.map(async post => {
      post.isLiked = await this.dbClient.isLikedByUser(userId, post.id);
      return post;
    });
    return Promise.all(LikedPosts);
  }

  async getSearchedUserProfile(userId, username) {
    try {
      const searchedUserId = await this.dbClient.getUserIdByUsername(username);
      const userDetails = await this.getUserProfile(searchedUserId);
      userDetails.posts = await this.getPostsLikedBy(userId, userDetails.posts);
      userDetails.likedPosts = await this.getPostsLikedBy(
        userId,
        userDetails.likedPosts
      );
      return userDetails;
    } catch (err) {
      return { errMsg: 'Invalid userId', posts: [], likedPosts: [] };
    }
  }

  async addNewPost(postDetails) {
    return await this.dbClient.addPost(postDetails);
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
    const searchResult = await this.dbClient
      .getMatchingUsers(searchInput)
      .catch(() => []);
    searchResult.forEach(user => {
      user.initials = extractInitials(user.name || user.username);
    });
    return searchResult;
  }

  async saveUser(userDetails) {
    const { githubUsername } = userDetails;
    try {
      await this.dbClient.saveUser(userDetails);
      const user_id = await this.dbClient.getUserIdByUsername(githubUsername);
      return { user_id };
    } catch (err) {
      return { errMsg: err.message };
    }
  }
}

module.exports = App;
