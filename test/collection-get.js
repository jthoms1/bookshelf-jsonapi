'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..'),
  db = require('./util/db'),
  migrate = require('./util/migrations'),
  expect = require('expect.js'),
  helper = require('./util/helper');

describe('GET Collection', function () {
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
    it('should return 404 for an uknown collection', function(done) {
      request(app)
        .get('/api/things')
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
    it('should return an object with empty data array when no resources exist', function(done) {
      request(app)
        .get('/api/authors')
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('array');
          expect(body.data).to.have.length(5);
          body.data.forEach(function(item) {
            expect(item).to.only.have.keys(['id', 'type', 'links', 'name', 'twitter', 'follower_count', 'created_at', 'updated_at']);
          });
          done();
        });
    });

    it('should include linked resources', function(done) {
      request(app)
        .get('/api/authors?include=books')
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          console.log(JSON.stringify(body, null, 2));
          expect(body.data).to.be.an('array');
          expect(body.data).to.have.length(5);
          done();
        });
    });

    it('should include sorted resources', function(done) {
      request(app)
        .get('/api/authors?sort=-id')
        .expect(200)
        .expect(helper.headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }

          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('array');
          expect(body.data).to.have.length(5);

          body.data.reduce(function(prev, cur) {
            expect(prev.id).to.be.above(cur.id);
            return cur;
          });

          done();
        });
    });
  });
});
