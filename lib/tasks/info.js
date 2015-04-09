var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Info', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  var result = Joi.validate(template.info, internal.infoSchema, {
    allowUnknown: true
  });
  if (result.error) {
    this.addError(result.error);
    return Promise.reject(this);
  }
  return Promise.resolve();
};

internal.infoSchema = Joi.object().keys({
  name: Joi.string().min(3).max(100).required(),
  slug: Joi.string().regex(/[a-z0-9-]{3,100}/),
  version: Joi.number().integer().min(0).max(50).required(),
  comments: Joi.string().min(10).max(255),
});
