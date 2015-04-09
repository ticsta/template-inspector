var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var yaml = require('js-yaml');
var _ = require('lodash');
var readFileAsync = Promise.promisify(fs.readFile, fs);
var globAsync = Promise.promisify(require('glob'));
var statAsync = Promise.promisify(fs.stat, fs);
var utils = require('../utils.js');

/**
 * load all sections
 */
module.exports.load = function load(location) {
  var props = {
    info: loadTemplateConfig(location),
    config: loadConfig(location),
    storage: loadStorage(location),
    data: loadData(location),
    assets: loadAssets(location),
    views: loadViews(location),
    'public': loadPublic(location),
    models: loadModels(location),
  };
  return Promise.props(props);
};

/**
 * load template config section
 */
function loadTemplateConfig(location) {

  return globAsync('template.{yml,yaml,json}', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    });
  }).then(function(files) {
    if (files.length !== 1) {
      return Promise.reject(new Error('Invalid template: One file "template.yml" is required!'));
    }

    var file = files[0];
    var data = file.ext === '.json' ? JSON.parse(file.content) : yaml.safeLoad(file.content);
    data.slug = (data.slug || data.name);
    return data;
  });
}

/**
 * load storage section
 */
function loadStorage(location) {
  location = path.join(location, 'storage');

  return globAsync('**/*.{yml,yaml,json}', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file),
      basename: path.basename(file)
    });
  }).then(function(files) {
    var data = [];
    files.forEach(function(file) {
      var filePath = file.file.split(path.sep);
      filePath.length -= 1;
      var fname = file.basename.split('.')[0];
      data.push({
        path: filePath,
        name: fname,
        content: file.content
      });
    });
    return data;
  });
}

/**
 * load config section
 */
function loadConfig(location) {
  location = path.join(location, 'config');

  return globAsync('*.{yml,yaml,json}', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    });
  }).then(function(files) {
    var data = {};
    //console.log(files);
    files.forEach(function(file) {
      if (!file) return;
      var obj = file.ext === '.json' ? JSON.parse(file.content) : yaml.safeLoad(file.content);
      data = _.assign(data, obj);
    });
    return data;
  });
}

/**
 * load models section
 */
function loadModels(location) {
  location = path.join(location, 'models');

  function formatModels(code) {
    var models = {};
    if (!code || code.length < 1) return models;

    //console.log('code=', code);

    var vm = require('vm');
    var sandbox = {
      models: {
        push: function(name, model) {
          //console.log('creating model', name, model);
          models[name] = model;
        }
      }
    };
    try {
      vm.runInNewContext(code, sandbox, {
        displayErrors: false,
        timeout: 10
      });
    } catch (error) {
      throw error;
    }

    return models;
  }

  return globAsync('**/*.js', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    }).then(function(data) {
      //console.log('code for file', file, data.content);
      return '(function(){' + data.content + '})();';
    });
  }).then(function(files) {
    return formatModels(files.join('\n'));
  });
}

/**
 * load data section
 */
function loadData(location) {
  location = path.join(location, 'data');
  return globAsync('**/*.{yml,yaml,json}', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    });
  }).then(function(files) {
    var data = {},
      d;
    files.forEach(function(file) {
      var filePath = file.file.split(path.sep);
      filePath.length -= 1;

      d = file.ext === '.json' ? JSON.parse(file.content) : yaml.safeLoad(file.content);
      if (filePath.length > 0)
        utils.buildName(filePath.join('.'), {
          container: data,
          val: d
        });
      else data = _.assign(data, d);
    });
    return data;
  });
}

/**
 * load assets section
 */
function loadAssets(location) {
  location = path.join(location, 'assets');
  return globAsync('**/*.*', {
    cwd: location
  }).map(function(file) {
    return {
      file: file,
      path: location,
      ext: path.extname(file)
    };
  });
}

/**
 * load public section
 */
function loadPublic(location) {
  location = path.join(location, 'public');
  return globAsync('**/*.{html,xml,txt,rss,json,md,png,gif,ico,jpg,jpeg,htm}', {
    cwd: location
  }).map(function(file) {
    return {
      file: file,
      path: location,
      ext: path.extname(file)
    };
  });
}

/**
 * load views section
 */
function loadViews(location) {
  location = path.join(location, 'views');
  return globAsync('**/*.{html,xml,txt,rss,json,md,jade,ejs}', {
    cwd: location
  }).map(function(file) {
    return {
      file: file,
      path: location,
      ext: path.extname(file)
    };
  });
}

function _getFileData(data) {
  return readFileAsync(path.join(data.path, data.file), 'utf8').then(function(content) {
    data.content = content;
    return data;
  });
}
