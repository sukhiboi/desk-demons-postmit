exports.up = function (knex) {
  return knex.schema
    .createTable('users', function (table) {
      table.integer('userId').primary();
      table.string('username', 15).notNullable().unique();
      table.string('githubUsername', 39).notNullable().unique();
      table.string('name', 50);
      table.string('bio', 160);
      table.date('dob');
      table.date('joinedDate').notNullable();
      table.string('imageUrl', 255);
    })
    .createTable('posts', function (table) {
      table.integer('postId').primary();
      table.integer('userId').notNullable();
      table.string('message', 180).notNullable();
      table.timestamp('postedAt').notNullable();
    })
    .createTable('responses', function (table) {
      table.integer('postId').notNullable();
      table.integer('responseId').primary();
    })
    .createTable('likes', function (table) {
      table.integer('postId').notNullable();
      table.integer('userId').notNullable();
    })
    .createTable('reposts', function (table) {
      table.integer('postId').notNullable();
      table.integer('userId').notNullable();
    })
    .createTable('bookmarks', function (table) {
      table.integer('postId').notNullable();
      table.integer('userId').notNullable();
    })
    .createTable('followers', function (table) {
      table.integer('userId').notNullable();
      table.integer('followerId').notNullable();
    })
    .createTable('hashtags', function (table) {
      table.integer('postId').notNullable();
      table.string('hashtag', 20).notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('users')
    .dropTable('posts')
    .dropTable('responses')
    .dropTable('likes')
    .dropTable('reposts')
    .dropTable('bookmarks')
    .dropTable('followers')
    .dropTable('hashtags');
};
