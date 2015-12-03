'use strict';
var process = require('process');

module.exports = function (grunt, options) {
  return {
    remapIstanbul: {
      build: {
        src: './coverage/coverage-js.json',
        cwd: process.cwd(),
        options: {
          reports: {
            json: './coverage/coverage-ts.json'
          },
          fail: false
        }
      }
    }
  };
};
