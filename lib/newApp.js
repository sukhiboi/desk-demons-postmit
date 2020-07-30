const {
  extractInitials,
  sortByDate,
  parseTimeStamp,
} = require('./helperFunctions');

class NewApp {
  constructor(datastore) {
    this.datastore = datastore;
  }

  async updatePost(userId, posts) {
    try {
      const updatedPosts = posts.map(async post => {
        const user = await this.datastore.getUserDetails(post.userId);
        post.likedUsers = await this.datastore.getAllPostLikers(post.postId);
        post.isLiked = post.likedUsers.some(user => user.userId === userId);
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
      const { name } = await this.datastore.getUserDetails(userId);
      const followings = await this.datastore.getFollowing(userId);
      const usersIds = [{ userId }, ...followings];
      const postIds = usersIds.map(user => {
        return this.datastore.getUserPosts(user.userId);
      });
      const posts = await Promise.all(postIds);
      const sortedPosts = sortByDate(posts.flat());
      const updatedPosts = await this.updatePost(userId, sortedPosts);
      return { initials: extractInitials(name), posts: updatedPosts };
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
      const isPostLikeByUser = likedUsers.some(user => user.userId === userId);
      if (isPostLikeByUser) {
        return this.datastore.unlikePost(postId, userId);
      }
      return this.datastore.likePost(postId, userId);
    } catch (err) {
      Promise.reject(err);
    }
  }

  deletePost(postId) {
    return this.datastore.removePost(postId);
  }
}

module.exports = NewApp;
