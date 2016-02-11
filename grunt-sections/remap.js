'use strict';
var process = require('process');

module.exports = function (grunt, options) {
  return {
    remapIstanbul: {
      build: {
        src: './coverage/coverage-js.json',
        options: {
          reports: {
            json: './coverage/coverage-ts.json'
          },
          fail: false
        }
      }
    },
    sourceMapBasename: {
      build:{
        src: ['.tmp/**/*.js.map']
      }
    }
  };
};
