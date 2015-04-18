var Loader = require('./tasks/loader');

module.exports.validate = function(options) {
  var task = new Loader();
  return task.run(options).then(function() {
    return task;
  });
};
