var fs       = require('fs');
var path     = require('path');
var Bluebird = require('bluebird');
var _        = require('lodash');

var partial = _.partial;

function readdir(dir) {
  return Bluebird.promisify(fs.readdir)(dir);
}

function addDirectory(dir, entity) {
  return path.join(dir, entity);
}

module.exports = function (dir) {
  if (!dir) {
    throw new Error('Missing directory');
  }
  return readdir(dir).map(partial(addDirectory, dir));
};
