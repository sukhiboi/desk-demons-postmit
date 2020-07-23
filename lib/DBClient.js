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
}

module.exports = { DBClient };
