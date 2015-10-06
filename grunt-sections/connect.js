'use strict';

var url = require('url');
var path = require('path');
var injector = require('connect-injector');

module.exports = function (grunt, options) {
  var proxyMiddleware = require('proxy-middleware');

  function readCertFile(name) {
    try {
      return grunt.file.read(name).toString();
    } catch (e) {
      return grunt.file.read(path.join(__dirname, '../' + name)).toString();
    }
  }

  function proxyFolder(src, dest) {
    var proxyOptions = url.parse(grunt.template.process(dest));
    proxyOptions.route = src;
    proxyOptions.headers = {'accept-encoding': 'identity'};
    return proxyMiddleware(proxyOptions);
  }

  function getProxies(proxyType) {
    var arr = [];
    for (var key in options[proxyType]) {
      if (typeof options[proxyType][key] === 'string') {
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

  function middlewareServerBuildWithCache(connect) {
    return getProxies('beforeProxies').concat([
      //connect.compress(),
      connect.favicon(),
      mountFolder(connect, 'test', 86400000),
      mountFolder(connect, 'dist-angular', 86400000),
      mountFolder(connect, 'dist', 86400000),
      connect.urlencoded()
    ]).concat(grunt.config('yeoman').e2eTestServer ?
        [proxyFolder('/_api/', '<%= yeoman.e2eTestServer %>')] : [])
        .concat(getProxies('proxies'));
  }

  return {
    options: {
      port: options.port,
      // Change this to 'localhost' to block access to the server from outside.
      hostname: '0.0.0.0'
    },
    livereload: {
      options: {
        livereload: options.livereload,
        protocol: options.protocol,
        key: readCertFile('server.key'),
        cert: readCertFile('server.crt'),
        ca: readCertFile('ca.crt'),
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
            proxyFolder('/_livereload/', 'http://localhost:<%= connect.options.livereload %>/'),
            connect.urlencoded()
          ]).concat(getProxies('proxies'));
        }
      }
    },
    localTest: {
      options: {
        port: 9876,
        middleware: function (connect) {
          return getProxies('beforeProxies').concat([
            injector(function when(req, res) {
              var contentType = res.getHeader('content-type');
              return contentType && contentType.indexOf('text/html') > -1;
            }, function converter(content, req, res, callback) {
              callback(null, content.toString().replace('</body>', '<script>LiveReload = \'HACK\'</script></body>'));
            }),
            mountFolder(connect, '.tmp'),
            mountFolder(connect, 'test'),
            mountFolder(connect, 'app'),
            connect.urlencoded()
            ]).concat(grunt.config('yeoman').e2eTestServer ?
                [proxyFolder('/_api/', '<%= yeoman.e2eTestServer %>')] : [])
              .concat(getProxies('proxies'));
        }
      }
    },
    test: {
      options: {
        port: 9876,
        middleware: middlewareServerBuildWithCache
      }
    },
    testSecondaryServer: {
      options: {
        port: 9877,
        middleware: middlewareServerBuildWithCache
      }
    },
    dist: {
      options: {
        open: '<%= yeoman.local %>',
        middleware: function (connect) {
          return getProxies('beforeProxies').concat([
            mountFolder(connect, 'test'),
            mountFolder(connect, 'dist-angular'),
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
