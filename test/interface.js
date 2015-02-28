'use strict';

var path = require('path'),
  express = require('express'),
  request = require('supertest'),
  knex = require('knex'),
  bookshelf = require('bookshelf'),
  jsonapi = require('..'),
  db = require('./fixtures/tableData'),
  expect = require('expect.js');

var bk = bookshelf(knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'fixtures/test.sqlite')
  }
}));

var headerContains = function (header, content) {
  return function (res) {
    if (res.headers[header.toLowerCase()].indexOf(content) === -1) {
      throw new Error('Header "' + header + '" does not contain "' + content + '".');
    }
  };
};

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

    it('GET with no resources should return an object with empty data array', function(done) {
      request(app)
        .get('/api/authors')
        .expect(200)
        .expect(headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('array');
          expect(body.data).to.have.length(0);
          done();
        });
    });

    it('POST should return a new item with id', function(done) {
      var reqBody = {
        data: {
          type: 'authors',
          name: 'Josh Thomas',
          email: 'jthoms1@gmail.com',
          'follower_count': 0
        }
      };
      request(app)
        .post('/api/authors')
        .send(reqBody)
        .expect(201)
        .expect(headerContains('Content-Type', 'application/vnd.api+json'))
        .end(function(err, results) {
          if (err) {
            console.log(err);
            throw err;
          }
          var body = JSON.parse(results.text);
          expect(body.data).to.be.an('object');
          expect(body.data).to.have.keys(['name', 'email', 'follower_count', 'type', 'id']);
          expect(body.data.type).to.be.equal('authors');
          expect(body.data.id).to.be.equal(1);
          done();
        });
    });

    it('DELETE should return an empty body and a 204', function(done) {
      request(app)
        .del('/api/authors/1')
        .expect(204)
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
