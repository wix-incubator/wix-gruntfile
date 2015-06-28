'use strict';

var spawn = require('child_process').spawn;
var references = 0;
var serverProcess;
var promise;

function clearSessionCookie() {
  afterEach(function () {
    browser.executeScript(function () {
      /* global document */
      document.cookie = 'connect.sid=';
    });
  });
}

function startServer(js, params) {
  var deferred = protractor.promise.defer();
  promise = deferred.promise;
  console.log('\x1b[33m%s\x1b[0m', 'Starting fake server!');
  serverProcess = spawn('node', [js].concat(params));
  serverProcess.stdout.on('data', function () {
    deferred.fulfill();
  });
  return deferred.promise;
}

module.exports = function (js, params) {
  references++;
  clearSessionCookie();
  if (promise) {
    browser.controlFlow().execute(function () {
      return promise;
    });
  } else {
    browser.controlFlow().execute(function () {
      return startServer(js, params);
    });
  }
  return {
    kill: function () {
      references--;
      if (references === 0) {
        console.log('\x1b[33m%s\x1b[0m', 'Killing fake server!');
        serverProcess.kill();
      }
    }
  };
};
