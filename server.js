'use strict';

var express = require('express'),
jsonapi = require('./index');

var app = express();
var models = {things: {}};

app.use('/api', jsonapi(models));
app.listen(8080);
