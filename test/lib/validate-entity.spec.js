var validateEntity = require('../../lib/validate-entity');
var sinon          = require('sinon');
var fs             = require('fs');

require('should');

describe('#validateEntity', function() {
  it('should exist', function() {
    validateEntity.should.be.ok;
  });

  it('should throw if some field is missing', function(done) {
    validateEntity({ data: {'path': 41}}).catch(function() {
      done();
    });
  });

  it('should explicitly say what fields were missing', function(done) {
    validateEntity({ data: {'path': 41}}).catch(function(e) {
      e.message.should.match(/.*missing.*template/);
      done();
    });
  });
});

describe('file checking', function() {
  afterEach(function() {
    fs.exists.restore();
    fs.stat.restore();
  });

  it('should throw if any of the modifiable files are missing', function(done) {
    var entity = { data: {'template': 'test', 'path': 41, 'files': { 'xxx.js': 'test' }}};
    sinon.stub(fs, 'exists', function(file, cb) {
      cb(null, false);
    });
    sinon.stub(fs, 'stat', function(file, cb) {
      cb(null, { isDirectory: function() { return false; }});
    });
    validateEntity(entity).catch(function(e) {
      e.message.should.eql('missing test/xxx.js');
      done();
    });
  });

  it('should throw if any of the files to be modified is a folder', function(done) {
    var entity = { data: {'template': 'test', 'path': 41, 'files': { 'xxx.js': 'test' }}};
    sinon.stub(fs, 'exists', function(file, cb) { cb(null, true); });
    sinon.stub(fs, 'stat', function(file, cb) {
      cb(null, { isDirectory: function() { return true; }});
    });
    validateEntity(entity).catch(function(e) {
      e.message.should.eql('Modifiable is a folder');
      done();
    });
  });

});



