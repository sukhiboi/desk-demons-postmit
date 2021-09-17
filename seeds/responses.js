const responsesData = require('./../data/responsesData.json');
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('responses').del()
    .then(function () {
      // Inserts seed entries
      return knex('responses').insert(responsesData);
    });
};
