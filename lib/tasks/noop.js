var Task = require('../task');
var util = require('util');
var Promise = require('bluebird');

var NoopTask = module.exports = function NoopTask() {
  Task.apply(this, arguments);
};

util.inherits(NoopTask, Task);

NoopTask.prototype._run = function() {
  console.log('Done!');
  return Promise.resolve();
};
