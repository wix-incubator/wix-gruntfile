'use strict';

var pretty = require('pretty-data');

module.exports = function (grunt /*, options*/) {

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
	};

	function verifyVmsArtifactConfiguration(grunt) {
		var pomXml = grunt.file.read('pom.xml');
		if (pomXml.indexOf('node_modules/wix-gruntfile/vms.tar.gz.xml') !== -1) {
			return; // section already found
		}

		grunt.log.writeln('=== PATCHING YOUR POM.XML ===');

		var existingAriftactIndex = pomXml.indexOf('node_modules/wix-gruntfile/tar.gz.xml');
		if (existingAriftactIndex === -1) {
			grunt.warn('I couldn\'t find pom.xml entry for tar.gz artifaat :(');
			return; // couldn't find original artifact so why continue
		}

		var endMarker = '</plugin>';
		var endPluginIndex = pomXml.indexOf(endMarker, existingAriftactIndex);
		if (endPluginIndex === -1) {
			grunt.warn('I couldn\'t find pom.xml\'s entry closure for tar.gz artifcat :(');
			// pom.xml fucked?
			return;
		}

		var insertIndex = endPluginIndex + endMarker.length;
		var vmsArtifactXml = grunt.file.read('node_modules/wix-gruntfile/grunt-helpers/data/vms-artifact-plugin.xml');
		var modifiedPomXml = pomXml.slice(0, insertIndex) +
				vmsArtifactXml +
				pomXml.slice(insertIndex);

		grunt.file.copy('pom.xml', 'pom.xml.bak'); //backup
		grunt.file.write('pom.xml', pretty.pd.xml(modifiedPomXml)); // overwrite
	};

	verifyNpmScripts(grunt);
	verifyVmsArtifactConfiguration(grunt);
};