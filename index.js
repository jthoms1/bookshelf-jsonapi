/*eslint-disable new-cap, no-unused-vars */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var jsonParser = bodyParser.json();
var utils = require('./utils');

var RESERVED_PARAMS = ['sort', 'include', 'limit', 'itemId'];
var ALLOWED_METHODS = {
  COLLECTION: ['GET', 'POST', 'OPTIONS'],
  RESOURCE: ['GET', 'PUT', 'DELETE', 'OPTIONS']
};
var CONTENT_TYPE = 'application/vnd.api+json';

/*
 * Build the query for bookshelf using knex syntax
 *
 * sort
 * limit
 */
function buildQuery(parameters) {
  return function (qb) {

    if (parameters.hasOwnProperty('itemId') && typeof itemId !== 'undefined') {
      qb.whereIn('id', parameters.itemId);
    }

    var filterWhere = utils.parseFilters(parameters);
    if (Object.keys(filterWhere).length > 0) {
      qb.where(filterWhere);
    }

    var orderByObj = utils.parseSorting(parameters);
    if (orderByObj) {
      qb.orderBy(orderByObj.column, orderByObj.direction);
    }

    var limitObj = utils.parseLimits(parameters);
    if (limitObj) {
      qb.limit(limitObj.limit);
    }
  };
}

function getListOfItems(params, Model) {
  return Model
    .query(buildQuery(params))
    .fetchAll(utils.parseLinks(params));
}

module.exports = function (models, options) {

  function getModelByResourceName(modelName) {
    if (models && modelName && models.hasOwnProperty(modelName)) {
      return models[modelName];
    }
  }

  var optionDefaults = {
    // Modify parameters before api takes control
    paramTransform: function (req) {
      return req.query;
    },
    // Response of req.apiData
    responseTransform: function (req, res) {
      return res
        .set('Content-Type', CONTENT_TYPE)
        .json(req.apiData);
    }
  };

  options = options || optionDefaults;
  var paramTransform = options.paramTransform || optionDefaults.paramTransform;
  var responseTransform = options.responseTransform || optionDefaults.responseTransform;

  // When resource appears set request Model
  router.param('resource', function (req, res, next, resource) {
    var Model = getModelByResourceName(resource);
    if (!Model) {
      return res.status(404).json({
        msg: 'Not found'
      });
    } else {
      req.Model = Model;
      req.ResourceName = resource;
      next();
    }
  });

  // Resource Collection route
  router.route('/:resource')
    .get(function (req, res, next) {
      var params = paramTransform(req);

      getListOfItems(params, req.Model)
        .then(function(gatheredItems) {
          var respJSON = {};
          respJSON.data = (gatheredItems || []).map(function(item) {
            item.type = req.ResourceName;
          });
          req.apiData = respJSON;
          next();
        })
        .catch(function(err) {
          res.status(500).json(err);
        });
    })
    .post(jsonParser, function (req, res, next) {
      var params = paramTransform(req);

      if (req.body === null || typeof req.body !== 'object' || !req.body.hasOwnProperty('data')) {
        return res.status(400).json({
          errors: [
            {
              title: 'Request object must contain a data attribute.'
            }
          ]
        });
      }

      if (!req.body.data.hasOwnProperty('type') && req.body.data.type !== req.ResourceName) {
        return res.status(409).json({
          errors: [
            {
              title: 'Resource type attribute should be equal to "' + req.ResourceName + '".'
            }
          ]
        });
      }

      // Remove type when saving
      delete req.body.data.type;
      delete req.body.data.links;

      req.Model
        .forge(req.body.data)
        .save()
        .then(function(model) {
          var respJSON = {};
          respJSON.data = model.toJSON();
          respJSON.data.type = req.ResourceName;
          respJSON.data.links = {};
          respJSON.data.links.self = req.path;
          req.apiData = respJSON;
          res.status(201);
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .all(function(req, res, next) {
      if (ALLOWED_METHODS.COLLECTION.indexOf(req.method) !== -1) {
        return next();
      }
      res.append('Allow', ALLOWED_METHODS.COLLECTION.join(', ')).status(405).send();
    });


  // Individual Resource route
  router.route('/:resource/:itemId')
    .get(function (req, res, next) {
      var params = paramTransform(req) || {};
      params.itemId = req.params.itemId;

      getListOfItems(params, req.Model)
        .then(function(resourceItems) {
          var model = resourceItems.toJSON()[0];
          var respJSON = {};
          respJSON.data = model;
          respJSON.data.type = req.ResourceName;
          respJSON.data.links = {};
          respJSON.data.links.self = req.path;
          req.apiData = respJSON;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .put(jsonParser, function (req, res, next) {
      var params = paramTransform(req) || {};
      params.itemId = req.params.itemId;

      if (req.body === null || typeof req.body !== 'object' || !req.body.hasOwnProperty('data')) {
        return res.status(400).json({
          errors: [
            {
              title: 'Request object must contain a data attribute.'
            }
          ]
        });
      }

      if (!req.body.data.hasOwnProperty('type') && req.body.data.type !== req.ResourceName) {
        return res.status(409).json({
          errors: [
            {
              title: 'Resource type attribute should be equal to "' + req.ResourceName + '".'
            }
          ]
        });
      }

      // Remove type when saving
      delete req.body.data.type;
      delete req.body.data.links;

      req.Model
        .forge(req.body.data)
        .save()
        .then(function(model) {
          var respJSON = {};
          respJSON.data = model.toJSON();
          respJSON.links = {};
          respJSON.data.type = req.ResourceName;
          respJSON.links.self = req.path;
          req.apiData = respJSON;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .delete(function (req, res, next) {
      var params = paramTransform(req) || {};
      params.itemId = req.params.itemId;

      var model = new req.Model({id: params.itemId});
      model.destroy()
        .then(function() {
          res.status(204).send();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .all(function (req, res, next) {
      if (ALLOWED_METHODS.RESOURCE.indexOf(req.method) !== -1) {
        return next();
      }
      res.append('Allow', ALLOWED_METHODS.RESOURCE.join(', ')).status(405).send();
    });

  router.use(responseTransform);

  return router;
};
