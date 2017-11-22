'use strict';

module.exports = function register(grunt) {
  grunt.registerTask('fedops-registration', function () {
    const done = this.async();
    const fedops = require('fedops-grafana-api');
    try {
      const fedopsJson = grunt.file.readJSON('fedops.json');
      fedops.sync(fedopsJson)
        .then(function () {
          done();
        })
        .catch(function (e) {
          grunt.log.write('Error: grafana sync failure: status ', e.status, ' message: ', e.response && e.response.text);
          done();
        });
    } catch (e) {
      grunt.log.write('Error: fedops.json does not exist or not a valid JSON');
      done();
    }
  });
};
