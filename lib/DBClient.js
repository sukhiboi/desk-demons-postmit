class DBClient {
  constructor(db) {
    this.db = db;
  }

  getPosts() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM posts ORDER BY posted_at DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        }
      );
    });
  }

  getUserDetails(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM users WHERE user_id=${userId}`, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  getPostsByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM posts WHERE user_id=${userId} ORDER BY posted_at DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        }
      );
    });
  }

  getLatestPostOfUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM posts WHERE user_id=${userId} ORDER BY posted_at DESC LIMIT 1`,
        (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        }
      );
    });
  }

  addPost(postDetails) {
    const { user_id, message } = postDetails;
    const insertQuery = 'INSERT INTO posts(user_id,message,posted_at)';
    const values = `VALUES(${user_id},'${message}',CURRENT_TIMESTAMP);`;
    const query = `${insertQuery} ${values}`;
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(this.getLatestPostOfUser(user_id));
      });
    });
  }

  likePost(postId, userId) {
    const query = `INSERT INTO likes VALUES (${postId},${userId})`;
    return new Promise((resolve, reject) => {
      this.db.run(query, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  unlikePost(postId, userId) {
    const query = `DELETE FROM likes WHERE post_id=${postId} AND user_id=${userId}`;
    return new Promise((resolve, reject) => {
      this.db.run(query, (err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  }

  isLikedByUser(userId, postId) {
    const query = `SELECT * from likes WHERE post_id=${postId} AND user_id=${userId}`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, res) => {
        if (err) {
          reject(err);
        }
        if (res) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }
}

module.exports = { DBClient };
