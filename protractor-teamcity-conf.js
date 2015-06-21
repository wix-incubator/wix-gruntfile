/* global process, exports, jasmine, browser */
'use strict';

var config = require('./protractor-conf').config;

function calcBrowserName(caps) {
  var browserName = caps.get('browserName');
  if (browserName === 'internet explorer') {
    browserName = 'IE';
  } else {
    browserName = browserName.charAt(0).toUpperCase() + browserName.slice(1);
  }
  return browserName + ' ' + caps.get('version').split('.').shift();
}

if (process.env.BUILD_NUMBER !== '12345') {
  var onPrepare = config.onPrepare || function () {};
  config.jasmineNodeOpts.print = function () {};
  config.onPrepare = function () {
    return browser.getCapabilities().then(function (caps) {
      var jasmineReporters = require('jasmine-reporters');
      var reporter = new jasmineReporters.TeamCityReporter();
      var prefix = calcBrowserName(caps) + ' - ';
      ['specStarted', 'specDone'].forEach(function (f) {
        var hooked = reporter[f];
        reporter[f] = function (spec) {
          if (spec.description && spec.description.indexOf(prefix) !== 0) {
            spec.description = prefix + spec.description;
          }
          return hooked.apply(this, arguments);
        };
      });
      jasmine.getEnv().addReporter(reporter);
      return onPrepare.apply(this, arguments);
    });
  };
}

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;

var sauceLabsBrowsers = {
  Chrome: {
    browserName: 'chrome',
    platform: 'Windows 8'
  },
  ChromeOSX: {
    browserName: 'chrome',
    platform: 'OS X 10.9'
  },
  FF: {
    browserName: 'firefox',
    platform: 'Windows 7'
  },
  FFOSX: {
    browserName: 'firefox',
    platform: 'OS X 10.9'
  },
  IE11: {
    browserName: 'internet explorer',
    version: '11',
    platform: 'Windows 8.1'
  },
  IE10: {
    browserName: 'internet explorer',
    version: '10',
    platform: 'Windows 8'
  },
  IE9: {
    browserName: 'internet explorer',
    version: '9',
    platform: 'Windows 7'
  },
  Safari7: {
    browserName: 'safari',
    version: '7',
    platform: 'OS X 10.9'
  },
  Safari6: {
    browserName: 'safari',
    version: '6',
    platform: 'OS X 10.8'
  }
};

var testBrowsers = (process.env.SAUCE_BROWSERS ? process.env.SAUCE_BROWSERS.split(' ') : Object.keys(sauceLabsBrowsers));
var shardsLeft = 15;

config.multiCapabilities = testBrowsers.map(function (key, index) {
  var browser = sauceLabsBrowsers[key];
  browser.name = 'e2e tests';
  browser['tunnel-identifier'] = process.env.BUILD_NUMBER;
  if (browser.platform !== 'OS X 10.9') {
    browser['screen-resolution'] = '1280x1024';
  }
  browser.build = process.env.BUILD_NUMBER;
  browser.shardTestFiles = true;
  browser.maxInstances = Math.round(shardsLeft / (testBrowsers.length - index));
  shardsLeft -= browser.maxInstances;
  return sauceLabsBrowsers[key];
});

exports.config = config;
