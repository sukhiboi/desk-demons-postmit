const queries = require('./queries');

class PostsHandler {
  constructor(db) {
    this.db = db;
  }

  getUserPosts(userId) {
  }

  savePost(userId, message, responseParentId) {
  }

  likePost(postId, userId) {
  }

  unlikePost(postId, userId) {
  }

  repost(postId, userId) {
  }

  undoRepost(postId, userId) {
  }

  removePost(postId) {
  }

  getLikedPosts(userId) {
  }

  getPost(postId) {
  }

  getHashtagsByPostId(postId) {
  }

  getRepostsByUserId(userId) {
  }

  getAllReposts(postId) {

  }

  getAllPostLikers(postId) {

  }

  getPostsByHashtag(hashtag) {
  }

  getAllResponses(postId) {
  }

  getReplyingTo(postId) {
  }

  getUserResponses(userId) {

  }
}

class UserHandler {
  constructor(db) {
    this.db = db;
    this.users = db('users');
  }

  getUserDetails(userId) {
    return this.users.where({userId}).select();
  }

  followUser(userId, followerId) {
    return this.db('followers').insert({userId, followerId});
  }

  unFollowUser(userId, followerId) {
    return this.db('followers').where({userId, followerId}).del();
  }

  getFollowers(userId) {
    return this.db('followers')
      .join('users', 'followers.userId', '=', 'users.userId')
      .where('followers.followerId', userId)
      .select('users.*');
  }

  getFollowing(userId) {
    return this.db('followers')
      .join('users', 'followers.followerId', '=', 'users.userId')
      .where('followers.userId', userId)
      .select('users.*');
  }

  getIdByUsername(username) {
    return this.users
      .where({username})
      .select('id');
  }

  getIdByGithubUsername(githubUsername) {
    return this.users
      .where({githubUsername})
      .select('id');
  }

  saveUser(userDetails) {
    return this.users.insert({...userDetails, joinedDate: new Date()});
  }

  updateUserDetails(userId, newDetails) {
    return this.users.where({userId}).update(newDetails);
  }
}

class Search {
  constructor(db) {
    this.db = db;
  }

  getMatchingUsers(searchInput) {
  }

  getMatchingHashtags(searchInput) {
  }
}

class BookmarkHandler {
  constructor(db) {
    this.db = db;
  }

  getBookmarks(userId) {
  }

  addBookmark(postId, userId) {
  }

  removeBookmark(postId, userId) {
  }
}

class Database {
  constructor(db) {
    this.db = db;
  }

  get(query, params) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  all(query, params) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  run(query, params) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  exec(query) {
    return new Promise((resolve, reject) => {
      this.db.exec(query, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  getUserDetails(userId) {
    return this.get(queries.select('users', 'userId', '*'), [userId]);
  }

  getUserPosts(userId) {
    return this.all(queries.userPosts, [userId]);
  }

  getFollowing(userId) {
    return this.all(queries.following, [userId]);
  }

  getAllPostLikers(postId) {
    return this.all(queries.postLikers, [postId]);
  }

  savePost(userId, message, responseParentId) {
    const postId = userId + new Date().getTime();
    return this.exec(
      queries.savePost(message, userId, postId, responseParentId)
    );
  }

  unlikePost(postId, userId) {
    return this.run(queries.unlikePost, [postId, userId]);
  }

  likePost(postId, userId) {
    return this.run(queries.insert('likes'), [postId, userId]);
  }

  undoRepost(postId, userId) {
    return this.run(queries.undoRepost, [postId, userId]);
  }

  repost(postId, userId) {
    return this.run(queries.insert('reposts'), [postId, userId]);
  }

  removePost(postId) {
    return this.exec(queries.removePost(postId));
  }

  followUser(userId, followerId) {
    return this.run(queries.insert('followers'), [userId, followerId]);
  }

  unFollowUser(userId, followerId) {
    return this.run(queries.unFollowUser, [userId, followerId]);
  }

  getFollowers(userId) {
    return this.all(queries.followers, [userId]);
  }

  getIdByUsername(username) {
    return this.get(queries.select('users', 'username', 'userId'), [username]);
  }

  saveUser(userDetails) {
    const {githubUsername, username, name, dob, bio, imageUrl} = userDetails;
    const details = [username, githubUsername, name, bio, dob, imageUrl];
    return this.run(queries.saveUser, details);
  }

  getLikedPosts(userId) {
    return this.all(queries.likedPosts, [userId]);
  }

  getMatchingUsers(searchInput) {
    const searchString = `${searchInput}%`;
    return this.all(queries.matchingUsers, [searchString, searchString]);
  }

  getMatchingHashtags(searchInput) {
    return this.all(queries.matchingHashtags, [`${searchInput}%`]);
  }

  getIdByGithubUsername(githubUsername) {
    const query = queries.select('users', 'githubUsername', 'userId');
    return this.get(query, [githubUsername]);
  }

  getPost(postId) {
    return this.get(queries.getPost, [postId]);
  }

  getHashtagsByPostId(postId) {
    return this.all(queries.select('hashtags', 'postId', 'hashtag'), [postId]);
  }

  getBookmarks(userId) {
    return this.all(queries.bookmarks, [userId]);
  }

  getPostsByHashtag(hashtag) {
    return this.all(queries.postsByHashtag, [hashtag]);
  }

  addBookmark(postId, userId) {
    return this.run(queries.insert('bookmarks'), [postId, userId]);
  }

  removeBookmark(postId, userId) {
    return this.run(queries.removeBookmark, [postId, userId]);
  }

  getAllResponses(postId) {
    return this.all(queries.responses, [postId]);
  }

  getReplyingTo(postId) {
    return this.get(queries.replyingTo, [postId]);
  }

  getUserResponses(userId) {
    return this.all(queries.userResponses, [userId]);
  }

  updateUserDetails(userId, newDetails) {
    const {username, name, bio, dob} = newDetails;
    const details = [username, name, bio, dob, userId];
    return this.run(queries.updateUser, details);
  }

  getRepostsByUserId(userId) {
    return this.all(queries.reposts, [userId]);
  }

  getAllReposts(postId) {
    return this.all(queries.allReposts, [postId]);
  }
}

module.exports = Database;
