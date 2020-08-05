const {
  extractInitials,
  sortByDate,
  parseTimeStamp,
  createPostId,
  isUserPresentInList,
  formatDate,
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
        validMentions.push(mention.slice(1));
      }
    }
    return validMentions;
  }

  // eslint-disable-next-line max-statements
  async updatePostActions(userId, post) {
    const updatedPost = { ...post };
    updatedPost.likedUsers = await this.datastore.getAllPostLikers(post.postId);
    const responses = await this.datastore.getAllResponses(post.postId);
    updatedPost.responseCount = responses.length;
    updatedPost.isLiked = isUserPresentInList(userId, updatedPost.likedUsers);
    updatedPost.isDeletable = post.userId === userId;
    updatedPost.isBookmarked = await this.isBookmarked(post.postId);
    // const isReposted = post.userId !== userId;
    // if (isReposted) {
    //   const user = await this.datastore.getUserDetails(userId);
    //   updatedPost.repostedBy = user.username;
    // }
    return updatedPost;
  }

  async updatePost(userId, posts) {
    // eslint-disable-next-line max-statements
    const updatedPosts = posts.map(async post => {
      const user = await this.datastore.getUserDetails(post.userId);
      const updatedPost = await this.updatePostActions(userId, post);
      updatedPost.initials = extractInitials(user.name);
      updatedPost.postedAt = parseTimeStamp(post.postedAt);
      updatedPost.mentions = await this.getValidMentions(post.message);
      const hashtags = await this.datastore.getHashtagsByPostId(post.postId);
      updatedPost.hashtags = hashtags.map(({ hashtag }) => hashtag);
      const replyingTo = await this.datastore.getReplyingTo(post.postId);
      if (replyingTo) {
        updatedPost.replyingTo = replyingTo.username;
      }
      return { ...user, ...updatedPost };
    });
    return await Promise.all(updatedPosts);
  }

  async getPostDetails(postId) {
    const post = await this.datastore.getPost(postId);
    const [postDetails] = await this.updatePost(this.userId, [post]);
    const responseIds = await this.datastore.getAllResponses(postId);
    const responses = await this.updatePost(this.userId, responseIds);
    return {
      post: postDetails,
      loggedUser: this.username,
      responses,
      initials: extractInitials(this.fullName),
      imageUrl: this.imageUrl,
    };
  }

  async getUserFeed() {
    const followings = await this.datastore.getFollowing(this.userId);
    const usersIds = [{ userId: this.userId }, ...followings];
    const postIds = usersIds.map(async user => {
      const { username } = await this.datastore.getUserDetails(user.userId);
      const posts = await this.datastore.getUserPosts(user.userId);
      const reposts = await this.datastore.getRepostsByUserId(user.userId);
      reposts.forEach(repost => {
        repost.repostedBy = username;
      });
      return posts.concat(reposts);
    });
    const posts = await Promise.all(postIds);
    const sortedPosts = sortByDate(posts.flat());
    const updatedPosts = await this.updatePost(this.userId, sortedPosts);
    return {
      loggedUser: this.username,
      posts: updatedPosts,
      initials: extractInitials(this.fullName),
      imageUrl: this.imageUrl,
    };
  }

  async saveHashTag(message, postId) {
    const hashtags = message.match(/#\w+/g) || [];
    for (const hashtag of hashtags) {
      const tag = hashtag.slice(1);
      await this.datastore.addHashtag(tag, postId);
    }
  }

  async savePost(content) {
    const postId = createPostId(this.userId, new Date());
    await this.datastore.savePost(this.userId, postId, content);
    await this.saveHashTag(content, postId);
    return postId;
  }

  async saveResponse(content, postId) {
    const responseId = await this.savePost(content);
    return this.datastore.addResponse(postId, responseId);
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
    const promises = responses.map(post => this.updatePost(this.userId, post));
    const responsesValues = await Promise.all(promises);
    return responsesValues.flat();
  }

  async getProfilePosts(user) {
    const userPosts = await this.datastore.getUserPosts(user.userId);
    const posts = await this.updatePost(this.userId, userPosts);
    const rawLikedPosts = await this.datastore.getLikedPosts(user.userId);
    const likedPosts = await this.updatePost(this.userId, rawLikedPosts);
    const responsePosts = await this.getUserResponsesWithPosts(user.userId);
    return { posts, likedPosts, responsePosts };
  }

  async getUserProfile(username) {
    const user = await this.datastore.getIdByUsername(username);
    const userDetails = await this.datastore.getUserDetails(user.userId);
    const initials = extractInitials(userDetails.name);
    const { posts, likedPosts, responsePosts } = await this.getProfilePosts(
      user
    );
    const following = await this.datastore.getFollowing(user.userId);
    const followers = await this.datastore.getFollowers(user.userId);
    const isFollowing = isUserPresentInList(this.userId, followers);
    userDetails.joinedDate = formatDate(userDetails.joinedDate);
    userDetails.dob = formatDate(userDetails.dob);
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
    return {
      loggedUser: this.username,
      profile,
      followingList,
      initials: extractInitials(this.fullName),
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
      loggedUser: this.username,
      profile,
      followersList,
      initials: extractInitials(this.fullName),
      imageUrl: this.imageUrl,
    };
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
      initials: extractInitials(this.fullName),
      imageUrl: this.imageUrl,
    };
  }

  async getHashtagRelatedPosts(hashtag) {
    const posts = await this.datastore.getPostsByHashtag(hashtag);
    return {
      posts: await this.updatePost(this.userId, posts),
      loggedUser: this.username,
      hashtag,
      initials: extractInitials(this.fullName),
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
    const posts = await this.updatePost(this.userId, bookmarks);
    return {
      posts,
      loggedUser: this.username,
      initials: extractInitials(this.fullName),
      imageUrl: this.imageUrl,
    };
  }

  async updateUserDetails(newDetails) {
    return this.datastore.updateUserDetails(this.userId, newDetails);
  }
}

module.exports = App;
