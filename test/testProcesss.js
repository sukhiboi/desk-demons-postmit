const sinon = require('sinon');
const { assert } = require('chai');
const { getPosts } = require('../lib/processes');

describe('getPosts', () => {
  it('should give all the posts with user details', async () => {
    const userDetails = { name: 'john', username: 'john' };
    const getPostsStub = sinon.stub().resolves([{ id: 1, user_id: 1 }]);
    const getUserDetails = sinon.stub().resolves(userDetails);
    const dbClient = { getPosts: getPostsStub, getUserDetails };
    const expected = [
      { id: 1, user_id: 1, initials: 'J', name: 'john', username: 'john' },
    ];
    assert.deepStrictEqual(await getPosts(dbClient), expected);
    sinon.assert.calledOnce(getPostsStub);
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledWithExactly(getUserDetails, 1);
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
    const getPostsStub = sinon.stub().resolves([{ id: 1, user_id: 1 }]);
    const getUserDetails = sinon.stub().resolves(userDetails);
    const dbClient = { getPosts: getPostsStub, getUserDetails };
    const expected = [{ id: 1, user_id: 1, initials: 'J', username: 'john' }];
    assert.deepStrictEqual(await getPosts(dbClient), expected);
    sinon.assert.calledOnce(getPostsStub);
    sinon.assert.calledOnce(getUserDetails);
    sinon.assert.calledWithExactly(getUserDetails, 1);
  });
});
