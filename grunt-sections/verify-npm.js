'use strict';

module.exports = function register(grunt, options) {
  grunt.registerTask('verify-npm', function () {
    var satisfaction = require('satisfaction');

    var satisfied = satisfaction.status();

    if (!satisfied) {
      var warning = [
      'Warning: ',
      'node_modules is behind package.json (NPM dependencies are outdated)',
      satisfaction.violations().join('\n'),
      'Please run "npm install" before running grunt again.',
      '(If that doesn\'t work, delete your node_modules dir before running "npm install")',
      '\n'
      ].join('\n');
      grunt.log.error(warning);
    }
  });

  return {

  }
};