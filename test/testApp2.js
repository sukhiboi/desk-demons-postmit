const sinon = require('sinon');
const { assert } = require('chai');
const App = require('../lib/app');

describe('#App', () => {
  const userId = 1;
  const postId = 1;

  const userDetails = { name: 'john samuel', username: 'john', userId };

  const createDummyPosts = function () {
    return [{ postId: postId, userId, postedAt: new Date(), message: 'hi' }];
  };

  // const [dummyPost] = createDummyPosts();

  // const expectedTableError = new Error('Error: Table not found');
  const expectedUserDetailsError = new Error('Error: Invalid userId');

  describe('updateUser()', () => {
    const getUserDetailsStub = sinon.stub().resolves(userDetails);
    it('should update the userDetails in App if user is present', async () => {
      const app = new App({ getUserDetails: getUserDetailsStub });
      await app.updateUser(userId);
      assert.strictEqual(app.userId, userId);
      assert.strictEqual(app.username, userDetails.username);
      assert.strictEqual(app.fullName, userDetails.name);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
    });

    it('should reject any error', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const app = new App({ getUserDetails: getUserDetailsStub });
      try {
        await app.updateUser(userId);
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
        assert.isUndefined(app.userId);
        assert.isUndefined(app.username);
        assert.isUndefined(app.fullName);
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      }
    });
  });

  describe('updatePost()', () => {
    it('should update the given posts with required details', async () => {
      const getUserDetailsStub = sinon.stub().resolves(userDetails);
      const getAllPostLikersStub = sinon.stub().resolves([{ userId }]);
      const app = new App({
        getUserDetails: getUserDetailsStub,
        getAllPostLikers: getAllPostLikersStub,
      });
      const expected = [
        {
          initials: 'JS',
          isDeletable: true,
          isLiked: true,
          likedUsers: [{ userId: 1 }],
          message: 'hi',
          name: 'john samuel',
          postId: 1,
          postedAt: 'a few seconds ago',
          userId: 1,
          username: 'john',
        },
      ];
      const actual = await app.updatePost(userId, createDummyPosts());
      assert.deepStrictEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      sinon.assert.calledOnceWithExactly(getAllPostLikersStub, postId);
    });
    it('should reject any error', async () => {
      const getUserDetailsStub = sinon.stub().rejects(expectedUserDetailsError);
      const app = new App({ getUserDetails: getUserDetailsStub });
      try {
        await app.updatePost(userId, createDummyPosts());
      } catch (err) {
        assert.deepStrictEqual(err, expectedUserDetailsError);
        sinon.assert.calledOnceWithExactly(getUserDetailsStub, userId);
      }
    });
  });
});
