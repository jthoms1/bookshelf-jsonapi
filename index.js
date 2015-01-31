/*eslint-disable new-cap, no-unused-vars */
'use strict';

var express = require('express');
var router = express.Router();
var RESERVED_PARAMS = ['sort', 'include', 'limit', 'itemIds'];

/*
 * Relationship URLS
 *
 * GET /api/user/1/links/organization
 * GET /api/user/1/links/posts
 */
function convertRelationshipUrl() {
}

/*
 * Filtering Resources
 *
 * GET /api/comments?post=1
 * GET /api/comments?post=1&author=12
 * GET /api/comments?post.type=blog
 *
 * Extend Filtering
 *
 * GET /api/user?createdAt=gt:10
 * GET /api/user?createdAt=lt:10
 * GET /api/user?firstName=like:Joh*
 */
function filters(parameters) {

  function isNotReserved(value) {
    return RESERVED_PARAMS.indexOf(value) === -1;
  }

  return Object.keys(parameters)
    .filter(isNotReserved)
    .reduce(function(obj, key) {
      obj[key] = parameters[key];
      return obj;
    }, {});
}

/*
 * Inclusion of Linked Resources
 *
 * GET /api/posts/1?include=comments
 * GET /api/posts/1?include=comments.author
 * GET /api/posts/1?include=author,comments,comments.author
 * GET /api/posts?include=author,comments,comments.author
 */
function inclusion(parameters) {
  if (parameters.hasOwnProperty('include')) {
    return {
      withRelated: parameters.include.split(',')
    };
  }
}
//.fetchAll({columns: ['symbol', 'name']})

/*
 * Sort Resources
 *
 * GET /api/posts?sort=-created,title
 * GET /api/posts?include=author&sort[posts]=-created,title&sort[people]=name
 *
 * Bookshelf:
 *   .orderBy(column, [direction])
 */
function sort(parameters) {
  var direction, column;

  // If there is no sort param then sort on id ascending
  if (!parameters.hasOwnProperty('sort')) {
    direction = 'asc';
    column = 'id';

  // If there is a sort param and it starts with a '-' then use descending order
  } else if (parameters.sort.charAt(0) === '-') {
    direction = 'desc';
    column = parameters.sort.substr(1);

  // Otherwise assume ascending order on the sort param
  } else {
    direction = 'asc';
    column = parameters.sort;
  }

  return {
    column: column,
    direction: direction
  };
}

/*
 * Limit Resource Length with Cursor
 *
 * /api/user?limit=10
 * /api/user?limit=20,10
 *
 * Bookshelf:
 *   .limit(value)
 *   .offset(value)
 */
function limit(parameters) {
  var resourcelimit = 10;

  if (parameters.limit) {
    resourcelimit = parseInt(parameters.limit, 10);
  }

  return {
    limit: resourcelimit
  };
}

/*
 * List of itemIds to array
 */
function items(parameters) {
  if (parameters.itemIds) {
    return parameters.itemIds.split(',');
  }
}

/*
 * Build the query for bookshelf using knex syntax
 *
 * items
 * sort
 * limit
 */
function buildQuery(parameters) {
  return function (qb) {
    var itemIds = items(parameters);
    if (itemIds) {
      qb.whereIn('id', itemIds);
    }

    var filterWhere = filters(parameters);
    if (Object.keys(filterWhere).length > 0) {
      qb.where(filterWhere);
    }

    var orderByObj = sort(parameters);
    if (orderByObj) {
      qb.orderBy(orderByObj.column, orderByObj.direction);
    }

    var limitObj = limit(parameters);
    if (limitObj) {
      qb.limit(limitObj.limit);
    }
  };
}

function getListOfItems(params, Model) {
  return Model
    .query(buildQuery(params))
    .fetchAll(inclusion(params));
}

module.exports = function (models, options) {

  function getModelByResourceName(modelName) {
    if (models.hasOwnProperty(modelName)) {
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

      res.json(req.apiData.toJSON());
    }
  };

  options = options || optionDefaults;
  var paramTransform = options.paramTransform || optionDefaults.paramTransform;
  var responseTransform = options.responseTransform || optionDefaults.responseTransform;

  // When resource appears set request Model
  router.param('resource', function (req, res, next, resource) {
    var Model = getModelByResourceName(resource);
    if (!Model) {
      return res.status(404).send('Not found');
    } else {
      req.Model = Model;
      next();
    }
  });

  // Resource Collection route
  router.route('/:resource')
    .get(function (req, res, next) {
      var params = paramTransform(req);

      getListOfItems(params, req.Model)
        .then(function(gatheredItems) {
          req.apiData = gatheredItems;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .post(function (req, res, next) {
      var params = paramTransform(req);

      req.Model.collection().forge(req.body).invokeThen('save')
        .then(function(savedItems) {
          req.apiData = savedItems;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    });


  // Individual Resource route
  router.route('/:resource/:itemIds')
    .get(function (req, res, next) {
      var params = paramTransform(req) || {};
      params.itemIds = req.params.itemIds;

      getListOfItems(params, req.Model)
        .then(function(resourceGatheredItems) {
          req.apiData = resourceGatheredItems;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .put(function (req, res, next) {
      var params = paramTransform(req) || {};
      params.itemIds = req.params.itemIds;

      req.Model.collection().forge(req.body).invokeThen('save')
        .then(function(resourceUpdatedItems) {
          req.apiData = resourceUpdatedItems;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    })
    .delete(function (req, res, next) {
      req.Model.collection().forge(req.body).invokeThen('destroy')
        .then(function(deletedItems) {
          req.apiData = deletedItems;
          next();
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    });

  router.use(responseTransform);

  return router;
};
