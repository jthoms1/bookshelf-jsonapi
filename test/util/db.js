'use strict';

var path = require('path'),
  knex = require('knex'),
  bookshelf = require('bookshelf');

var bk = bookshelf(knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../fixtures/test.sqlite')
  }
}));

module.exports = {
  bookshelf: bk,
  knex: bk.knex,
  models: {
    authors: bk.Model.extend({
      tableName: 'authors',
      idAttribute: 'id',
      books: function () {
        return this.hasMany(module.exports.models.books, 'author_id');
      }
    }),
    books: bk.Model.extend({
      tableName: 'books',
      idAttribute: 'isbn10',
      hasTimestamps: ['created_at', 'updated_at'],
      author: function () {
        return this.belongsTo(module.exports.models.authors, 'author_id');
      }
    })
  }
};
