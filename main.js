'use strict';

var Bluebird = require('bluebird');

var _  = require('lodash');
var fs = Bluebird.promisifyAll(require('fs'));

var getEntities    = require('./lib/get-entities');
var loadEntity     = require('./lib/load-entity');
var validateEntity = require('./lib/validate-entity');
var buildFileList  = require('./lib/build-file-list');
var copyFiles      = require('./lib/copy-files');

function checkIfTemplateExists(entity) {
  return fs.exists(entity.template);
}

function flattenEntities(entities, entity) {
  return entities.concat(entity);
}

var exports = module.exports = function(dir, opts) {
  opts = _.extend({}, opts, exports.DEFAULTS);

  return getEntities(dir).map(loadEntity)
                         .reduce(flattenEntities, [])
                         .each(validateEntity)
                         .each(checkIfTemplateExists)
                         .map(buildFileList)
                         .each(copyFiles)
                         .catch(console.error);
};

exports.DEFAULTS = {
  target: __dirname
};
