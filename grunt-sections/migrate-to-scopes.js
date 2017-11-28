'use strict';

module.exports = function register(grunt) {

  grunt.registerTask('migrate-to-scopes', migrateToScopes);

  function migrateToScopes() {

    if (insideCi()) {
      return;
    }

    if (!packageExists('update-scopes')) {
      return;
    }

    var path = require('path');
    var update = require('update-scopes').update;

    var packageJson = path.join(process.cwd(), 'package.json');

    var done = this.async();
    update(packageJson).then(() => done()).catch(() => done());
  }

  function insideCi() {
    return process.env.BUILD_NUMBER || process.env.TEAMCITY_VERSION;
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
