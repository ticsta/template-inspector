var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var yaml = require('js-yaml');
var _ = require('lodash');
var readFileAsync = Promise.promisify(fs.readFile, fs);
var globAsync = Promise.promisify(require('glob'));
var statAsync = Promise.promisify(fs.stat, fs);
var utils = require('./utils.js');

/**
 * load all sections
 */
module.exports.load = function load(location) {

  if (!fs.existsSync(location)) {
    return Promise.reject(new Error('Template location not found!'));
  }

  return statAsync(location).then(function(stats) {
    if (!stats.isDirectory()) {
      return Promise.reject(new Error('Invalid template location!'));
    }
    return _load(location);
  });
};

function _load(location) {
  var props = {
    info: loadTemplateConfig(location),
    config: loadConfig(location),
    storage: loadStorage(location),
    data: loadData(location),
    assets: loadAssets(location),
    views: loadViews(location),
    'public': loadPublic(location),
    models: loadModels(location),
    tasks: loadTasks(location),
  };

  return Promise.props(props);
}

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
    var data = parseFileContent(file);
    data.slug = (data.slug || data.name);
    return data;
  });
}

/**
 * load storage section
 */
function loadStorage(location) {
  return globAsync('storage/**/*.{yml,yaml,json}', {
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
      filePath.splice(0, 1);
      filePath.length -= 1;
      var fname = file.basename.split('.')[0];
      data.push({
        path: filePath,
        name: fname,
        content: parseFileContent(file),
        file: file.file
      });
    });
    return data;
  });
}

/**
 * load config section
 */
function loadConfig(location) {

  return globAsync('config/*.{yml,yaml,json}', {
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
      var obj = parseFileContent(file);
      data = _.assign(data, obj);
    });
    return data;
  });
}

/**
 * load models section
 */
function loadModels(location) {
  var models = {};
  var currentFile;
  var sandbox = {
    models: {
      push: function(name, model) {
        //console.log('creating model', name, model);
        model.__file = 'models/' + currentFile.file;
        models[name] = model;
      }
    }
  };

  function runModelCode(code) {
    var vm = require('vm');
    vm.runInNewContext(code, sandbox, {
      displayErrors: false,
      timeout: 10
    });
  }

  return globAsync('models/**/*.js', {
    cwd: location
  }).each(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    }).then(function(file) {
      currentFile = file;
      try {
        runModelCode(file.content);
      } catch (error) {
        error.message = 'Error in "' + file.file + '": ' + error.message;
        return Promise.reject(error);
      }
    });
  }).then(function() {
    return models;
  });
}

/**
 * load data section
 */
function loadData(location) {
  return globAsync('data/**/*.{yml,yaml,json}', {
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

      d = parseFileContent(file);
      if (filePath.length > 0) {
        utils.buildName(filePath.join('.'), {
          container: data,
          val: d
        });
      } else {
        data = _.assign(data, d);
      }
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
  return globAsync('views/**/*.{html,xml,txt,rss,json,md,jade,ejs}', {
    cwd: location
  }).map(function(file) {
    return {
      file: file,
      path: location,
      ext: path.extname(file)
    };
  }).each(function(file) {
    return _getFileData(file).then(function() {
      var header = utils.getFileHeader(file.content);
      if (header) {
        file.header = header;
      }
      delete file.content;
    });
  });
}

/**
 * load tasks section
 */
function loadTasks(location) {
  return globAsync('tasks/**/*.{yml,yaml,json}', {
    cwd: location
  }).map(function(file) {
    return _getFileData({
      file: file,
      path: location,
      ext: path.extname(file)
    });
  }).then(function(files) {
    var tasks = [];

    if (!files) return tasks;

    files.forEach(function(file) {
      var filePath = file.file.split(path.sep);
      filePath.splice(0, 1);
      filePath.length -= 1;
      var fname = path.basename(file.file, file.ext);
      var name = filePath.concat([fname]).join('.');
      tasks.push({
        name: name,
        file: file.file,
        content: parseFileContent(file),
      });
    });
    return tasks;
  });
}

function parseFileContent(file) {
  try {
    return file.ext === '.json' ? JSON.parse(file.content) : yaml.safeLoad(file.content);
  } catch (error) {
    throw new Error('File "' + file.file + '" is invalid');
  }
}

function _getFileData(data) {
  return readFileAsync(path.join(data.path, data.file), 'utf8').then(function(content) {
    data.content = content;
    return data;
  });
}
