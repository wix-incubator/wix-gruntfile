/* global process, exports, jasmine */
'use strict';

var buildName = 'e2e tests';
try {
  buildName = require(process.cwd() + '/package.json').name;
} catch (e) {

}
var config = require('./protractor-conf').config;

if (process.env.BUILD_NUMBER !== '12345') {
  var onPrepare = config.onPrepare || function () {};
  config.capabilities.maxInstances = 2; //parseInt(process.env.PROTRACTOR_SHARDS, 10) || 1;
  if (config.capabilities.maxInstances === 1) {
    config.capabilities.shardTestFiles = false;
  }
  config.onPrepare = function () {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    onPrepare.apply(this, arguments);
  };
}

var sauceLabsBrowsers = {
  Chrome: {
    browserName: 'chrome',
    platform: 'Windows 7'
  },
  ChromeOSX: {
    browserName: 'chrome',
    platform: 'OS X 10.8'
  },
  FF: {
    browserName: 'firefox',
    platform: 'Windows 7'
  },
  FFOSX: {
    browserName: 'firefox',
    platform: 'OS X 10.10'
  },
  IE11: {
    browserName: 'internet explorer',
    version: '11',
    platform: 'Windows 7'
  },
  IE10: {
    browserName: 'internet explorer',
    version: '10',
    platform: 'Windows 7'
  },
  IE9: {
    browserName: 'internet explorer',
    version: '9',
    platform: 'Windows 7'
  },
  Safari8: {
    browserName: 'safari',
    version: '8',
    platform: 'OS X 10.10'
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

var capabilities = testBrowsers.map(function (key, index) {
  var browser = sauceLabsBrowsers[key];
  browser.name = buildName;
  browser['tunnel-identifier'] = process.env.BUILD_NUMBER;
  if (browser.platform !== 'OS X 10.9' && browser.platform !== 'OS X 10.10') {
    browser['screen-resolution'] = '1280x1024';
  }
  browser.public = 'team';
  browser.idleTimeout = 180;
  browser.build = buildName + ' ' + process.env.BUILD_NUMBER;
  browser.shardTestFiles = true;
  browser.recordVideo = false;
  browser.recordScreenshots = false;
  browser.recordLogs = false;
  browser.maxInstances = Math.round(shardsLeft / (testBrowsers.length - index));
  shardsLeft -= browser.maxInstances;
  return sauceLabsBrowsers[key];
});

var indexArr = Math.floor(capabilities.length / 2);
var capabilities1 = capabilities.slice(0, indexArr);
var capabilities2 = capabilities.slice(indexArr);

// config.sauceUser = process.env.SAUCE_USERNAME;
// config.sauceKey = process.env.SAUCE_ACCESS_KEY;
// config.multiCapabilities = capabilities;
// config.getPageTimeout = 30;

exports.config = config;
exports.arrays = {cap1: capabilities1, cap2: capabilities2};
