'use strict';

module.exports = function register(grunt) {

  grunt.registerTask('migrate-to-scopes',
    process.env.MIGRATE_TO_SCOPED_PACKAGES === 'true' ? migrateToScopes : noop);

  function noop() {}

  function migrateToScopes() {

    if (!packageExists('update-scopes')) {
      return;
    }

    const path = require('path');
    const { update } = require('update-scopes');

    const packageJson = path.join(process.cwd(), 'package.json');

    let done = this.async();
    update(packageJson).then(() => done()).catch(() => done());
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
