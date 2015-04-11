var Validator = require('./lib/validator');
var TemplateLoader = require('./lib/template_loader');

module.exports.validate = Validator.validate;
module.exports.load = TemplateLoader.load;