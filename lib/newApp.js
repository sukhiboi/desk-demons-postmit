const {
  extractInitials,
  sortByDate,
  parseTimeStamp,
  isUserPresentInList,
} = require('./helperFunctions');

class NewApp {
  constructor(datastore) {
    this.datastore = datastore;
    this.username;
    this.fullName;
    this.userId;
  }

  async updateUser(userId) {
    try {
      const { name, username } = await this.datastore.getUserDetails(userId);
      this.username = username;
      this.fullName = name;
      this.userId = userId;
    } catch (err) {
      Promise.reject(err);
    }
  }

  async updatePost(userId, posts) {
    try {
      const updatedPosts = posts.map(async post => {
        const user = await this.datastore.getUserDetails(post.userId);
        post.likedUsers = await this.datastore.getAllPostLikers(post.postId);
        post.isLiked = isUserPresentInList(userId, post.likedUsers);
        post.isDeletable = post.userId === userId;
        post.initials = extractInitials(user.name);
        post.postedAt = parseTimeStamp(post.postedAt);
        return { ...user, ...post };
      });
      return await Promise.all(updatedPosts);
    } catch (err) {
      Promise.reject(err);
    }
  }

  async getUserFeed(userId) {
    try {
      const followings = await this.datastore.getFollowing(userId);
      const usersIds = [{ userId }, ...followings];
      const postIds = usersIds.map(user => {
        return this.datastore.getUserPosts(user.userId);
      });
      const posts = await Promise.all(postIds);
      const sortedPosts = sortByDate(posts.flat());
      const updatedPosts = await this.updatePost(userId, sortedPosts);
      return {
        loggedUser: this.username,
        initials: extractInitials(this.fullName),
        posts: updatedPosts,
      };
    } catch (err) {
      Promise.reject(err);
    }
  }

  savePost(userId, content) {
    return this.datastore.savePost(userId, content);
  }

  async toggleLikeOnPost(postId, userId) {
    try {
      const likedUsers = await this.datastore.getAllPostLikers(postId);
      const isPostLikeByUser = isUserPresentInList(userId, likedUsers);
      if (isPostLikeByUser) {
        return this.datastore.unlikePost(postId, userId);
      }
      return this.datastore.likePost(postId, userId);
    } catch (err) {
      Promise.reject(err);
    }
  }

  async toggleFollowingAUser(userId, followerName) {
    try {
      const follower = await this.datastore.getIdByUsername(followerName);
      const followers = await this.datastore.getFollowers(follower.userId);
      const isFollowing = isUserPresentInList(userId, followers);
      if (isFollowing) {
        return this.datastore.unFollowUser(userId, follower.userId);
      }
      return this.datastore.followUser(userId, follower.userId);
    } catch (err) {
      Promise.reject(err);
    }
  }

  deletePost(postId) {
    return this.datastore.removePost(postId);
  }

  async isUsernameAvailable(username) {
    try {
      const id = await this.datastore.getIdByUsername(username);
      return id === undefined;
    } catch (err) {
      Promise.reject(err);
    }
  }

  async saveUser(userDetails) {
    const { username } = userDetails;
    try {
      await this.datastore.saveUser(userDetails);
      return await this.datastore.getIdByUsername(username);
    } catch (err) {
      Promise.reject(err);
    }
  }

  async getProfilePosts(userId, user) {
    try {
      const userPosts = await this.datastore.getUserPosts(user.userId);
      const posts = await this.updatePost(userId, userPosts);
      const rawLikedPosts = await this.datastore.getLikedPosts(user.userId);
      const likedPosts = await this.updatePost(userId, rawLikedPosts);
      return { posts, likedPosts };
    } catch (err) {
      Promise.reject(err);
    }
  }

  async getUserProfile(userId, username) {
    try {
      const user = await this.datastore.getIdByUsername(username);
      const userDetails = await this.datastore.getUserDetails(user.userId);
      const initials = extractInitials(userDetails.name);
      const { posts, likedPosts } = await this.getProfilePosts(userId, user);
      const followers = await this.datastore.getFollowers(user.userId);
      const following = await this.datastore.getFollowing(user.userId);
      const isFollowing = isUserPresentInList(userId, followers);
      return {
        ...userDetails,
        initials,
        posts,
        followers,
        following,
        likedPosts,
        isFollowing,
        loggedUser: this.username,
      };
    } catch (err) {
      Promise.reject(err);
    }
  }
}

module.exports = NewApp;
