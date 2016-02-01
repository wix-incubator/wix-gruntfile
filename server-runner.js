/* global afterEach, browser */
'use strict';

var spawn = require('child_process').spawn;
var q = require('q');
var serverProcess;

module.exports = function (js, params) {
  var deferred = q.defer();
  console.log('\x1b[33m%s\x1b[0m', 'Starting fake server!');

  serverProcess = spawn('node', [js].concat(params));
  serverProcess.stdout.on('data', function () {
    deferred.resolve();
  });
  serverProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  serverProcess.on('close', function () {
    console.log('\x1b[31m%s\x1b[0m', 'Fake server aborted!! This might mean port is already in use.');
    process.exit();
  });

  return {
    promise: deferred.promise,
    kill: function () {
      console.log('\x1b[33m%s\x1b[0m', 'Killing fake server!');
      serverProcess.kill();
    }
  };
};

module.exports.addSessionCookieCleaner = function () {
  afterEach(function () {
    browser.executeScript(function () {
      /* global document */
      document.cookie = 'connect.sid=';
    });
  });
};
