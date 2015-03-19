'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations'),
  expect = require('expect.js'),
  helper = require('./util/helper');

describe('GET Resource', function () {
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
    it('should return 404 for an unknown resource url', function(done) {
      request(app)
        .get('/api/things/1')
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
    it('should return an object', function(done) {
      var mock = {
        'data': {
          'id': 1,
          'name': 'Neal Stephenson',
          'twitter': '@nealstephenson',
          'follower_count': 35700,
          'created_at': null,
          'updated_at': null,
          'type': 'authors',
          'links': {
            'self': '/api/authors/1'
          }
        }
      };
      request(app)
        .get('/api/authors/1')
        .expect(200)
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
