class DBClient {
  constructor(db) {
    this.db = db;
  }

  getPosts() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM posts', (err, res) => {
        err && reject(err);
        resolve(res);
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
}

module.exports = { DBClient };
