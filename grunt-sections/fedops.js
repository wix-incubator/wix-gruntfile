'use strict';

module.exports = function register(grunt) {
  grunt.registerTask('fedops-registration', function () {
    var done = this.async();
    var fedops = require('fedops-grafana-api');
    try {
      var fedopsJson = grunt.file.readJSON('fedops.json');
      fedops.sync(fedopsJson)
        .then(function () {
          done();
        })
        .catch(function (e) {
          grunt.log.error('Error: grafana sync failure');
          done();
        });
    } catch (e) {
      grunt.log.error('Error: fedops.json does not exist or not a valid JSON');
      done();
    }
  });
};
