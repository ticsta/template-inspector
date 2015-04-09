var utils = module.exports;

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
