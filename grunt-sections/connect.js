'use strict';

var url = require('url');
var path = require('path');

module.exports = function (grunt, options) {
  var proxyMiddleware = require('proxy-middleware');

  function proxyFolder(src, dest) {
    var proxyOptions = url.parse(grunt.template.process(dest));
    proxyOptions.route = src;
    proxyOptions.headers = {'accept-encoding': 'identity'};
    return proxyMiddleware(proxyOptions);
  }

  function getProxies(proxyType) {
    var arr = [];
    for (var key in options[proxyType]) {
      if (typeof(options[proxyType][key]) === 'string') {
        arr.push(proxyFolder(key, options[proxyType][key]));
      } else {
        if (key[0] === '_') {
          arr.unshift(options[proxyType][key]);
        } else {
          arr.push(options[proxyType][key]);
        }
      }
    }
    return arr;
  }

  function mountFolder(connect, dir, maxage) {
    return connect.static(require('path').resolve(grunt.template.process(dir)), { maxAge: maxage || 0 });
  }

  return {
    options: {
      port: options.port,
      // Change this to 'localhost' to block access to the server from outside.
      hostname: '0.0.0.0',
      livereload: options.livereload
    },
    livereload: {
      options: {
        protocol: options.protocol,
        key: grunt.file.read(path.join(__dirname, '../server.key')).toString(),
        cert: grunt.file.read(path.join(__dirname, '../server.crt')).toString(),
        ca: grunt.file.read(path.join(__dirname, '../ca.crt')).toString(),
        passphrase: 'grunt',
        open: '<%= yeoman.local %>',
        middleware: function (connect) {
          return getProxies('beforeProxies').concat([
            mountFolder(connect, '.tmp'),
            mountFolder(connect, 'test'),
            mountFolder(connect, 'app'),
            proxyFolder('/wcservices/', '<%= yeoman.api %>'.replace('_api', 'wcservices')),
            proxyFolder('/_api/', '<%= yeoman.api %>'),
            proxyFolder('/_partials/', '<%= yeoman.partials %>'),
            proxyFolder('/_livereload/', 'http://localhost:<%= watch.options.livereload %>/'),
            connect.urlencoded()
          ]).concat(getProxies('proxies'));
        }
      }
    },
    test: {
      options: {
        port: 9000,
        middleware: function (connect) {
          return getProxies('beforeProxies').concat([
            //connect.compress(),
            mountFolder(connect, 'test', 86400000),
            mountFolder(connect, 'dist', 86400000),
            connect.urlencoded()
          ]).concat(getProxies('proxies'));
        }
      }
    },
    dist: {
      options: {
        open: '<%= yeoman.local %>',
        middleware: function (connect) {
          return getProxies('beforeProxies').concat([
            mountFolder(connect, 'test'),
            mountFolder(connect, 'dist'),
            proxyFolder('/_api/', '<%= yeoman.api %>'),
            proxyFolder('/_partials/', '<%= yeoman.partials %>'),
            connect.urlencoded()
          ]).concat(getProxies('proxies'));
        }
      }
    }
  };
};
