var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Storage', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  console.log(template.storage);
  var self = this;
  return Promise.resolve(template.storage).each(function(storage) {
    var result = Joi.validate(storage.content, internal.contentSchema, {
      allowUnknown: true
    });
    if (result.error) {
      var error = result.error;
      error.message = 'Error in "' + storage.file + '" ' + error.message;
      self.addError(error);
      return Promise.reject(this);
    }
  });
};

internal.contentSchema = Joi.object().keys({
  params: Joi.object().keys({
    action: Joi.string().only(['list', 'count', 'item']).required(),
    model: Joi.string().only(['document', 'file', 'member', 'group', 'doctype', 'documenttype', 'groupitem']).required(),
    select: Joi.string().required(),
    where: Joi.object().min(1).max(5).required(),
    order: Joi.string(),
    limit: [Joi.number().integer().min(1).max(50), Joi.string()],
    offset: [Joi.number().integer().min(0).max(50), Joi.string()],
  }),
  source: Joi.string().only('db').required()
});
