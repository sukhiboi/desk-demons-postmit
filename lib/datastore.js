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
}

module.exports = Datastore;
