/* global process, exports, jasmine */
'use strict';

var config = require('./protractor-conf').config;

if (process.env.BUILD_NUMBER !== '12345') {
  var onPrepare = config.onPrepare || function () {};
  config.onPrepare = function () {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    onPrepare.apply(this, arguments);
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
  browser.maxInstances = Math.round(shardsLeft/(testBrowsers.length - index));
  shardsLeft -= browser.maxInstances;
  return sauceLabsBrowsers[key];
});

exports.config = config;
