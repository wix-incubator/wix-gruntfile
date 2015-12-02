'use strict';

var terminate = require('terminate');
var spawn = require('child_process').spawn;
var grunt = require('grunt');
var protractorDir = require.resolve('protractor/bin/elementexplorer.js').replace('elementexplorer.js', '');

module.exports = {
  updateWebdriver: function (done) {
    var p = spawn('node', [protractorDir + '/webdriver-manager', 'update']);
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
    var allowedOptions = ['sauceUser', 'sauceKey', 'capabilities.tunnel-identifier',
                          'capabilities.build', 'browser', 'specs', 'baseUrl'];
    allowedOptions.forEach(function (option) {
      var value = grunt.option(option);
      if (value) {
        config[option] = value;
      }
    });

    var args = [protractorDir + '/protractor', config.configFile];
    args = args.concat(Object.keys(config).filter(function (key) {
      return key !== 'configFile';
    }).map(function (key) {
      return '--' + key + '=' + config[key];
    }));

    var p = spawn('node', args);
    var killed = false;
    var self = this;
    var retry = setTimeout(function () {
      console.log('RETRY!!!');
      killed = true;
      terminate(p.pid, function () {
        console.log('TERMINATED!!!');
        self.startProtractor(config, done);
      });
    }, 20000);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.stdout.on('data', function (data) {
      if (data.indexOf('onPrepare!!!') > -1) {
        clearTimeout(retry);
      }
    });
    p.on('exit', function (code) {
      if (!killed) {
        if (code !== 0) {
          grunt.fail.warn('Protractor test(s) failed. Exit code: ' + code);
        }
        done();
      }
    });
  }
};
