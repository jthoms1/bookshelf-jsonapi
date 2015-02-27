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
  connection: {
    filename: path.join(__dirname, 'fixtures/test.sqlite')
  }
}));

describe('Invalid resources', function () {
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

  describe('Incorrect resource collection methods', function () {
    it('PUT should return 405', function(done) {
      request(app)
        .put('/api/posts')
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
        .del('/api/posts')
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
        .post('/api/posts/1')
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

  describe('Unknown resource collection', function() {
    it('GET should return 404', function(done) {
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
    it('POST should return 404', function(done) {
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

  describe('Unknown resource item', function() {
    it('GET should return 404', function(done) {
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
    it('PUT should return 404', function(done) {
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
    it('DELETE should return 404', function(done) {
      request(app)
        .del('/api/things/1')
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
});
