/*eslint-disable new-cap, no-unused-vars */
'use strict';

var RESERVED_PARAMS = ['sort', 'include', 'limit', 'itemId'];

exports.checkResourceType = function() {
};

/*
 * Relationship URLS
 *
 * GET /api/user/1/links/organization
 * GET /api/user/1/links/posts
 */
exports.convertRelationshipUrl = function() {
};

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
exports.parseFilters = function(parameters) {

  function isNotReserved(value) {
    return RESERVED_PARAMS.indexOf(value) === -1;
  }

  return Object.keys(parameters)
    .filter(isNotReserved)
    .reduce(function(obj, key) {
      obj[key] = parameters[key];
      return obj;
    }, {});
};

/*
 * Inclusion of Linked Resources
 *
 * GET /api/posts/1?include=comments
 * GET /api/posts/1?include=comments.author
 * GET /api/posts/1?include=author,comments,comments.author
 * GET /api/posts?include=author,comments,comments.author
 */
exports.parseLinks = function(parameters) {
  if (parameters.hasOwnProperty('include')) {
    return {
      withRelated: parameters.include.split(',')
    };
  }
};
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
exports.parseSorting = function(parameters) {
  var direction,
    column;

  if (!parameters || !parameters.hasOwnProperty('sort')) {
    return undefined;
  }

  // If there is a sort param and it starts with a '-' then use descending order
  if (parameters.sort.charAt(0) === '-') {
    return {
      direction: 'desc',
      column: parameters.sort.substr(1)
    };

  // If there is a sort param and it starts with a '+' then use ascending order
  } else if (parameters.sort.charAt(0) === '+') {
    return {
      direction: 'asc',
      column: parameters.sort.substr(1)
    };
  }
};

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
exports.parseLimits = function(parameters) {
  var resourcelimit = 10;

  if (parameters.limit) {
    resourcelimit = parseInt(parameters.limit, 10);
  }

  return {
    limit: resourcelimit
  };
};

/*
 * Convert object relationships to array of objects
 */
var deepToShallow = exports.deepToShallow = function(resource, response) {

  function isObject(key) {
    return resource[key] !== null && typeof resource[key] === 'object';
  }

  response = response || {};

  if (Array.isArray(resource)) {
    resource.forEach(function(j) {
      deepToShallow(j, response);
    });

    return response;
  }
  return Object.keys(resource)
    .filter(isObject)
    .reduce(function(list, key) {
      var items = resource[key];

      if (!Array.isArray(items)) {
        items = [items];
      }

      items.forEach(function(i) {
        deepToShallow(i, list);
        delete resource[key];
        list[key] = list[key] || [];
        list[key].push(i);
      });

      return list;
    }, response);
};
