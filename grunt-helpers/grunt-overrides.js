'use strict';

module.exports = function (grunt, options) {

  function verifyNpmScripts() {
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

  function verifyVmsArtifactConfiguration() {
    var pomXml = grunt.file.read('pom.xml');
    var vmsArtifactXml = grunt.file.read('node_modules/wix-gruntfile/grunt-helpers/data/vms-artifact-plugin.xml');

    if (pomXml.indexOf('node_modules/wix-gruntfile/tar.gz.xml') !== -1) {
      var posixNewLine = pomXml.indexOf('\r\n') === -1;
      pomXml = pomXml.split(/\r?\n/g).join('\n');
      grunt.log.writeln('=== PATCHING YOUR POM.XML ===');

      var modifiedPomXml = pomXml.replace(/<parent>[^]*<\/parent>/, '')
                                 .replace(/<build>[^]*<\/build>/, '')
                                 .replace(/<\/developers>/, '</developers>\n' + vmsArtifactXml)
                                 .replace(/^\s*\n/gm, '');
      if (modifiedPomXml.indexOf('wix-statics-parent') === -1 || modifiedPomXml.match(/<(build|parent)>/g).length !== 2) {
        grunt.log.writeln('=== FAILED PATCHING!!! ===');
      } else {
        grunt.file.write('pom.xml', modifiedPomXml.split('\n').join(posixNewLine ? '\n' : '\r\n'));
      }
    }
  }

  function fixTslintJson() {
    if (grunt.file.exists('tslint.json')) {
      let tslint = grunt.file.readJSON('tslint.json');
      if (tslint.rules && tslint.rules['no-trailing-comma']) {
        delete tslint.rules['no-trailing-comma'];
        tslint.rules['trailing-comma'] = [true, {singleline: 'never', multiline: 'never'}];
        grunt.file.write('tslint.json', JSON.stringify(tslint, null, 2));
      }
    }
  }

  fixTslintJson();
  verifyNpmScripts();
  if (process.env.PATCH_POM_XML) {
    verifyVmsArtifactConfiguration();
  }
};
