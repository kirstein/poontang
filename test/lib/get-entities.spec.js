var getEntities = require('../../lib/get-entities');

var fs             = require('fs');
var sinon          = require('sinon');

require('should');

describe('#getEntities', function() {

  it('should exist', function() {
    getEntities.should.be.ok;
  });

  it('should use fs.readdir', sinon.test(function() {
    this.stub(fs, 'readdir');
    getEntities('test');
    fs.readdir.called.should.be.ok;
  }));

  it('should require all files and join the paths', function(done) {
    sinon.stub(fs, 'readdir', function(dir, cb) {
      return cb(null, [ 'hello' ]);
    });
    getEntities('test').then(function(list) {
      list.should.eql(['test/hello']);
      done();
    });
    fs.readdir.restore();
  });

  it('should throw if dir is not defined', function() {
    (getEntities).should.throw('Missing directory');
  });
});
