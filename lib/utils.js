var utils = module.exports;
var yaml = require('js-yaml');

utils.buildName = function(name, options) {
  var ns = name.split(options.separator || '.'),
    o = options.container,
    val = options.val,
    i, len;
  for (i = 0, len = ns.length; i < len; i++) {
    var v = (i === len - 1 && val) ? val : {};
    o = o[ns[i]] = o[ns[i]] || v;
  }
  return o;
};

//http://stackoverflow.com/a/8817473/828615
utils.deepValue = function(obj, pth) {
  pth = pth.split('.');
  for (var i = 0, len = pth.length; i < len; i++) {
    obj = obj[pth[i]];
  }
  return obj;
};

utils.getFileHeader = function(content) {
  var regex = /^\s*[^\n]*?(([^\s\d\w])\2{2,})(?:\x20*([a-z]+))?([\s\S]*?)[^\n]*?\1[^\n]*/;

  var match = regex.exec(content);
  if (match) {
    return yaml.safeLoad(match[4].trim().split('\n').map(function(line) {
      return line.trim();
    }).join('\n'));
  }
};
