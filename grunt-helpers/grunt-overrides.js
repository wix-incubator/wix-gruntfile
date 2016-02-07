'use strict';

module.exports = function (grunt, options) {

  function verifyNpmScripts(grunt, options) {
    var packageJson = grunt.file.readJSON('package.json');

    if (!packageJson.scripts || !packageJson.scripts.build || !packageJson.scripts.release || !packageJson.scripts.test) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.build = packageJson.scripts.build || 'node_modules/wix-gruntfile/scripts/build.sh';
      packageJson.scripts.release = packageJson.scripts.release || 'node_modules/wix-gruntfile/scripts/release.sh';
      packageJson.scripts.test = packageJson.scripts.test || '#tbd';
      packageJson.scripts.start = packageJson.scripts.start || 'grunt serve';
      grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
    }

    if (!packageJson.publishConfig) {
      if (options.bowerComponent) {
        packageJson.private = false;
        packageJson.publishConfig = {registry: 'http://repo.dev.wix/artifactory/api/npm/npm-local/'};
        grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
      } else if (packageJson.private !== true) {
      packageJson.private = true;
      grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
    }
  }
  }

  function verifyVmsArtifactConfiguration(grunt) {
    var pomXml = grunt.file.read('pom.xml');
    var vmsArtifactXml = grunt.file.read('node_modules/wix-gruntfile/grunt-helpers/data/vms-artifact-plugin.xml');

    if (pomXml.indexOf('node_modules/wix-gruntfile/vms.tar.gz.xml') !== -1) {
      var posixNewLine = pomXml.indexOf('\r\n') === -1;
      pomXml = pomXml.split(/\r?\n/g).join('\n');
      grunt.log.writeln('=== UNPATCHING YOUR POM.XML ===');

      var modifiedPomXml = pomXml.replace(vmsArtifactXml, '');
      if (modifiedPomXml.indexOf('node_modules/wix-gruntfile/vms.tar.gz.xml') !== -1) {
        grunt.log.writeln('=== FAILED UNPATCHING!!! ===');
      } else {
        grunt.file.write('pom.xml', modifiedPomXml.split('\n').join(posixNewLine ? '\n' : '\r\n'));
      }
    }
  }

  verifyNpmScripts(grunt, options);
  verifyVmsArtifactConfiguration(grunt);
};
