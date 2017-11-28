'use strict';

module.exports = function register(grunt) {
  grunt.registerTask('migrate-bower-artifactory',
    process.env.MIGRATE_BOWER_ARTIFACTORY_TOOL ? migrateBowerArtifactory : noop);

  function noop() {}

  function migrateBowerArtifactory() {
    if (packageExists('migrate-bower-artifactory')) {
      const migrate = require('migrate-bower-artifactory').migrate;
      migrate();
    }
  }

  function packageExists(name) {
    try {
      require(name);
      return true;
    } catch (error) {
      return false;
    }
  }
};
