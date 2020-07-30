class DBClient {
  constructor(db) {
    this.db = db;
  }

  getAllPosts() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM posts ORDER BY postedAt DESC',
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
        `SELECT * FROM posts WHERE userId=${userId} ORDER BY postedAt DESC`,
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
    const { userId, message } = postDetails;
    const timestamp = 'datetime(\'now\',\'localtime\')';
    const insertQuery = 'INSERT INTO posts(userId,message,postedAt)';
    const values = `VALUES(${userId},'${message}',${timestamp});`;
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
    const conditions = `WHERE postId=${postId} AND userId=${userId}`;
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
    const condition = `WHERE postId=${postId} AND userId=${userId}`;
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
      this.db.get(`SELECT * FROM users WHERE userId=${userId}`, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  getAllLikedUsers(postId) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM likes WHERE postId=${postId}`, (err, row) => {
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
    const query = `SELECT userId FROM users WHERE githubUsername='${username}'`;
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
    const timestamp = 'date(\'now\')';
    const insertStatement =
      'INSERT INTO users(username, githubUsername, name, bio, dob, joinedDate)';
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
        `select userId from users where username='${username}'`,
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
    const query = `DELETE FROM followers WHERE userId=${userId} and followerId=${followerId}`;
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
    const query = `SELECT * FROM followers WHERE userId=${userId} and followerId=${followerId}`;
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
    const query = `SELECT userId FROM followers WHERE followerId=${userId}`;
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
    const query = `SELECT followerId FROM followers WHERE userId=${userId}`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  deletePost(postId) {
    const transaction = `
    BEGIN TRANSACTION;
    DELETE FROM posts WHERE postId=${postId};
    DELETE FROM likes WHERE postId=${postId};
    COMMIT TRANSACTION;
    `;
    return new Promise((resolve, reject) => {
      this.db.exec(transaction, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(postId);
      });
    });
  }
}

module.exports = DBClient;
