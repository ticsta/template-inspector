var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Config', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  var result = Joi.validate(template.config, internal.schema, {
    allowUnknown: true
  });
  if (result.error) {
    this.addError(result.error);
    return Promise.reject(this);
  }
  return Promise.resolve();
};

internal.schema = Joi.object().keys({
  site: Joi.object().keys({
    name: Joi.string().min(1).required(),
    title: Joi.string().min(1).required(),
    host: Joi.string().min(1),
  }),
  defaults: Joi.object().keys({
    module: Joi.string().min(1).max(50),
    language: Joi.string().length(2),
  }),
  permalink: Joi.object().pattern(/[\w\d-]+/, Joi.string().regex(/[\S]{1,255}/)),
  assets: Joi.object().pattern(/[\w\d-]+/, Joi.array().items(Joi.string().regex(/^[\S]{1,255}\.(css|js)$/)))
});
