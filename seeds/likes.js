const likesData = require('./../data/likesData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('likes').del()
    .then(function () {
      // Inserts seed entries
      return knex('likes').insert(likesData);
    });
};
