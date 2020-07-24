const request = require('supertest');
const sinon = require('sinon');
const { app } = require('../lib/app');

describe('Handlers', () => {
  context('Request for Home Page', () => {
    it('Should serve the Home Page with Posts', done => {
      const userDetails = { name: 'john', username: 'john' };
      const getPosts = sinon.stub().resolves([{ id: 1, user_id: 1 }]);
      const getUserDetails = sinon.stub().resolves(userDetails);
      app.locals.dbClient = { getPosts, getUserDetails };
      request(app)
        .get('/')
        .expect(200)
        .expect(() => {
          sinon.assert.calledOnce(getPosts);
          sinon.assert.calledOnce(getUserDetails);
          sinon.assert.calledOnceWithExactly(getUserDetails, 1);
        })
        .expect(/john/, done);
    });
  });
});
