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
    it('should accept only updating resource attributes', function(done) {
      var reqBody = {
        data: {
          id: 1,
          type: 'authors',
          'follower_count': 10
        }
      };
      request(app)
        .put('/api/authors/1')
        .send(reqBody)
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('object');
          expect(body.data).to.have.keys(['follower_count', 'type', 'id']);
          expect(body.data.type).to.be.equal('authors');
          expect(body.data.id).to.be.equal(1);
          expect(body.data.follower_count).to.be.equal(10);
          done();
        });
    });
  });
});
