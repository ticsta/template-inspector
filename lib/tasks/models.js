var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Models', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  for (var key in template.models) {
    var model = template.models[key];
    var result = Joi.validate(model, internal.schema, {
      allowUnknown: true
    });
    if (result.error) {
      var error = result.error;
      error.message = 'Model "' + model.__file + '" is invalid: ' + error.message;
      this.addError(error);
      return Promise.reject(this);
    }
  }

  return Promise.resolve();
};

internal.schema = Joi.object().keys({
  extend: [Joi.string().min(1), Joi.array().max(5).items(Joi.string().min(1))],
  create: Joi.func().required()
});
