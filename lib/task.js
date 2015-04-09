var Promise = require('bluebird');
var path = require('path');

var Task = module.exports = function Task(name, level) {
  this.name = name;
  this.level = level || 0;
  this.errors = [];
  this.childs = [];
};

Task.prototype.run = function(data) {
  var self = this;

  function returnThis() {
    return self;
  }

  try {
    return this._run(data).then(returnThis)
      .catch(function(error) {
        if (self.errors.length === 0) {
          self.addError(error);
        }
        return Promise.reject(self);
      });
  } catch (error) {
    this.addError(error);
    return Promise.reject(this);
  }
};

Task.prototype._run = function() {
  return Promise.reject(new Error('Not implemented!'));
};

Task.prototype.runChilds = function(childs, data) {
  if (!Array.isArray(childs)) {
    return Promise.resolve(this);
  }
  var self = this;

  return Promise.resolve(childs).each(function(child) {
    var T = require(path.join(__dirname, child));
    var task = new T();
    self.childs.push(task);
    //task.parent = self;
    return task.run(data);
  });
};

Task.prototype.addError = function(error) {
  if (error.message) {
    return this.errors.push(error);
  }
  this.errors.push({
    message: error
  });
};

Task.prototype.print = function() {
  var tabs = getTabs(this.level);
  console.log(tabs + this.name);
  this.errors.forEach(function(error) {
    console.error(tabs + ' - ' + error.message);
  });

  this.childs.forEach(function(child) {
    child.print();
  });
};


function getTabs(n) {
  var tabs = '';
  for (var i = 0; i < n; i++) {
    tabs += '\t';
  }
  return tabs;
}
