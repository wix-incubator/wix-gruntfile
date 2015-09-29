// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

var featureDetector = require('./feature-detector');

module.exports = function (config) {
  var os = require('os');
  var isOsx = os.platform()  === 'darwin';

  var frameworks = ['jasmine'],
      plugins = [
        'karma-jasmine',
        'karma-coverage',
        'karma-phantomjs-launcher',
        'karma-growl-reporter',
        'karma-osx-reporter',
        'karma-teamcity-reporter',
        'karma-ng-html2js-preprocessor',
        'karma-chrome-launcher',
        'karma-simple-reporter'];

  if (!!process.env.USE_JASMINE2) {
    frameworks = ['jasmine2', 'jasmine1-shim'];
    plugins = [
      'karma-jasmine2',
      'karma-jasmine1-shim',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-growl-reporter',
      'karma-osx-reporter',
      'karma-teamcity-reporter',
      'karma-ng-html2js-preprocessor',
      'karma-chrome-launcher',
      'karma-simple-reporter'];
  }

  config.set({
    plugins: plugins,

    preprocessors: {
      '{app,.tmp}/scripts/{,!(lib)/**/}*.js': 'coverage',
      '{app,.tmp}/modules/{,/**/}!(*.test).js': 'coverage',
      '{app,.tmp}/**/*.html': 'ng-html2js',
      '{app,.tmp}/images/**/*.svg': 'ng-html2js'
    },

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: frameworks,

    // list of files / patterns to load in the browser
    files: [ ],

    // list of files / patterns to exclude
    exclude: [
      '{,.tmp/}test/spec/e2e/**/*.js',
      '{,.tmp/}test/e2e/**/*.js',
      '{app,.tmp}/scripts/locale/*_!(en).js'
    ],

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['coverage', 'growl', 'karmaSimpleReporter'].concat(isOsx ? ['osx'] : []),

    // web server port
    port: 8880,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - chromeHeadless (will start in "headless" mode)
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: featureDetector.isTraceurEnabled() ? ['chromeHeadless'] : ['PhantomJS'],

    // browser configuration
    customLaunchers: {
      chromeHeadless: {
        base: 'Chrome',
        // required to run Chrome in a headless environment (Xvfb)
        flags: ['--no-sandbox']
      }
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
