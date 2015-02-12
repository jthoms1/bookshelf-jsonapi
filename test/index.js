'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..');

describe('Incorrect resource collection methods', function () {
  var app = express();
  var models = {};

  app.use('/api', jsonapi(models));

  it('PUT should return 405', function(done) {

    request(app)
      .put('/api/things')
      .expect(405)
      .expect('Allow', 'GET, POST, OPTIONS')
      .end(done);
  });

  it('DELETE should return 405', function (done) {

    request(app)
      .del('/api/things')
      .expect(405)
      .expect('Allow', 'GET, POST, OPTIONS')
      .end(done);
  });
});

describe('Incorrect resource item methods', function () {
});

describe('Unknown resource collection', function() {
  it('GET should return 404', function(done) {
    var app = express();
    var models = {};

    app.use('/api', jsonapi(models));

    request(app)
      .get('/api/things')
      .expect(404)
      .end(done);
  });
  it('POST should return 404', function(done) {
    var app = express();
    var models = {};

    app.use('/api', jsonapi(models));

    request(app)
      .post('/api/things')
      .expect(404)
      .end(done);
  });
});

describe('Unknown resource item', function() {
  it('GET should return 404', function(done) {
    var app = express();
    var models = {};

    app.use('/api', jsonapi(models));

    request(app)
      .get('/api/things/1')
      .expect(404)
      .end(done);
  });
  it('PUT should return 404', function(done) {
    var app = express();
    var models = {};

    app.use('/api', jsonapi(models));

    request(app)
      .put('/api/things/1')
      .expect(404)
      .end(done);
  });
  it('DELETE should return 404', function(done) {
    var app = express();
    var models = {};

    app.use('/api', jsonapi(models));

    request(app)
      .del('/api/things/1')
      .expect(404)
      .end(done);
  });
});
