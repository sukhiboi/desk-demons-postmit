const hashtagsData = require('./../data/hashtagsData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('hashtags').del()
    .then(function () {
      // Inserts seed entries
      return knex('hashtags').insert(hashtagsData);
    });
};
