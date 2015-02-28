'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations');

describe('General invalid resource requests', function () {
  var app = express();
  app.use('/api', jsonapi(db.models));

  before(function(done) {
    migrate.up(db.knex)
      .then(function() {
        return migrate.insertData(db.knex);
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });
  after(function(done) {
    migrate.down(db.knex)
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  describe('Incorrect resource collection methods', function () {
    it('PUT should return 405', function(done) {
      request(app)
        .put('/api/books')
        .expect(405)
        .expect('Allow', 'GET, POST, OPTIONS')
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });

    it('DELETE should return 405', function (done) {
      request(app)
        .del('/api/books')
        .expect(405)
        .expect('Allow', 'GET, POST, OPTIONS')
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });
  });

  describe('Incorrect resource item methods', function () {
    it('POST should return 405', function(done) {
      request(app)
        .post('/api/books/1')
        .expect(405)
        .expect('Allow', 'GET, PUT, DELETE, OPTIONS')
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });
  });
});
