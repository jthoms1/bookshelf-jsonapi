'use strict';

exports.up = function(knex) {
  return knex.schema
    .createTable('authors', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('email').unique();
      table.integer('follower_count');
      table.timestamps();
    })
    .createTable('posts', function(table) {
      table.increments('id').primary();
      table.string('details');
      table.integer('author_id').references('authors.id');
      table.timestamps();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('authors')
    .dropTable('posts');
};
