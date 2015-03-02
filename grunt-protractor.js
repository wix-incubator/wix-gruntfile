'use strict';

var spawn = require('child_process').spawn;
var grunt = require('grunt');

module.exports = {
  updateWebdriver: function (done) {
    var p = spawn('node', ['node_modules/protractor/bin/webdriver-manager', 'update']);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function (code) {
      if (code !== 0) {
        grunt.fail.warn('Webdriver failed to update');
      }
      done();
    });
  },

  startProtractor: function (config, done) {
    var sauceUser = grunt.option('sauceUser');
    var sauceKey = grunt.option('sauceKey');
    var tunnelIdentifier = grunt.option('capabilities.tunnel-identifier');
    var sauceBuild = grunt.option('capabilities.build');
    var browser = grunt.option('browser');
    var specs = grunt.option('specs');
    var args = ['node_modules/protractor/bin/protractor', config.configFile];
    var overrideKeys = Object.keys(config).filter(function (key) {
      return key !== 'configFile';
    });
    if (sauceUser) {
      args.push('--sauceUser=' + sauceUser);
    }
    if (sauceKey) {
      args.push('--sauceKey=' + sauceKey);
    }
    if (tunnelIdentifier) {
      args.push('--capabilities.tunnel-identifier=' + tunnelIdentifier);
    }
    if (sauceBuild) {
      args.push('--capabilities.build=' + sauceBuild);
    }
    if (specs) {
      args.push('--specs=' + specs);
    }
    if (browser) {
      args.push('--browser=' + browser);
    }
    if (overrideKeys.length) {
      overrideKeys.forEach(function (key) {
        args.push('--' + key + '=' + config[key]);
      });
    }

    var p = spawn('node', args);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function (code) {
      if (code !== 0) {
        grunt.fail.warn('Protractor test(s) failed. Exit code: ' + code);
      }
      done();
    });
  }
};
