'use strict';

var path = require('path'),
  express = require('express'),
  request = require('supertest'),
  knex = require('knex'),
  bookshelf = require('bookshelf'),
  jsonapi = require('..'),
  db = require('./fixtures/tableData');

var bk = bookshelf(knex({
  client: 'sqlite3',
  debug: true,
  connection: {
    filename: path.join(__dirname, 'fixtures/test.sqlite')
  }
}));

describe('Valid resources', function () {
  var app = express();
  app.use('/api', jsonapi(db.models(bk)));

  before(function(done) {
    db.up(bk.knex)
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });
  after(function(done) {
    db.down(bk.knex)
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  describe('Resource collection methods', function () {
    var body = {
      data: {
        name: 'Josh Thomas',
        email: 'jthoms1@gmail.com',
        'follower_count': 0
      }
    };
    it('POST should return a new item with id', function(done) {
      request(app)
        .post('/api/authors')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log(results.body);
          done();
        });
    });
  });
});
