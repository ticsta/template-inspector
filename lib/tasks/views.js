var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Views', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  var result = Joi.validate(template.views, internal.schema, {
    allowUnknown: true
  });
  if (result.error) {
    this.addError(result.error);
    return Promise.reject(result.error);
  }

  var models = Object.keys(template.models);
  var views = template.views;
  for (var i = views.length - 1; i >= 0; i--) {
    header = views[i].header;
    if (!header || !header.model) continue;

    if (models.indexOf(header.model) < 0) {
      var error = new Error('Error in "' + views[i].file + '" (header): model "' + header.model + '" is not defined');
      this.addError(error);
      return Promise.reject(error);
    }
  }
  return Promise.resolve();
};

internal.schema = Joi.array().items(Joi.object().keys({
  header: Joi.object().keys({
    model: Joi.string().min(1),
    title: Joi.string().min(1),
    module: Joi.string().min(1),
    type: Joi.string().min(1),
    maxage: [Joi.string().min(1), Joi.number().integer().min(0)],
    document: Joi.boolean()
  })
}));
