const request = require('supertest');
const { app } = require('../lib/app');

describe('Handlers', () => {
  context('Request for Home Page', () => {
    it('Should serve the Home Page with Posts', done => {
      const userDetails = { name: 'john', username: 'john' };
      const dbClient = {};
      dbClient.getPosts = () => Promise.resolve([{ id: 1 }]);
      dbClient.getUserDetails = () => Promise.resolve(userDetails);
      app.locals.dbClient = dbClient;
      request(app).get('/').expect(200).expect(/john/, done);
    });
  });
});
