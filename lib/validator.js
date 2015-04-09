var Config = require('./config.json');
var _ = require('lodash');
var path = require('path');

var Validator = module.exports = function Validator(options) {
  this.options = options;
};

Validator.prototype.validate = function() {
  var config = _.cloneDeep(Config);

  var Task = require(path.join(__dirname, config.task));

  var task = new Task(config);

  return task.run(this.options);
};
