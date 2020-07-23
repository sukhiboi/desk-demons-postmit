class DBClient {
  constructor(db) {
    this.db = db;
  }

  getPosts() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM posts', (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
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

  getPostsByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM posts WHERE user_id=${userId}`,
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        }
      );
    });
  }
}

module.exports = { DBClient };
