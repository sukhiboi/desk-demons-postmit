const queries = require('./queries');

class Datastore {
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
    return this.get(queries.userDetails, [userId]);
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

  savePost(userId, content) {
    return this.run(queries.savePost, [userId, content]);
  }

  unlikePost(postId, userId) {
    return this.run(queries.unlikePost, [postId, userId]);
  }

  likePost(postId, userId) {
    return this.run(queries.likePost, [postId, userId]);
  }

  removePost(postId) {
    return this.exec(queries.removePost(postId));
  }

  followUser(userId, followerId) {
    return this.run(queries.followUser, [userId, followerId]);
  }

  unFollowUser(userId, followerId) {
    return this.run(queries.unFollowUser, [userId, followerId]);
  }

  getFollowers(userId) {
    return this.all(queries.followers, [userId]);
  }

  getIdByUsername(username) {
    return this.get(queries.idByUsername, [username]);
  }

  saveUser(userDetails) {
    const { githubUsername, username, name, dob, bio } = userDetails;
    const details = [username, githubUsername, name, bio, dob];
    return this.run(queries.saveUser, details);
  }

  getLikedPosts(userId) {
    return this.all(queries.likedPosts, [userId]);
  }

  getMatchingUsers(searchInput) {
    const searchString = `${searchInput}%`;
    return this.all(queries.matchingUsers, [searchString, searchString]);
  }

  getIdByGithubUsername(githubUsername) {
    return this.get(queries.idByGithubUsername, [githubUsername]);
  }

  getPost(postId) {
    return this.get(queries.post, [postId]);
  }

  getHashtagsByPostId(postId) {
    return this.all(queries.hashtags, [postId]);
  }

  getBookmarks(userId) {
    return this.all(queries.bookmarks, [userId]);
  }

  getPostsByHashtag(hashtag) {
    return this.all(queries.postsByHashtag, [hashtag]);
  }

  addHashtag(hashtag, postId) {
    return this.run(queries.addHashtag, [postId, hashtag]);
  }
}

module.exports = Datastore;
