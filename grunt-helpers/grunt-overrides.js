'use strict';

module.exports = function (grunt) {

  function verifyNpmScripts(grunt) {
    var packageJson = grunt.file.readJSON('package.json');

    if (!packageJson.scripts || !packageJson.scripts.build || !packageJson.scripts.release || !packageJson.scripts.test) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = packageJson.scripts.build || 'node_modules/wix-gruntfile/scripts/build.sh';
      packageJson.scripts.release = packageJson.scripts.release || 'node_modules/wix-gruntfile/scripts/release.sh';
      packageJson.scripts.test = packageJson.scripts.test || '#tbd';
      packageJson.scripts.start = packageJson.scripts.start || 'grunt serve';
      grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
    }

    if (!packageJson.publishConfig && packageJson.private !== true) {
      packageJson.private = true;
      grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
    }
  }

  verifyNpmScripts(grunt);
};
