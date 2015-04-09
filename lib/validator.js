var _ = require('lodash');
var path = require('path');
var Loader = require('./tasks/loader');

var Validator = module.exports = function Validator(options) {
  this.options = options;
};

Validator.prototype.validate = function() {

  var task = new Loader();

  return task.run(this.options);
};
