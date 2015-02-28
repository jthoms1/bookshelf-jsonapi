'use strict';

var authorData = [
  {
    id: 1,
    name: 'Neal Stephenson',
    twitter: '@nealstephenson',
    'follower_count': 35700
  },
  {
    id: 2,
    name: 'William Gibson',
    twitter: '@greatdismal',
    'follower_count': 161000
  },
  {
    id: 3,
    name: 'Bruce Sterling',
    twitter: 'bruces',
    'follower_count': 31300
  },
  {
    id: 4,
    name: 'Isaac Asimov',
    twitter: null,
    'follower_count': 0
  },
  {
    id: 5,
    name: 'Philip K. Dick',
    twitter: null,
    'follower_count': 0
  }
];

var bookData = [
  {
    isbn10: '0553380958',
    name: 'Snow Crash',
    'publish_year': 2000,
    'page_length': 440,
    'author_id': 1
  },
  {
    isbn10: '0670921556',
    name: 'The Peripheral',
    'publish_year': 2014,
    'page_length': 486,
    'author_id': 2
  },
  {
    isbn10: '0441569595',
    name: 'Neuromancer',
    'publish_year': 1986,
    'page_length': 271,
    'author_id': 2
  },
  {
    isbn10: '0441117732',
    name: 'Count Zero',
    'publish_year': 1987,
    'page_length': 246,
    'author_id': 2
  },
  {
    isbn10: '0425198685',
    name: 'Pattern Recognition',
    'publish_year': 2005,
    'page_length': 384,
    'author_id': 2
  }
];

exports.up = function(knex) {
  return knex.schema
    .createTable('authors', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('twitter').unique();
      table.integer('follower_count');
      table.timestamps();
    })
    .createTable('books', function(table) {
      table.string('isbn10').primary();
      table.string('name');
      table.date('publish_year');
      table.integer('page_length');
      table.integer('author_id').references('authors.id');
      table.timestamps();
    });
};

exports.insertData = function(knex) {
  return knex('authors').insert(authorData)
    .then(function() {
      return knex('books').insert(bookData);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('authors')
    .dropTable('books');
};
