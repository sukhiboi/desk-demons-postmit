const {
  extractInitials,
  sortByDate,
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
    const { name, username, imageUrl } = await this.datastore.getUserDetails(
      userId
    );
    this.username = username;
    this.fullName = name;
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.initials = extractInitials(name);
  }

  async getValidMentions(message) {
    const mentions = Array.from(new Set(message.match(/\B@\w*-*\w*\b/gi)));
    const validMentions = [];
    for (const mention of mentions) {
      const username = mention.slice(1);
      const user = await this.datastore
        .getIdByUsername(username)
        .catch(() => {});
      if (user && user.userId) {
        validMentions.push(mention.slice(1));
      }
    }
    return validMentions;
  }

  async getReposts(userId, username) {
    const reposts = await this.datastore.getRepostsByUserId(userId);
    return reposts.map(repost => ({ ...repost, repostedBy: username }));
  }

  // eslint-disable-next-line max-statements
  async updatePostActions(userId, post) {
    const updatedPost = { ...post };
    updatedPost.likedUsers = await this.datastore.getAllPostLikers(post.postId);
    const responses = await this.datastore.getAllResponses(post.postId);
    updatedPost.responseCount = responses.length;
    const reposts = await this.datastore.getAllReposts(post.postId);
    updatedPost.repostCount = reposts.length;
    updatedPost.isLiked = isUserPresentInList(userId, updatedPost.likedUsers);
    updatedPost.isReposted = isUserPresentInList(userId, reposts);
    updatedPost.isDeletable = post.userId === userId;
    updatedPost.isBookmarked = await this.isBookmarked(post.postId);
    return updatedPost;
  }

  async updatePosts(userId, posts) {
    const updatedPosts = posts.map(async post => {
      const updatedPost = await this.updatePostActions(userId, post);
      updatedPost.initials = extractInitials(post.name);
      updatedPost.postedAt = post.postedAt;
      updatedPost.mentions = await this.getValidMentions(post.message);
      const hashtags = await this.datastore.getHashtagsByPostId(post.postId);
      updatedPost.hashtags = hashtags.map(({ hashtag }) => hashtag);
      const replyingTo = await this.datastore.getReplyingTo(post.postId);
      if (replyingTo) {
        updatedPost.replyingTo = replyingTo.username;
      }
      return updatedPost;
    });
    return await Promise.all(updatedPosts);
  }

  async getPostDetails(postId) {
    const post = await this.datastore.getPost(postId);
    const [postDetails] = await this.updatePosts(this.userId, [post]);
    const responseIds = await this.datastore.getAllResponses(postId);
    const responses = await this.updatePosts(this.userId, responseIds);
    return {
      fullName: this.fullName,
      post: postDetails,
      loggedUser: this.username,
      responses,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async getUserFeed() {
    const followings = await this.datastore.getFollowing(this.userId);
    followings.push({ userId: this.userId, username: this.username });
    const postIds = followings.map(async user => {
      const posts = await this.datastore.getUserPosts(user.userId);
      return posts.concat(await this.getReposts(user.userId, user.username));
    });
    const posts = await Promise.all(postIds);
    const sortedPosts = sortByDate(posts.flat());
    const updatedPosts = await this.updatePosts(this.userId, sortedPosts);
    return {
      fullName: this.fullName,
      loggedUser: this.username,
      posts: updatedPosts,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  savePost(message) {
    return this.datastore.savePost(this.userId, message);
  }

  saveResponse(message, postId) {
    return this.datastore.savePost(this.userId, message, postId);
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
    if (username === this.username) {
      return true;
    }
    const id = await this.datastore.getIdByUsername(username);
    return id === undefined;
  }

  async saveUser(userDetails) {
    const { username } = userDetails;
    await this.datastore.saveUser(userDetails);
    return await this.datastore.getIdByUsername(username);
  }

  // eslint-disable-next-line max-statements
  async getUserResponsesWithPosts(userId) {
    const responseAndPostIds = await this.datastore.getUserResponses(userId);
    const responses = [];
    for (const { postId, responseId } of responseAndPostIds) {
      const postData = await this.datastore.getPost(postId);
      const responseData = await this.datastore.getPost(responseId);
      postData.parentPost = true;
      responseData.childPost = true;
      const array = responses.find(([post]) => post.postId === postId);
      if (array) {
        array.push(responseData);
      } else {
        responses.push([{ ...postData, parentPost: true }, responseData]);
      }
    }
    const promises = responses.map(post => this.updatePosts(this.userId, post));
    const responsesValues = await Promise.all(promises);
    return responsesValues.flat();
  }

  async getProfilePosts(user) {
    const userPosts = await this.datastore.getUserPosts(user.userId);
    const reposts = await this.getReposts(user.userId, user.username);
    const rawLikedPosts = await this.datastore.getLikedPosts(user.userId);
    const likedPosts = await this.updatePosts(this.userId, rawLikedPosts);
    const responsePosts = await this.getUserResponsesWithPosts(user.userId);
    userPosts.push(...reposts);
    const sortedPosts = sortByDate(userPosts);
    const posts = await this.updatePosts(this.userId, sortedPosts);
    return { posts, likedPosts, responsePosts };
  }

  async getUserProfile(username) {
    const user = await this.datastore.getIdByUsername(username);
    const userDetails = await this.datastore.getUserDetails(user.userId);
    const initials = extractInitials(userDetails.name);
    const { posts, likedPosts, responsePosts } = await this.getProfilePosts(
      userDetails
    );
    const following = await this.datastore.getFollowing(user.userId);
    const followers = await this.datastore.getFollowers(user.userId);
    const isFollowing = isUserPresentInList(this.userId, followers);
    return {
      ...userDetails,
      profileUrl: userDetails.imageUrl,
      initials,
      posts,
      followers,
      following,
      likedPosts,
      responsePosts,
      isFollowing,
      fullName: this.fullName,
      loggedUser: this.username,
      imageUrl: this.imageUrl,
    };
  }

  async getSearchSuggestions(searchInput) {
    const isHashTag = searchInput[0] === '#';
    const isUser = searchInput[0] === '@';
    const searchText = searchInput.slice(1);
    if (isHashTag) {
      const hashtags = await this.datastore.getMatchingHashtags(searchText);
      return hashtags.map(({ hashtag }) => hashtag);
    }
    if (isUser) {
      const users = await this.datastore.getMatchingUsers(searchText);
      return users.map(user => {
        user.initials = extractInitials(user.name);
        return user;
      });
    }
    return [];
  }

  async updateUsersList(list) {
    const updatedList = list.map(async user => {
      const followers = await this.datastore.getFollowers(user.userId);
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
    return {
      fullName: this.fullName,
      loggedUser: this.username,
      profile,
      followingList,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async getFollowersList(username) {
    const user = await this.datastore.getIdByUsername(username);
    const profile = await this.datastore.getUserDetails(user.userId);
    profile.initials = extractInitials(profile.name);
    let followersList = await this.datastore.getFollowers(user.userId);
    followersList = await this.updateUsersList(followersList);
    return {
      fullName: this.fullName,
      loggedUser: this.username,
      profile,
      followersList,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async getRepostedUsers(postId) {
    const allReposts = await this.datastore.getAllReposts(postId);
    return {
      repostedUsers: await this.updateUsersList(allReposts),
      fullName: this.fullName,
      loggedUser: this.username,
      postId,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async getUserId(githubUsername) {
    return await this.datastore.getIdByGithubUsername(githubUsername);
  }

  async getPostLikers(postId) {
    const likedUserIds = await this.datastore.getAllPostLikers(postId);
    return {
      fullName: this.fullName,
      likers: await this.updateUsersList(likedUserIds),
      loggedUser: this.username,
      postId,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async getHashtagRelatedPosts(hashtag) {
    const posts = await this.datastore.getPostsByHashtag(hashtag);
    return {
      posts: await this.updatePosts(this.userId, posts),
      fullName: this.fullName,
      loggedUser: this.username,
      hashtag,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async isBookmarked(postId) {
    const bookmarks = await this.datastore.getBookmarks(this.userId);
    return bookmarks.some(bookmark => bookmark.postId === postId);
  }

  async toggleBookmarkOnPost(postId) {
    const isBookMarked = await this.isBookmarked(postId);
    if (isBookMarked) {
      return this.datastore.removeBookmark(postId, this.userId);
    }
    return this.datastore.addBookmark(postId, this.userId);
  }

  async getBookmarks() {
    const bookmarks = await this.datastore.getBookmarks(this.userId);
    const posts = await this.updatePosts(this.userId, bookmarks);
    return {
      posts,
      loggedUser: this.username,
      fullName: this.fullName,
      initials: this.initials,
      imageUrl: this.imageUrl,
    };
  }

  async toggleRepost(postId) {
    const allReposts = await this.datastore.getAllReposts(postId);
    const isRepostedByUser = isUserPresentInList(this.userId, allReposts);
    if (isRepostedByUser) {
      return this.datastore.undoRepost(postId, this.userId);
    }
    return this.datastore.repost(postId, this.userId);
  }

  async updateUserDetails(newDetails) {
    return this.datastore.updateUserDetails(this.userId, newDetails);
  }
}

module.exports = App;
