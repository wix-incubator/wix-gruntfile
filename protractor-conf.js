/* global browser, angular */
'use strict';

var SELENIUM_FOLDER_PATH = '/usr/local/lib/node_modules/protractor/selenium/';

var fs = require('fs');

function getPath(targetFileName) {
  return SELENIUM_FOLDER_PATH + fs
    .readdirSync(SELENIUM_FOLDER_PATH)
    .filter(function (fileName) {
      return fileName.indexOf(targetFileName) !== -1;
    })[0];
}

module.exports.config = {
  allScriptsTimeout: 120000,

  baseUrl: 'http://localhost:9000/',

  specs: [
    process.cwd() + '/test/spec/e2e/**/*.js',
    process.cwd() + '/test/e2e/spec/**/*.js'
  ],

  framework: 'jasmine',

  capabilities: {
    browserName: 'chrome'
  },

  chromeDriver: getPath('chromedriver'),

  seleniumServerJar: getPath('selenium-server-standalone'),

  onPrepare: function () {
    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function () {
      angular.module('disableNgAnimate', []).run(function ($animate) {
        $animate.enabled(false);
      });
    };

    browser.addMockModule('disableNgAnimate', disableNgAnimate);

    // Store the name of the browser that's currently being used.
    browser.getCapabilities().then(function (caps) {
      browser.params.browser = caps.get('browserName');
    });
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 300000
  }
};
