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
      const following = await this.dbClient.getFollowings(userId);
      let posts = await following.map(async follower => {
        return await this.dbClient.getPostsByUserId(follower.follower_id);
      });
      posts = await Promise.all(posts);
      // eslint-disable-next-line no-extra-parens
      posts.push(...(await this.dbClient.getPostsByUserId(userId)));
      const { name, username } = await this.dbClient.getUserDetails(userId);
      const postPromises = posts
        .flat()
        .map(post => this.getPostDetails(userId, post));
      const initials = extractInitials(name || username);
      return { posts: await Promise.all(postPromises), initials };
    } catch (err) {
      return { posts: [] };
    }
  }

  async getUserRelatedPosts(userId) {
    try {
      const rawPosts = await this.dbClient
        .getPostsByUserId(userId)
        .catch(() => []);
      const postPromises = rawPosts.map(post =>
        this.getPostDetails(userId, post)
      );
      let allPosts = await this.dbClient.getAllPosts();
      allPosts = await allPosts.map(post => this.getPostDetails(userId, post));
      allPosts = await Promise.all(allPosts);
      const likedPosts = allPosts.filter(post => post.isLiked);
      const posts = await Promise.all(postPromises);
      return { likedPosts, posts };
    } catch (err) {
      return { likedPosts: [], posts: [] };
    }
  }

  async getUserProfile(userId) {
    try {
      const userProfile = await this.dbClient.getUserDetails(userId);
      userProfile.initials = extractInitials(userProfile.name);
      const { likedPosts, posts } = await this.getUserRelatedPosts(userId);
      userProfile.followers = await this.dbClient.getFollowers(userId);
      userProfile.following = await this.dbClient.getFollowings(userId);
      return { ...userProfile, posts, likedPosts };
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
      const user = await this.dbClient.getUserIdByUsername(username);
      if (user === undefined) {
        return { errMsg: 'no user found', posts: [], likedPosts: [] };
      }
      const userDetails = await this.getUserProfile(user.user_id);
      userDetails.posts = await this.getPostsLikedBy(userId, userDetails.posts);
      userDetails.likedPosts = await this.getPostsLikedBy(
        userId,
        userDetails.likedPosts
      );  
      userDetails.isFollower = await this.dbClient.isFollower(userId, user.user_id);
      return userDetails;
    } catch (err) {
      console.log(err);
      
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

  async follow(username, userId) {
    const follower = await this.dbClient.getUserIdByUsername(username);
    return await this.dbClient.addFollower(userId, follower.user_id);
  }

  async unfollow(username, userId) {
    const follower = await this.dbClient.getUserIdByUsername(username);
    return await this.dbClient.removeFollower(userId, follower.user_id);
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

  async getUserId(username) {
    try {
      return await this.dbClient.getUserIdByGithubUsername(username);
    } catch (err) {
      return { errMsg: err.message };
    }
  }

  async saveUser(userDetails) {
    const { githubUsername } = userDetails;
    try {
      await this.dbClient.saveUser(userDetails);
      const user_id = await this.dbClient.getUserIdByGithubUsername(
        githubUsername
      );
      return user_id;
    } catch (err) {
      return { errMsg: err.message };
    }
  }

  async isUsernameAvailable(username) {
    try {
      const id = await this.dbClient.getUserIdByUsername(username);
      return id === undefined;
    } catch (err) {
      return false;
    }
  }
}

module.exports = App;
