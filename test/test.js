var chai = require('chai');
var should = chai.should();
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var path = require('path');
var inspector = require('../index.js');
var pathToTemplateFolder = process.env.TEMPLATE_PATH; // || path.join(__dirname, '../../../templates/unimedia-template/template');

describe('inspector', function() {

  describe('#validate()', function() {

    it('reject if no params', function() {
      return inspector.validate().should.be.rejected;
    });

    it('reject if not a valid template path', function() {
      return inspector.validate({}).should.be.rejected;
    });
    if (pathToTemplateFolder) {
      it('should validate without errors', function() {
        return inspector.validate(pathToTemplateFolder).should.not.be.rejected;
      });
    }

  });

  describe('#load()', function() {

    it('reject if no location is provided', function() {
      return inspector.load().should.be.rejected;
    });

    it('reject if not a valid location param', function() {
      return inspector.load(21).should.be.rejected;
    });

    it('should reject a invalid template path', function() {
      return inspector.load('path').should.be.rejected;
    });

    if (pathToTemplateFolder) {
      it('should load without errors', function() {
        return inspector.load(pathToTemplateFolder).should.not.be.rejected;
      });

      it('should have a template info', function() {
        return inspector.load(pathToTemplateFolder).should.eventually.have.property('info');
      });
    }

  });

});
