'use strict';

var express = require('express'),
  jsonapi = require('..');

var app = express();
var models = {things: {}};

app.use('/api', jsonapi(models));
app.listen(8080);
