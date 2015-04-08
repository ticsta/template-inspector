var Validator = require('./lib/validator');

var validator = module.exports = new Validator();
module.exports.Validator = Validator;

validator.validate();