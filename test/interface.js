'use strict';

var express = require('express'),
  request = require('supertest'),
  knex = require('knex'),
  bookshelf = require('bookshelf'),
  jsonapi = require('..');

function errorDone(done) {
  return function (err, results) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      console.log(results);
      done();
    }
  };
}

function setupEnvironment() {
  var data = require('./fixtures/data');
  var bk = bookshelf(knex({
    client: 'sqlite3',
    connection: {
      database: 'bookshelf_test',
      user: 'root',
      encoding: 'utf8'
    }
  }));

  data.up(bk.knex).then(function () {

  });
}


describe('Resource collection methods', function () {
  var app = express();
  app.use('/api', jsonapi());

  it('POST should return a new item with id', function(done) {
    request(app)
      .post('/api/posts')
      .expect(200)
      .end(errorDone(done));
  });
});
