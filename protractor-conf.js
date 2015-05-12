/* global browser, angular */
'use strict';

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

  onPrepare: function () {
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

    beforeEach(function () {
        browser.addMockModule('disableNgAnimate', disableNgAnimate);
        browser.addMockModule('disableCssAnimate', disableCssAnimate);
    });

    // Store the name of the browser that's currently being used.
    browser.getCapabilities().then(function (caps) {
      browser.params.browser = caps.get('browserName');
    });
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 300000
  }
};
