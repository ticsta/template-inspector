var BaseTask = require('../task');
var util = require('util');
var Promise = require('bluebird');
var loader = require('../template_loader');

var Task = module.exports = function Task() {
  BaseTask.call(this, 'Template loader');
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(options) {
  return loader.load(options.location).then(this._runChilds.bind(this));
};

Task.prototype._runChilds = function(template) {
  //console.log(template);
  var childs = ['tasks/info', 'tasks/config', 'tasks/storage', 'tasks/models', 'tasks/views', 'tasks/tasks'];
  return this.runChilds(childs, template);
};
