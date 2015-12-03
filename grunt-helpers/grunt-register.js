'use strict';

var shell = require('shelljs');
var path = require('path');

module.exports = function (grunt, options) {
  grunt.registerTask('wix-install', function () {
    shell.exec('npm install; bower install; bundle install', {silent : true});
  });

  var preBuildTasks = [
    'jsstyleIfEnabled',
    'scssstyleIfEnabled',
    'typescriptIfEnabled',
    'traceurIfEnabled',
    'mkdirTmpStyles',
    'newer:webfontIfEnabled',
    'hamlIfEnabled',
    'compass:dist',
    'replaceOrVelocity',
    'newer:copy:styles',
    'newer:jsonAngularTranslate',
    'newer:ngtemplates:single',
    'newer:petriExperiments',
    'autoprefixerIfEnabled',
    'styleInlineServeIfEnabled',
    'newer:copy:vm'
  ];

  if (options.useNodeSass) {
    preBuildTasks.splice(preBuildTasks.indexOf('compass:dist'), 0, 'sass:dist');
  }
  grunt.registerTask('pre-build', preBuildTasks);

  grunt.registerTask('pre-build:clean', [
    'clean:dist',
    'newer-clean',
    'pre-build'
  ]);

  grunt.registerTask('package', function () {
    grunt.task.run([
      // 'imagemin',
      'copy:images',
      'copy:dist',
      'manifestPackager',
      'useminPrepare',
      'styleInlineDistIfEnabled',
      'ngtemplates',
      'concat',
      'cssmin',
      'ngAnnotate',
      'uglify',
      'cdnify',
      'usemin',
      'processTags',
      'concat:dts',
      'replace:dts'
    ]);
  });

  grunt.registerTask('serve:verbose', [
    'serve'
  ]);

  grunt.registerTask('serve', [
    'ignore-code-style-checks',
    'karma:unit',
    'clean:ts',
    'pre-build',
    'livereloadServer',
    'connect:livereload',
    'force:karma:unit:run',
    'remapIstanbul',
    'remapIstanbulJsAndReport',
    'watch'
  ]);

  grunt.registerTask('serve:dist', [
    'ignore-code-style-checks',
    'connect:dist:keepalive'
  ]);

  grunt.registerTask('serve:clean', [
    'clean:server',
    'newer-clean',
    'serve'
  ]);

  grunt.registerTask('serve:coverage', [
    'enableCoverage',
    'serve'
  ]);

  grunt.registerTask('test', [
    'pre-build:clean',
    'karma:single'
  ]);

  grunt.registerTask('test:e2e', function (type) {
    if (type === 'noshard') {
      grunt.modifyTask('protractor', {normal : {options : {'capabilities.shardTestFiles' : 0}}});
    }
    grunt.task.run('connect:localTest');
    grunt.task.run('webdriver');
    grunt.task.run('protractor:normal');
  });

  grunt.registerTask('test:ci', [
    'e2eIfEnabled:teamcity'
  ]);

  require('../grunt-sections/verify-npm')(grunt);

  grunt.registerTask('build', [
    'verify-npm',
    'pre-build:clean',
    'karma:single',
    'package',
    'e2eIfEnabled:normal'
  ]);

  grunt.registerTask('build:ci', [
    'pre-build:clean',
    'karma:teamcity',
    'package',
    'copy:sadignore'
  ]);

  grunt.registerTask('publish', [
    'concat:dts',
    'replace:dts',
    'release'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });

  grunt.registerTask('convert-tsconfig', require('../grunt-sections/convert-tsconfig')(grunt).convertToTsConfig);

  // remapIstanbul skips the non-mapped entries in coverage.json and
  // doesn't update their path to relative path
  // This also uses istanbul report method instead of creating another task
  grunt.registerTask('remapIstanbulJsAndReport', function(){
    var istanbul = require('istanbul');
    var collector = new istanbul.Collector();
    var collectorOutput = new istanbul.Collector();
    var report = istanbul.Report.create('html', {dir: './coverage/report'});
    var coverage = {};

    collector.add(grunt.file.readJSON('./coverage/coverage-ts.json'));

    collector.files().forEach(function(file) {
      var fileCoverage = collector.fileCoverageFor(file);
      var filePath = fileCoverage.path;
      if (path.extname(file) === '.js'){
        filePath = path.relative(process.cwd(), file);
      }
      coverage[shiftLeftDirectory(filePath)] = fileCoverage;
    });

    collectorOutput.add(coverage);
    report.writeReport(collectorOutput, true);
  });

  grunt.registerMultiTask('sourceMapBasename', function () {
    this.filesSrc.forEach(function (file) {
      sourceMapBasename(file);
    });
  });

  function shiftLeftDirectory(filePath) {
    var splitPath = filePath.split(path.sep);
    splitPath.shift();
    filePath = splitPath.join(path.sep);
    return filePath;
  }

  function sourceMapBasename(source) {
    var jsMap = grunt.file.readJSON(source);
    jsMap.sources = jsMap.sources.map(function (relativePath) {
      return path.basename(relativePath)
    });
    grunt.file.write(source, JSON.stringify(jsMap));
  }
};
