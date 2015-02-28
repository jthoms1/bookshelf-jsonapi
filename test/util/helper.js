'use strict';

exports.headerContains = function (header, content) {
  return function (res) {
    if (res.headers[header.toLowerCase()].indexOf(content) === -1) {
      throw new Error('Header "' + header + '" does not contain "' + content + '".');
    }
  };
};
