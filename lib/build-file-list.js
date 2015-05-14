var Bluebird = require('bluebird');
var _        = require('lodash');
var path     = require('path');
var fs       = require('fs');

var partial = _.partial;

function exists(file) {
  return Bluebird.promisify(fs.exists)(file);
}

function readdir(dir) {
  return Bluebird.promisify(fs.readdir)(dir);
}

function addBasePath(template, file) {
  if (!template || !file) {
    return;
  }
  return path.join(template, file);
}

function buildCopyList(filesToModify, returnObj, templateFile) {
  var haveToCopy = _.find(filesToModify, function(file) {
    return file === templateFile;
  });
  if (haveToCopy) {
    returnObj.copy.push(templateFile);
  } else {
    returnObj.link.push(templateFile);
  }
  return returnObj;
}

function mapEntityByFiles(entity, filesToModify, returnObj) {
  var template = entity.template;
  return readdir(template).reduce(partial(buildCopyList, filesToModify), returnObj);
}

function checkIfFileExists(file) {
  return exists(file).then(function (exists){
    if (!exists) {
      throw new Error('File ' + file + ' does not exist');
    }
  });
}

module.exports = function (entity) {
  var filesToModify = _.keys(entity.files).map(partial(addBasePath, entity.template));
  var returnObj     = { link: [], copy: [] };
  if (!filesToModify.length) {
    return Bluebird.reject(new Error('No files in entity'));
  } else if (!entity.template) {
    return Bluebird.reject(new Error('Entity template missing'));
  }
  return Bluebird.each(filesToModify, checkIfFileExists)
                 .reduce(partial(mapEntityByFiles, entity, filesToModify), returnObj);
};

