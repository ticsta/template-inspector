var BaseTask = require('../task');
var util = require('util');
var Promise = require('bluebird');
var loader = require('./template_loader');

var Task = module.exports = function Task() {
  BaseTask.apply(this, arguments);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(options) {
  try {
    return loader.load(options.location);
  } catch (error) {
    return Promise.reject(error);
  }
};
