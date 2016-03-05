'use strict';

module.exports = function (grunt, options) {

  function isPosix(xmlString) {
    return xmlString.indexOf('\r\n') === -1;
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


  function isOldParent(xmlString) {
    var parentArtifact = '<artifactId>wix-master-parent</artifactId>';
    var parentGroup = '<groupId>com.wixpress.common</groupId>';

    return xmlString.indexOf(parentArtifact) !== -1 &&
      xmlString.indexOf(parentGroup) !== -1;
  }

  function replaceXml(xmlString, start, end, replaceFile) {
    var replaceXml = grunt.file.read(replaceFile);
    xmlString = xmlString.split(/\r?\n/g).join('\n');
    return xmlString.substr(0, start).trim() + replaceXml + xmlString.substr(end);
  }

  function writePomXml(xmlString) {
    grunt.file.write('pom.xml', xmlString.split('\n').join(isPosix(xmlString) ? '\n' : '\r\n'));
  }


  function updateParent(grunt) {
    var pomXml = grunt.file.read('pom.xml');
    var parentStart = pomXml.indexOf('<parent>');
    var parentEnd = pomXml.indexOf('</parent>', parentStart);

    if (!isOldParent(pomXml) || parentStart === -1 || parentEnd === -1) {
      return false;
    }

    grunt.log.writeln('=== UPGRADING YOUR POM.XML TO USE NEW PARENT ===');

    writePomXml(replaceXml(pomXml,
      parentStart,
      parentEnd+9,
      'node_modules/wix-gruntfile/grunt-helpers/data/new-parent-artifact.xml'));
    return true;
  }

  function updatePluginSettings(grunt) {
    var pomXml = grunt.file.read('pom.xml');
    var descriptorIdx = pomXml.indexOf('<descriptor>node_modules/wix-gruntfile/tar.gz.xml</descriptor>');
    if (descriptorIdx === -1) {
      grunt.log.writeln('could not find "<descriptor>node_modules/wix-gruntfile/tar.gz.xml</descriptor>"');
      return false;
    }

    var pluginStart = pomXml.indexOf('<plugin>', descriptorIdx-500);
    var pluginEnd = pomXml.indexOf('</plugin>', pluginStart);
    if (pluginStart === -1 || pluginEnd === -1) {
      grunt.log.writeln('could not find <plugin></plugin> boundaries', pluginStart, pluginEnd);
      return false;
    }

    grunt.log.writeln('=== UPGRADING YOUR POM.XML TO USE NEW PLUGIN SETTINGS ===');

    writePomXml(replaceXml(pomXml,
      pluginStart,
      pluginEnd+9,
      'node_modules/wix-gruntfile/grunt-helpers/data/new-plugin-settings.xml'));
    return true;
  }

  function verifyPomUpgrade(grunt) {
    if (!updateParent(grunt)) {
      return false;
    }

    return updatePluginSettings(grunt);
  }

  verifyVmsArtifactConfiguration(grunt);
  verifyPomUpgrade(grunt)
};
