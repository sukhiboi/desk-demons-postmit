class DBClient {
  constructor(db) {
    this.db = db;
  }

  getAllPosts() {
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

  addPost(postDetails) {
    const { user_id, message } = postDetails;
    const timestamp = 'datetime(\'now\',\'localtime\')';
    const insertQuery = 'INSERT INTO posts(user_id,message,posted_at)';
    const values = `VALUES(${user_id},'${message}',${timestamp});`;
    const query = `${insertQuery} ${values}`;
    return new Promise(resolve => {
      this.db.run(query, err => {
        if (err) {
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  likePost(postId, userId) {
    const query = `INSERT INTO likes VALUES (${postId},${userId})`;
    return new Promise(resolve => {
      this.db.run(query, err => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  unlikePost(postId, userId) {
    const deleteQuery = 'DELETE FROM likes';
    const conditions = `WHERE post_id=${postId} AND user_id=${userId}`;
    const query = `${deleteQuery} ${conditions}`;
    return new Promise(resolve => {
      this.db.run(query, err => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  isLikedByUser(userId, postId) {
    const selectQuery = 'SELECT * from likes';
    const condition = `WHERE post_id=${postId} AND user_id=${userId}`;
    const query = `${selectQuery} ${condition}`;
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

  getAllLikedUsers(postId) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM likes WHERE post_id=${postId}`, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  getMatchingUsers(searchInput) {
    const query = `SELECT name,username from users where name like '${searchInput}%' or username like '${searchInput}%';`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  getUserIdByGithubUsername(username) {
    const query = `SELECT user_id FROM users WHERE github_username='${username}'`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, userId) => {
        if (err) {
          reject(err);
        }
        resolve(userId);
      });
    });
  }

  saveUser(userDetails) {
    const { githubUsername, username, name, dob, bio } = userDetails;
    const timestamp = 'datetime(\'now\',\'localtime\')';
    const insertStatement =
      'INSERT INTO users(username, github_username, name, bio, dob, joined_date)';
    const values = `VALUES('${username}', '${githubUsername}', '${name}','${bio}', '${dob}', ${timestamp})`;
    const query = `${insertStatement} ${values}`;

    return new Promise((resolve, reject) => {
      this.db.run(query, err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  getUserIdByUsername(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `select user_id from users where username='${username}'`,
        (err, row) => {
          if (err) {
            reject(err);
          }
          resolve(row);
        }
      );
    });
  }

  addFollower(userId, followerId) {
    const query = `INSERT INTO followers VALUES (${userId},${followerId})`;
    return new Promise((resolve, reject) => {
      this.db.run(query, err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  removeFollower(userId, followerId) {
    const query = `DELETE FROM followers WHERE user_id=${userId} and follower_id=${followerId}`;
    return new Promise((resolve, reject) => {
      this.db.run(query, err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  isFollower(userId, followerId) {
    const query = `SELECT * FROM followers WHERE user_id=${userId} and follower_id=${followerId}`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  getFollowers(userId) {
    const query = `SELECT user_id FROM followers WHERE follower_id=${userId}`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  getFollowings(userId) {
    const query = `SELECT follower_id FROM followers WHERE user_id=${userId}`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

module.exports = DBClient;
