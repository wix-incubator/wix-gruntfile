/* global process, exports, jasmine */
'use strict';

var buildName = 'e2e tests';
try {
  buildName = require(process.cwd() + '/package.json').name;
} catch (e) {

}
var config = require('./protractor-conf').config;

if (process.env.IS_BUILD_AGENT) {
  var onPrepare = config.onPrepare || function () {};
  config.capabilities.maxInstances = parseInt(process.env.PROTRACTOR_SHARDS, 10) || 6;
  if (config.capabilities.maxInstances === 1) {
    config.capabilities.shardTestFiles = false;
  }
  if (process.env.MULTI === 'true') {
    config.multiCapabilities = [{
      browserName: 'chrome',
      shardTestFiles: true,
      maxInstances: parseInt(process.env.PROTRACTOR_SHARDS, 10) || 6
    }, {
      browserName: 'firefox',
      shardTestFiles: true,
      maxInstances: parseInt(process.env.PROTRACTOR_SHARDS, 10) || 6
    }];
  }
  config.onPrepare = function () {
    var reporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new reporters.TeamCityReporter());
    onPrepare.apply(this, arguments);
  };
}

if (process.env.DOCKER_POC) {
  config.directConnect = false;
  config.seleniumAddress = 'http://' + process.env.CHROME_DRIVER_SERVER + ':' + process.env.SELENIUM_SERVER_PORT + '/wd/hub';
  config.baseUrl = 'http://' + process.env.EXTERNAL_IP + ':' + process.env.EXTERNAL_UI_TEST_PORT + '/';
  config.capabilities.chromeOptions = {
    args: ['disable-dev-tools=true', 'verbose=true']
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

// config.seleniumPort = 4445;

if (process.env.WIX_SAUCE === 'true') {
  config.multiCapabilities = [{
    browserName: 'firefox',
    platform: 'LINUX'
  }, {
    browserName: 'chrome',
    platform: 'LINUX'
  }, {
    browserName: 'internet explorer',
    platform: 'WINDOWS'
  }];
  config.seleniumAddress = process.env.SELENIUM_HUB_URL;
  config.baseUrl = process.env.SERVER_UNDER_TEST_URL;
}

exports.config = config;
exports.arrays = {cap1: capabilities1, cap2: capabilities2};
