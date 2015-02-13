'use strict';

var express = require('express'),
  request = require('supertest'),
  jsonapi = require('..');

describe('Incorrect resource collection methods', function () {
  var app = express();
  var models = {
    'things': {}
  };
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
  var app = express();
  var models = {
    'things': {}
  };
  app.use('/api', jsonapi(models));

  it('POST should return 405', function(done) {
    request(app)
    .post('/api/things/1')
      .expect(405)
      .expect('Allow', 'GET, PUT, DELETE, OPTIONS')
      .end(done);
  });
});

describe('Unknown resource collection', function() {
  var app = express();
  var models = {
    'things': {}
  };
  app.use('/api', jsonapi(models));

  it('GET should return 404', function(done) {
    request(app)
      .get('/api/users')
      .expect(404)
      .end(done);
  });
  it('POST should return 404', function(done) {
    request(app)
      .post('/api/users')
      .expect(404)
      .end(done);
  });
});

describe('Unknown resource item', function() {
  var app = express();
  var models = {
    'things': {}
  };
  app.use('/api', jsonapi(models));

  it('GET should return 404', function(done) {
    request(app)
      .get('/api/users/1')
      .expect(404)
      .end(done);
  });
  it('PUT should return 404', function(done) {
    request(app)
      .put('/api/users/1')
      .expect(404)
      .end(done);
  });
  it('DELETE should return 404', function(done) {
    request(app)
      .del('/api/users/1')
      .expect(404)
      .end(done);
  });
});
