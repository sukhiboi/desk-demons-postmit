const bookmarksData = require('./../data/bookmarksData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('bookmarks').del()
    .then(function () {
      // Inserts seed entries
      return knex('bookmarks').insert(bookmarksData);
    });
};
