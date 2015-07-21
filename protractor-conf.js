/* global browser, angular, document, beforeEach, afterEach */
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
  process.cwd() + '/test/e2e/spec/**/*.js'
];

config.framework = 'jasmine';

config.capabilities = {
  browserName: 'chrome'
};

function hasFocusedTests(patterns, strings) {
  var commentsRegex = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm;

  return patterns.some(function (pattern) {
    return glob.sync(pattern).some(function (file) {
      var fileContent = fs.readFileSync(file, 'utf-8');
      fileContent = fileContent.replace(commentsRegex, '');
      return strings.some(function (str) {
        return fileContent.indexOf(str) >= 0;
      });
    });
  });
}

if(!hasFocusedTests(config.specs, ['iit(', 'ddescribe('])) {
  // Add capabilities
  config.capabilities.shardTestFiles = true;
  config.capabilities.maxInstances = 6;
}

var onPrepare = config.onPrepare || function () {};
config.onPrepare = function () {
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

  beforeEach(function () {
    browser.addMockModule('disableNgAnimate', disableNgAnimate);
    browser.addMockModule('disableCssAnimate', disableCssAnimate);
    browser.addMockModule('biLoggerDryRun', biLoggerDryRun);
  });

  afterEach(function () {
    browser.removeMockModule('disableNgAnimate');
    browser.removeMockModule('disableCssAnimate');
    browser.removeMockModule('biLoggerDryRun');
  });

  // Store the name of the browser that's currently being used.
  browser.getCapabilities().then(function (caps) {
    browser.params.browser = caps.get('browserName');
  });

  onPrepare.apply(this, arguments);
};

config.jasmineNodeOpts = {
  defaultTimeoutInterval: 300000
};

module.exports.config = config;
