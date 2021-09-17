const repostsData = require('./../data/repostsData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('reposts').del()
    .then(function () {
      // Inserts seed entries
      return knex('reposts').insert(repostsData);
    });
};
