[![Build
Status](https://travis-ci.org/jthoms1/jsonapi-bookshelf.png?branch=master)](https://travis-ci.org/jthoms1/jsonapi-bookshelf)


jsonapi-bookshelf
=================

Simple library that uses Bookshelf models and relationships to create a RESTful api based on jsonapi.org spec.

Usage
==================
```JavaScript
var jsonapi = require('jsonapi-bookshelf');
var models = require('./models'); // key model name, value model object

app.use('/api', jsonapi(models));
```
