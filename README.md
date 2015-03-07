[![Build
Status](https://travis-ci.org/jthoms1/bookshelf-jsonapi.svg?branch=master)](https://travis-ci.org/jthoms1/bookshelf-jsonapi)


bookshelf-jsonapi
=================

Simple library that uses Bookshelf models and relationships to create a RESTful api based on jsonapi.org spec using an express 4 compatible middleware.

Usage
==================
Define your Bookshelf models and their relationships.  Pass an object to the jsonapi middleware that contains 'resourceName' => 'modelReference'.  This should allow your application to serve jsonapi compatible rest services with very little setup.
```JavaScript
var jsonapi = require('jsonapi-bookshelf');
var models = require('./models'); // key model name, value model object

app.use('/api', jsonapi(models));
```

Please refer to the tests to see detailed examples of how the middlware works
