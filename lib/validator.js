var Loader = require('./tasks/loader');

module.exports.validate = function(location) {
  var task = new Loader();
  return task.run(location).then(function() {
    return task.template.info;
  });
};
