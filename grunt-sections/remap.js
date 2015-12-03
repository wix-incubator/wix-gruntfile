'use strict';

module.exports = function (grunt, options) {
  return {
    remapIstanbul: {
      build: {
        src: './coverage/coverage-final.json',
        options: {
          reports: {
            'html': './coverage/report'
          },
          fail: false
        }
      }
    }
  };
};
