'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations'),
  expect = require('expect.js'),
  helper = require('./util/helper');

describe('PUT Resource', function () {
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
        .put('/api/things/1')
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
    it('should return a 204 if no values updated other than those sent', function(done) {
      var reqBody = {
        'data': {
          'id': 1,
          'type': 'authors',
          'follower_count': 12,
          'links': {
            'self': '/api/authors/1'
          }
        }
      };
      request(app)
        .put('/api/authors/1')
        .send(reqBody)
        .expect(204)
        .end(function(err) {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });

    it('should return a 200 and all resources if values updated other than those sent', function (done) {
      var reqBody = {
        'data': {
          'id': '0553380958',
          'publish_year': 2001,
          'type': 'books'
        }
      };
      var mock = {
        'data': {
          'id': '0553380958',
          'created_at': 'Mon Sep 07 2015 20:22:28 GMT-0500 (CDT)',
          'name': 'Snow Crash',
          'publish_year': 2001,
          'page_length': 440,
          'author_id': 1,
          'type': 'books',
          'links': {
            'self': '/api/books/0553380958'
          }
        }
      };

      request(app)
        .put('/api/books/0553380958')
        .send(reqBody)
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.have.key('updated_at');
          delete body.data.updated_at;
          expect(body).to.eql(mock);
          done();
        });
    });
  });
});
