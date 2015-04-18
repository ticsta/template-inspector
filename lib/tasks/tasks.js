var BaseTask = require('../task');
var Promise = require('bluebird');
var util = require('util');
var Joi = require('joi');
var internal = {};

var Task = module.exports = function Task(level) {
  BaseTask.call(this, 'Tasks', level || 1);
};

util.inherits(Task, BaseTask);

Task.prototype._run = function(template) {
  var self = this;
  return Promise.resolve(template.tasks).each(function(task) {
    //console.log('content', task.content);
    if (!task.content || task.content.ignore === true) return;

    var schema = getContentSchema(template);

    var result = Joi.validate(task.content, schema, {
      allowUnknown: true
    });
    if (result.error) {
      var error = result.error;
      error.message = 'Error in "' + task.file + '" ' + error.message;
      self.addError(error);
      return Promise.reject(error);
    }
  });
};


internal.viewOutputSchema = Joi.object().keys({
  view: Joi.string().required()
}).required();


function getDocumentPublishActionSchema(template) {
  var storageNames = [];

  template.storage.forEach(function(item) {
    storageNames.push(item.path.concat([item.name]).join('.'));
  });

  return Joi.object().keys({
    name: Joi.string().required(),
    mode: Joi.string().only('item', 'page').required(),
    output: [internal.viewOutputSchema, Joi.array().min(1).max(5).items(internal.viewOutputSchema)],
    source: Joi.object().keys({
      type: Joi.string().only('storage').required(),
      config: Joi.object().keys({
        name: Joi.string().only(storageNames).required(),
        pagging: Joi.object().keys({
          pages: Joi.number().integer().min(1),
          pagesize: Joi.number().integer().min(1)
        }),
        params: Joi.object().pattern(/./, [Joi.boolean(), Joi.number(), Joi.string()])
      }).required()
    }).required()
  }).required();
}

function getActionSchema(template) {

  return Joi.object().keys({
    type: Joi.string().only('document.publish').required(),
    config: Joi.object().when('type', {
      is: 'document.publish',
      then: getDocumentPublishActionSchema(template)
    })
  }).required();

}

internal.triggerSchema = Joi.string().required();

function getContentSchema(template) {

  var actionSchema = getActionSchema(template);

  return Joi.object().keys({
    name: Joi.string().required(),
    ignore: Joi.boolean(),
    triggers: [internal.triggerSchema, Joi.array().unique().min(1).max(5).items(internal.triggerSchema).required()],
    actions: [actionSchema, Joi.array().min(1).max(5).items(actionSchema)]
  });

}
