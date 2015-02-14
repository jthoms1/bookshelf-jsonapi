'use strict';

exports.up = function(knex) {
  return knex.schema
    .createTable('authors', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('email').unique();
      table.integer('follower_count');
    })
    .createTable('posts', function(table) {
      table.increments('id').primary();
      table.string('details');
      table.integer('author_id').references('authors.id');
    });
};

exports.models = function(bookshelf) {
  return {
    posts: bookshelf.Model.extend({
      tableName: 'authors',
      idAttribute: 'id'
    }),
    authors: bookshelf.Model.extend({
      tableName: 'posts',
      idAttribute: 'id'
    })
  };
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('books')
    .dropTable('summaries');
};
