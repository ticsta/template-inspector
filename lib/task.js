var Promise = require('bluebird');
var path = require('path');

var Task = module.exports = function Task(config, data) {
  config.level = config.level || 0;
  this.config = config;
  this.data = data || {};
};

Task.prototype.run = function(data) {
  return this._run(data).then(this.runChilds.bind(this));
};

Task.prototype._run = function() {
  return Promise.reject(new Error('Not implemented!'));
};

Task.prototype.runChilds = function(data) {
  var self = this;
  var childs = this.config.childs;

  if (!Array.isArray(childs)) {
    return Promise.resolve(data);
  }

  return Promise.resolve(childs).each(function(child) {
    var T = require(path.join(__dirname, child.task));
    child.parent = self;
    this.level = self.config.level + 1;
    var task = new T(child, data || self.data);

    return task.run();
  });
};
