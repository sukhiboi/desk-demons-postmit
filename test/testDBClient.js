const { assert } = require('chai');
const { DBClient } = require('../lib/DBClient');

describe('DBClient', () => {
  describe('getPosts', () => {
    it('should give all the records from the posts table', async () => {
      const expected = [{ id: 1 }];
      const all = (str, callback) => callback(null, expected);
      const dbClient = new DBClient({ all });
      try {
        const actual = await dbClient.getPosts();
        assert.deepStrictEqual(actual, expected);
      } catch (err) {
        assert.isNull(err);
      }
    });

    it('should give error when the posts table is not existing', async () => {
      const expected = 'table posts not exists';
      const all = (str, callback) => callback(expected, null);
      const dbClient = new DBClient({ all });
      try {
        const posts = await dbClient.getPosts();
        assert.isNull(posts);
      } catch (err) {
        assert.deepStrictEqual(err, expected);
      }
    });
  });
});
