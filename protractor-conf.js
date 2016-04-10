/* global browser, angular, document, beforeEach, afterEach, jasmine */
'use strict';

var fs = require('fs');
var glob = require('glob');

var config = {};
try {
  config = require(process.cwd() + '/protractor-base-conf').config;
} catch (e) {

}

config.allScriptsTimeout = 120000;

config.baseUrl = 'http://localhost:9000/';

config.specs = [
  process.cwd() + '/test/spec/e2e/**/*.js',
  process.cwd() + '/test/e2e/spec/**/*.js',
  process.cwd() + '/app/test/spec/e2e/**/*.js',
  process.cwd() + '/app/test/e2e/spec/**/*.js'
];

config.framework = 'jasmine2';

config.capabilities = {
  browserName: 'chrome',
  shardTestFiles: true,
  maxInstances: 6
};

function hasFocusedTests(patterns, stringsRegex) {
  var commentsRegex = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:^[\s;]*\/\/.*$)/gm;

  return patterns.some(function (pattern) {
    return glob.sync(pattern).some(function (file) {
      var fileContent = fs.readFileSync(file, 'utf-8');
      fileContent = fileContent.replace(commentsRegex, '');

      return stringsRegex.test(fileContent);
    });
  });
}

function warn(message) {
  console.log('\x1b[33m%s\x1b[0m', message);
}

if (hasFocusedTests(config.specs, new RegExp('^\\s*\\b(iit|fit|ddescribe|fdescribe|tthey|fthey)\\s*\\(', 'gm'))) {
  config.capabilities.shardTestFiles = false;
  warn('Protractor sharding is disabled due to presence of focused tests.');
}

var onPrepare = config.onPrepare || function () {};
config.onPrepare = function () {
  require('babel/register');
  console.log('onPrepare!!!');

  try {
    var ScreenshotReporter = require('screenshot-reporter');
    jasmine.getEnv().addReporter(new ScreenshotReporter());
  } catch (e) {}

  // Disable animations so e2e tests run more quickly
  var disableNgAnimate = function () {
    angular.module('disableNgAnimate', []).run(function ($animate) {
      $animate.enabled(false);
    });
  };

  var disableCssAnimate = function () {
    angular.module('disableCssAnimate', []).run(function () {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '* {' +
        '-webkit-transition: none !important;' +
        '-moz-transition: none !important;' +
        '-o-transition: none !important;' +
        '-ms-transition: none !important;' +
        'transition: none !important;' +
        '}';
      document.getElementsByTagName('head')[0].appendChild(style);
    });
  };

  var biLoggerDryRun = function () {
    angular.module('biLoggerDryRun', []).config(function () {
      /* global W */
      if (typeof W !== 'undefined' && W.BI) {
        W.BI.DryRun = true;
      }
    });
  };

  var disableTimeouts = function () {
    angular.module('disableTimeouts', [])
      .config(function ($provide) {
        $provide.decorator('$timeout', function ($delegate) {
          var mockTimeout = function () {
            arguments[typeof arguments[0] === 'function' ? 1 : 0] = 0;
            return $delegate.apply(this, arguments);
          };
          angular.extend(mockTimeout, $delegate);
          return mockTimeout;
        });
      });
  };

  beforeEach(function () {
    browser.addMockModule('disableNgAnimate', disableNgAnimate);
    browser.addMockModule('disableCssAnimate', disableCssAnimate);
    browser.addMockModule('biLoggerDryRun', biLoggerDryRun);
    browser.addMockModule('disableTimeouts', disableTimeouts);
  });

  afterEach(function () {
    browser.removeMockModule('disableNgAnimate');
    browser.removeMockModule('disableCssAnimate');
    browser.removeMockModule('biLoggerDryRun');
    browser.removeMockModule('disableTimeouts');
  });

  // Store the name of the browser that's currently being used.
  browser.getCapabilities().then(function (caps) {
    browser.params.browser = caps.get('browserName');
  });

  onPrepare.apply(this, arguments);
};

config.jasmineNodeOpts = {
  defaultTimeoutInterval: 300000,
  isVerbose: true
};

module.exports.config = config;
