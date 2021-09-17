const followersData = require('./../data/followersData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('followers').del()
    .then(function () {
      // Inserts seed entries
      return knex('followers').insert(followersData);
    });
};
