var buildFileList = require('../../lib/build-file-list');
var path          = require('path');
var _             = require('lodash');
var sinon         = require('sinon');
var fs            = require('fs');

describe('#buildFileList', function() {
  var mocksDir;
  beforeEach(function() {
    mocksDir = path.join(__dirname, '../mocks');
  });

  it('should exist', function() {
    buildFileList.should.be.ok;
  });

  afterEach(function() {
    if (_.isFunction(fs.exists.restore)) {
      fs.exists.restore();
    }
    if (_.isFunction(fs.readdir.restore)) {
      fs.readdir.restore();
    }
  });

  it('should throw to promise if file does not exist in template', function(done) {
    var entity  = {
      files: { test: 'null' }
    };
    buildFileList(entity).catch(function(err) {
      err.message.should.eql('Entity template missing');
      done();
    });
  });

  it('should reject the promise if no files are in the list', function(done) {
    var entity  = {
      template: path.join(mocksDir, '/missing-dir')
    };
    buildFileList(entity).catch(function(err) {
      err.message.should.eql('No files in entity');
      done();
    });
  });

  it('should check if file exists in template', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) {
      cb(null, []);
    });
    sinon.stub(fs, 'exists', function(file, cb) {
      file.should.equal('x/test.js');
      cb(null, true);
      done();
    });
    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    });
  });

  it('should read template dir', function(done) {
    sinon.stub(fs, 'exists', function(file, cb) {
      cb(null, true);
    });
    sinon.stub(fs, 'readdir', function(dir, cb) {
      dir.should.equal('x');
      cb(null, []);
      done();
    });

    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    });
  });

  it('should throw if file was not found in template', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) { cb(null, []); });
    sinon.stub(fs, 'exists', function(file, cb) { cb(null, false); });

    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    }).catch(function(err) {
      err.message.should.eql('File x/test.js does not exist');
      done();
    });
  });

  it('should resolve with list of symlinks and copys', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) { cb(null, []); });
    sinon.stub(fs, 'exists', function(file, cb) { cb(null, true); });

    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    }).then(function(obj) {
      obj.link.should.be.an.instanceOf(Array);
      obj.copy.should.be.an.instanceOf(Array);
      done();
    });
  });

  it('should add file to copy list if its a file to be modified', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) { cb(null, [ 'x/test.js' ]); });
    sinon.stub(fs, 'exists', function(file, cb) { cb(null, true); });

    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    }).then(function(obj) {
      obj.copy.should.be.eql([ 'x/test.js' ]);
      done();
    });
  });

  it('should add file to symlink list if its not in any template', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) { cb(null, [ 'x/z.js' ]); });
    sinon.stub(fs, 'exists', function(file, cb) { cb(null, true); });

    buildFileList({
      template: 'x',
      files: { 'test.js': {} }
    }).then(function(obj) {
      obj.link.should.be.eql([ 'x/z.js' ]);
      done();
    });
  });
});
