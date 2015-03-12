'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations'),
  expect = require('expect.js'),
  helper = require('./util/helper');

describe('POST Resource', function () {
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

  describe('Invalid Scenarios', function () {
    it('should return 404 for an uknown resource url', function(done) {
      request(app)
        .post('/api/things')
        .expect(404)
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });
  });

  describe('Valid Scenarios', function () {
    it('should return a new item with id', function(done) {
      var reqBody = {
        'data': {
          'type': 'authors',
          'name': 'Richard Stallman',
          'twitter': null,
          'follower_count': 0
        }
      };
      var mock = {
        'data': {
          'type': 'authors',
          'name': 'Richard Stallman',
          'twitter': null,
          'follower_count': 0,
          'id': 6
        }
      };
      request(app)
        .post('/api/authors')
        .send(reqBody)
        .expect(201)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body).to.eql(mock);
          done();
        });
    });
  });
});
