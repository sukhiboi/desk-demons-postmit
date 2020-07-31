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

  // eslint-disable-next-line complexity
  async getValidMentions(message) {
    const mentions = message.match(/@\w+/g) || [];
    const validMentions = [];
    for (const mention of mentions) {
      const username = mention.slice(1);
      const user = await this.datastore
        .getIdByUsername(username)
        .catch(() => {});
      if (user && user.userId) {
        validMentions.push(mention);
      }
    }
    return validMentions;
  }

  async updatePost(userId, posts) {
    const updatedPosts = posts.map(async post => {
      const user = await this.datastore.getUserDetails(post.userId);
      post.likedUsers = await this.datastore.getAllPostLikers(post.postId);
      post.isLiked = isUserPresentInList(userId, post.likedUsers);
      post.isDeletable = post.userId === userId;
      post.initials = extractInitials(user.name);
      post.postedAt = parseTimeStamp(post.postedAt);
      post.mentions = await this.getValidMentions(post.message);
      const hashtags = await this.datastore.getHashtagsByPostId(post.postId);
      post.hashtags = hashtags.map(({ hashtag }) => hashtag);
      return { ...user, ...post };
    });
    return await Promise.all(updatedPosts);
  }

  async getPostDetails(postId) {
    const post = await this.datastore.getPost(postId);
    const [postDetails] = await this.updatePost(this.userId, [post]);
    return { ...postDetails, loggedUser: this.username };
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
    const likedUsers = await this.datastore.getAllPostLikers(postId);
    const isPostLikeByUser = isUserPresentInList(this.userId, likedUsers);
    if (isPostLikeByUser) {
      return this.datastore.unlikePost(postId, this.userId);
    }
    return this.datastore.likePost(postId, this.userId);
  }

  async toggleFollowingAUser(followerName) {
    const follower = await this.datastore.getIdByUsername(followerName);
    const followers = await this.datastore.getFollowers(follower.userId);
    const isFollowing = isUserPresentInList(this.userId, followers);
    if (isFollowing) {
      return this.datastore.unFollowUser(this.userId, follower.userId);
    }
    return this.datastore.followUser(this.userId, follower.userId);
  }

  deletePost(postId) {
    return this.datastore.removePost(postId);
  }

  async isUsernameAvailable(username) {
    const id = await this.datastore.getIdByUsername(username);
    return id === undefined;
  }

  async saveUser(userDetails) {
    const { username } = userDetails;
    await this.datastore.saveUser(userDetails);
    return await this.datastore.getIdByUsername(username);
  }

  async getProfilePosts(user) {
    const userPosts = await this.datastore.getUserPosts(user.userId);
    const posts = await this.updatePost(this.userId, userPosts);
    const rawLikedPosts = await this.datastore.getLikedPosts(user.userId);
    const likedPosts = await this.updatePost(this.userId, rawLikedPosts);
    return { posts, likedPosts };
  }

  async getUserProfile(username) {
    const user = await this.datastore.getIdByUsername(username);
    const userDetails = await this.datastore.getUserDetails(user.userId);
    const initials = extractInitials(userDetails.name);
    const { posts, likedPosts } = await this.getProfilePosts(user);
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
  }

  async getUserSuggestions(searchInput) {
    const users = await this.datastore.getMatchingUsers(searchInput);
    return users.map(user => {
      user.initials = extractInitials(user.name);
      return user;
    });
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
    const user = await this.datastore.getIdByUsername(username);
    const profile = await this.datastore.getUserDetails(user.userId);
    profile.initials = extractInitials(profile.name);
    let followingList = await this.datastore.getFollowing(user.userId);
    followingList = await this.updateUsersList(followingList);
    return { loggedUser: this.username, profile, followingList };
  }

  async getFollowersList(username) {
    const user = await this.datastore.getIdByUsername(username);
    const profile = await this.datastore.getUserDetails(user.userId);
    profile.initials = extractInitials(profile.name);
    let followersList = await this.datastore.getFollowers(user.userId);
    followersList = await this.updateUsersList(followersList);
    return { loggedUser: this.username, profile, followersList };
  }

  async getUserId(githubUsername) {
    return await this.datastore.getIdByGithubUsername(githubUsername);
  }

  async getPostLikers(postId) {
    const likedUserIds = await this.datastore.getAllPostLikers(postId);
    return {
      list: await this.updateUsersList(likedUserIds),
      loggedUser: this.username,
      postId,
    };
  }

  async getHashtagRelatedPosts(hashtag) {
    const posts = await this.datastore.getPostsByHashtag(hashtag);
    return {
      posts: await this.updatePost(this.userId, posts),
      loggedUser: this.username,
      hashtag,
    };
  }

  async getBookmarks() {
    const bookmarks = await this.datastore.getBookmarks(this.userId);
    const posts = await this.updatePost(this.userId, bookmarks);
    return { posts, loggedUser: this.username };
  }
}

module.exports = App;
