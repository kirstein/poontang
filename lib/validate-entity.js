var _        = require('lodash');
var path     = require('path');
var Bluebird = require('bluebird');
var fs       = require('fs');

var partial = _.partial;

function validateAndAdd(list, entity, field) {
  if (!entity.data[field]) {
    list.push(field);
  }
}

function validateFields(entity) {
  var missingFields = [];
  _.each(exports.mandatoryFields, partial(validateAndAdd, missingFields, entity));
  if (missingFields.length) {
    var error = new Error('Entity ' + entity.location + ' missing fields: ' + missingFields.join());
    return Promise.reject(error);
  }
  return Promise.resolve(true);
}

function statFile(file) {
  return Bluebird.promisify(fs.stat)(file);
}

function checkIfFileExists(file) {
  return Bluebird.promisify(fs.exists)(file).then(function(val) {
    if (!val) {
      throw new Error('missing ' + file);
    }
  });
}

function validateModifiableExist(files) {
  return Bluebird.each(files, checkIfFileExists);
}

function validateNotFolder(stat) {
  if (stat.isDirectory()) {
    var error = new Error('Modifiable is a folder');
    return Bluebird.reject(error);
  }
  return Bluebird.resolve(true);
}

function validateModifiableNotDir(files) {
  return Bluebird.map(files, statFile).each(validateNotFolder);
}

function addBaseToModifiable(files, entity) {
  var template = entity.data.template;
  return files.map(function(file) {
    return path.join(template, file);
  });
}

var exports = module.exports = function (entity) {
  var basedModifiables = addBaseToModifiable(_.keys(entity.data.files), entity);
  return Bluebird.all([
    validateFields(entity),
    validateModifiableExist(basedModifiables),
    validateModifiableNotDir(basedModifiables)
  ]);
};

exports.mandatoryFields = [ 'template', 'path', 'files' ];
