/* eslint-disable no-extra-parens */
const {
  formatDate,
  extractInitials,
  parseTimeStamp,
} = require('./helperFunctions');

class App {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getPostDetails(userId, post) {
    const user = await this.dbClient
      .getUserDetails(post.userId)
      .catch(err => Promise.reject(err));
    post.isLiked = await this.dbClient
      .isLikedByUser(userId, post.postId)
      .catch(err => Promise.reject(err));
    post.isDeletable = post.userId === userId;
    post.likedUsers = await this.dbClient.getAllLikedUsers(post.postId);
    const initials = extractInitials(user.name || user.username);
    post.postedAt = parseTimeStamp(post.postedAt);
    return { ...post, ...user, initials };
  }

  // eslint-disable-next-line max-statements
  async getAllPosts(userId) {
    try {
      const following = await this.dbClient.getFollowings(userId);
      let posts = following.map(follower =>
        this.dbClient.getPostsByUserId(follower.followerId)
      );
      posts = await Promise.all(posts);
      posts = posts.flat();
      posts.push(...(await this.dbClient.getPostsByUserId(userId)));
      const { name } = await this.dbClient.getUserDetails(userId);
      posts = posts.sort(
        (post1, post2) => new Date(post2.postedAt) - new Date(post1.postedAt)
      );
      const postPromises = posts.map(post => this.getPostDetails(userId, post));
      return {
        posts: await Promise.all(postPromises),
        initials: extractInitials(name),
      };
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
      let allPosts = await this.dbClient.getAllPosts(userId);
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
      userProfile.joinedDate = formatDate(userProfile.joinedDate);
      return { ...userProfile, posts, likedPosts };
    } catch (error) {
      return { errMsg: 'Invalid userId', posts: [], likedPosts: [] };
    }
  }

  async updatePostByUserId(userId, posts) {
    const LikedPosts = await posts.map(async post => {
      post.isLiked = await this.dbClient.isLikedByUser(userId, post.postId);
      post.isDeletable = post.userId === userId;
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
      const userDetails = await this.getUserProfile(user.userId);
      userDetails.posts = await this.updatePostByUserId(
        userId,
        userDetails.posts
      );
      userDetails.likedPosts = await this.updatePostByUserId(
        userId,
        userDetails.likedPosts
      )
      userDetails.isFollower = await this.dbClient.isFollower(
        userId,
        user.userId
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

  async follow(username, userId) {
    const follower = await this.dbClient.getUserIdByUsername(username);
    return await this.dbClient.addFollower(userId, follower.userId);
  }

  async unfollow(username, userId) {
    const follower = await this.dbClient.getUserIdByUsername(username);
    return await this.dbClient.removeFollower(userId, follower.userId);
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

  async getFollowingList(username, userId) {
    const user = await this.dbClient.getUserIdByUsername(username);
    let followingList = await this.dbClient.getFollowings(user.userId);
    followingList = await followingList.map(async user => {
      const following = await this.dbClient.getUserDetails(user.followerId);
      following.initials = extractInitials(following.name);
      following.isFollowingMe = await this.dbClient.isFollower(
        userId,
        user.followerId
      );
      return following;
    });
    followingList = await Promise.all(followingList);
    const profile = await this.dbClient.getUserDetails(user.userId);
    profile.initials = extractInitials(profile.name || profile.username);
    return { profile, followingList };
  }

  async getFollowersList(username, userId) {
    const user = await this.dbClient.getUserIdByUsername(username);
    let followersList = await this.dbClient.getFollowers(user.userId);
    followersList = await followersList.map(async user => {
      const follower = await this.dbClient.getUserDetails(user.userId);
      follower.initials = extractInitials(follower.name);
      follower.isFollowingMe = await this.dbClient.isFollower(
        userId,
        follower.userId
      );
      return follower;
    });
    followersList = await Promise.all(followersList);
    const profile = await this.dbClient.getUserDetails(user.userId);
    profile.initials = extractInitials(profile.name || profile.username);
    return { profile, followersList };
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
      const userId = await this.dbClient.getUserIdByGithubUsername(
        githubUsername
      );
      return userId;
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

  async deletePost(postId) {
    try {
      const deletedPostId = await this.dbClient.deletePost(postId);
      return deletedPostId === postId;
    } catch (err) {
      return false;
    }
  }
}

module.exports = App;
