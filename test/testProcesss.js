const sinon = require('sinon');
const { assert } = require('chai');
const { getPosts, getUserProfile } = require('../lib/processes');

describe('getPosts', () => {
  const user_id = 1;
  it('should give all the posts with user details', async () => {
    const userDetails = { name: 'john', username: 'john' };
    const posts = [{ id: 1, user_id: 1, posted_at: new Date() }];
    const getPostsStub = sinon.stub().resolves(posts);
    const getUserDetails = sinon.stub().resolves(userDetails);
    const dbClient = { getPosts: getPostsStub, getUserDetails };
    const expected = [
      {
        id: 1,
        user_id: 1,
        initials: 'J',
        name: 'john',
        username: 'john',
        posted_at: 'a few seconds ago',
      },
    ];
    assert.deepStrictEqual(await getPosts(dbClient), expected);
    sinon.assert.calledOnce(getPostsStub);
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledWithExactly(getUserDetails, user_id);
  });

  it('should give an empty when the dbClient rejects', async () => {
    const getPostsStub = sinon.stub().rejects('no table found');
    const getUserDetails = sinon.stub().resolves({});
    const dbClient = { getPosts: getPostsStub, getUserDetails };
    assert.deepStrictEqual(await getPosts(dbClient), []);
    sinon.assert.calledOnce(getPostsStub);
    sinon.assert.notCalled(getUserDetails);
  });

  it('should give initials from username when name is not existing', async () => {
    const userDetails = { username: 'john' };
    const posts = [{ id: 1, user_id: 1, posted_at: new Date() }];
    const getPostsStub = sinon.stub().resolves(posts);
    const getUserDetails = sinon.stub().resolves(userDetails);
    const dbClient = { getPosts: getPostsStub, getUserDetails };
    const expected = [
      {
        id: 1,
        user_id: 1,
        initials: 'J',
        username: 'john',
        posted_at: 'a few seconds ago',
      },
    ];
    assert.deepStrictEqual(await getPosts(dbClient), expected);
    sinon.assert.calledOnce(getPostsStub);
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledWithExactly(getUserDetails, user_id);
  });
});

describe('getUserProfile', () => {
  const user_id = 1;

  it('should give profile of user by userId', async () => {
    const userDetails = { user_id, name: 'john', username: 'john' };
    const getUserDetails = sinon.stub().resolves(userDetails);
    const getPostsByUserId = sinon
      .stub()
      .resolves([{ message: 'hi', posted_at: '2020-02-21 12:45:16' }]);
    const dbClient = { getUserDetails, getPostsByUserId };
    const expected = {
      user_id,
      initials: 'J',
      name: 'john',
      username: 'john',
      posts: [
        {
          message: 'hi',
          posted_at: '2020-02-21 12:45:16',
          initials: 'J',
          name: 'john',
          username: 'john',
        },
      ],
    };
    assert.deepStrictEqual(await getUserProfile(dbClient, user_id), expected);
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledOnce(getPostsByUserId);
    sinon.assert.calledWithExactly(getUserDetails, user_id);
    sinon.assert.calledWithExactly(getPostsByUserId, user_id);
  });

  it('should handle the rejection of getPostsByUserId', async () => {
    const userDetails = { user_id: 1, name: 'john', username: 'john' };
    const getUserDetails = sinon.stub().resolves(userDetails);
    const getPostsByUserId = sinon.stub().rejects('posts table not found');
    const dbClient = { getUserDetails, getPostsByUserId };
    assert.deepStrictEqual(await getUserProfile(dbClient, user_id), {
      user_id,
      initials: 'J',
      name: 'john',
      username: 'john',
      posts: [],
    });
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledOnce(getPostsByUserId);
    sinon.assert.calledWithExactly(getUserDetails, user_id);
    sinon.assert.calledWithExactly(getPostsByUserId, user_id);
  });

  it('should handle the rejection of getUserDetails', async () => {
    const getUserDetails = sinon.stub().rejects('userId not found');
    const getPostsByUserId = sinon.stub().resolves([]);
    const dbClient = { getUserDetails, getPostsByUserId };
    assert.deepStrictEqual(await getUserProfile(dbClient, user_id), {
      errMsg: 'Invalid userId',
      posts: [],
    });
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.notCalled(getPostsByUserId);
    sinon.assert.calledWithExactly(getUserDetails, user_id);
    sinon.assert.notCalled(getPostsByUserId);
  });
});
