'use strict';

var utils = require('../utils'),
  expect = require('expect.js');

describe('Utility Module', function () {
  describe('Filter Testing', function () {
    it('should return an empty object by default', function(done) {
      var filterObj = utils.parseFilters({});
      expect(filterObj).to.eql({});
      done();
    });

    it('should return an object key/value from what is supplied', function(done) {
      var filterObj = utils.parseFilters({
        name: 'test',
        count: 100,
        twitter: '@jthoms1'
      });
      expect(filterObj).to.eql({
        name: 'test',
        count: 100,
        twitter: '@jthoms1'
      });
      done();
    });

    it('should return no filter results for reserved words', function(done) {
      var filterObj = utils.parseFilters({
        sort: 1,
        include: 1,
        limit: 1,
        itemId: 1,
        name: 'test'
      });
      expect(filterObj).to.eql({
        name: 'test'
      });
      done();
    });
  });

  describe('Links Testing', function () {
    it('should return undefined if no links are referenced', function(done) {
      var linkObj = utils.parseLinks({});
      expect(linkObj).to.be(undefined);
      done();
    });

    it('should return an object containing related items in an array', function(done) {
      var linkObj = utils.parseLinks({
        include: 'books.authors,posts'
      });
      expect(linkObj).to.be.an('object');
      expect(linkObj).to.have.key('withRelated');
      expect(linkObj.withRelated).to.be.an('array');
      expect(linkObj.withRelated).to.eql(['books.authors', 'posts']);
      done();
    });
  });

  describe('Sorting Testing', function () {
    it('should return undefined if there is no sort applied', function(done) {
      var sortObj = utils.parseSorting({});
      expect(sortObj).to.be(undefined);
      done();
    });

    it('should identify a + before an attribute as being ascending', function(done) {
      var sortObj = utils.parseSorting({
        sort: '+name'
      });
      expect(sortObj).to.be.an('object');
      expect(sortObj).to.only.have.keys(['column', 'direction']);
      expect(sortObj.column).to.be('name');
      expect(sortObj.direction).to.be('asc');
      done();
    });

    it('should identify a - before an attribute as being descending', function(done) {
      var sortObj = utils.parseSorting({
        sort: '-name'
      });
      expect(sortObj).to.be.an('object');
      expect(sortObj).to.only.have.keys(['column', 'direction']);
      expect(sortObj.column).to.be('name');
      expect(sortObj.direction).to.be('desc');
      done();
    });

    it('should return undefined if neither a - or + is supplied before an attribute', function(done) {
      var sortObj = utils.parseSorting({
        sort: 'name'
      });
      expect(sortObj).to.be(undefined);
      done();
    });
  });

  describe('Limits Testing', function () {
    it('should contain a default limit of 10 items', function(done) {
      var limitObj = utils.parseLimits({});
      expect(limitObj).to.be.an('object');
      expect(limitObj).to.have.key('limit');
      expect(limitObj.limit).to.be(10);
      done();
    });
  });
});
