const {
  extractInitials,
  sortByDate,
  parseTimeStamp,
  isUserPresentInList,
} = require('./helperFunctions');

class App {
  constructor(datastore) {
    this.datastore = datastore;
    this.username;
    this.fullName;
    this.userId;
  }

  async updateUser(userId) {
    const { name, username } = await this.datastore.getUserDetails(userId);
    this.username = username;
    this.fullName = name;
    this.userId = userId;
  }

  async updatePost(userId, posts) {
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
  }

  async getUserFeed() {
    const followings = await this.datastore.getFollowing(this.userId);
    const usersIds = [{ userId: this.userId }, ...followings];
    const postIds = usersIds.map(user =>
      this.datastore.getUserPosts(user.userId)
    );
    const posts = await Promise.all(postIds);
    const sortedPosts = sortByDate(posts.flat());
    const updatedPosts = await this.updatePost(this.userId, sortedPosts);
    return {
      loggedUser: this.username,
      initials: extractInitials(this.fullName),
      posts: updatedPosts,
    };
  }

  savePost(content) {
    return this.datastore.savePost(this.userId, content);
  }

  async toggleLikeOnPost(postId) {
    try {
      const likedUsers = await this.datastore.getAllPostLikers(postId);
      const isPostLikeByUser = isUserPresentInList(this.userId, likedUsers);
      if (isPostLikeByUser) {
        return this.datastore.unlikePost(postId, this.userId);
      }
      return this.datastore.likePost(postId, this.userId);
    } catch (err) {
      Promise.reject(err);
    }
  }

  async toggleFollowingAUser(followerName) {
    try {
      const follower = await this.datastore.getIdByUsername(followerName);
      const followers = await this.datastore.getFollowers(follower.userId);
      const isFollowing = isUserPresentInList(this.userId, followers);
      if (isFollowing) {
        return this.datastore.unFollowUser(this.userId, follower.userId);
      }
      return this.datastore.followUser(this.userId, follower.userId);
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

  async getUserProfile(username) {
    try {
      const user = await this.datastore.getIdByUsername(username);
      const userDetails = await this.datastore.getUserDetails(user.userId);
      const initials = extractInitials(userDetails.name);
      const { posts, likedPosts } = await this.getProfilePosts(
        this.userId,
        user
      );
      const following = await this.datastore.getFollowing(user.userId);
      const followers = await this.datastore.getFollowers(user.userId);
      const isFollowing = isUserPresentInList(this.userId, followers);
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

  async getUserSuggestions(searchInput) {
    try {
      const users = await this.datastore.getMatchingUsers(searchInput);
      return users.map(user => {
        user.initials = extractInitials(user.name);
        return user;
      });
    } catch (err) {
      Promise.reject(err);
    }
  }

  async updateUsersList(list) {
    const updatedList = list.map(async ({ userId }) => {
      const user = await this.datastore.getUserDetails(userId);
      const followers = await this.datastore.getFollowers(userId);
      user.initials = extractInitials(user.name);
      user.isFollowingMe = isUserPresentInList(this.userId, followers);
      return user;
    });
    return await Promise.all(updatedList);
  }

  async getFollowingList(username) {
    try {
      const user = await this.datastore.getIdByUsername(username);
      const profile = await this.datastore.getUserDetails(user.userId);
      profile.initials = extractInitials(profile.name);
      let followingList = await this.datastore.getFollowing(user.userId);
      followingList = await this.updateUsersList(followingList);
      return { loggedUser: this.username, profile, followingList };
    } catch (err) {
      Promise.reject(err);
    }
  }

  async getFollowersList(username) {
    try {
      const user = await this.datastore.getIdByUsername(username);
      const profile = await this.datastore.getUserDetails(user.userId);
      profile.initials = extractInitials(profile.name);
      let followersList = await this.datastore.getFollowers(user.userId);
      followersList = await this.updateUsersList(followersList);
      return { loggedUser: this.username, profile, followersList };
    } catch (err) {
      Promise.reject(err);
    }
  }

  async getUserId(githubUsername) {
    return await this.datastore.getIdByGithubUsername(githubUsername);
  }
}

module.exports = App;
