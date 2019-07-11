'use strict';

var shell = require('shelljs');

var shouldRunTests = process.env.SKIP_TESTS_IN_BUILD !== 'true';
var shouldRunFedops = process.env.SKIP_FEDOPS_IN_BUILD !== 'true';

console.warn('TESTS ARE SKIPPED SINCE "SKIP_TESTS_IN_BUILD" is defined as "true"');

module.exports = function (grunt, options) {
  grunt.registerTask('wix-install', function () {
    shell.exec('npm install; bower install; bundle install', { silent: true });
  });

  var preBuildTasks = [
    'jsstyleIfEnabled',
    'scssstyleIfEnabled',
    'typescriptIfEnabled',
    'babelIfEnabled',
    'mkdirTmpStyles',
    'newer:webfontIfEnabled',
    'hamlIfEnabled',
    'compass:dist',
    'replaceOrVelocity',
    'ejs:serve',
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

  if (options.templateType !== 'ejs') {
    preBuildTasks.splice(preBuildTasks.indexOf('ejs:serve'), 1);
  }

  grunt.registerTask('pre-build', preBuildTasks);

  grunt.registerTask('pre-build:clean', [
    'clean:dist',
    'newer-clean',
    'pre-build'
  ]);

  var packageTasks = [
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
    'replace:dts',
    'ejs:dist'
  ];

  if (options.templateType !== 'ejs') {
    packageTasks.splice(packageTasks.indexOf('ejs:dist'), 1);
  }

  grunt.registerTask('package', packageTasks);

  grunt.registerTask('serve:verbose', [
    'serve'
  ]);

  grunt.registerTask('serve', [
    'migrate-to-scopes',
    'migrate-bower-artifactory',
    'verify-npm',
    'ignore-code-style-checks',
    'karma:unit',
    'clean:ts',
    'pre-build',
    'livereloadServer',
    'connect:livereload',
    'force:runKarma',
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
      grunt.modifyTask('protractor', { normal: { options: { 'capabilities.shardTestFiles': 0 } } });
    }
    grunt.task.run('connect:localTest');
    grunt.task.run('webdriver');
    grunt.task.run('protractor:normal');
  });

  grunt.registerTask('test:ci', shouldRunTests ? [
    'e2eIfEnabled:teamcity'
  ] : []);

  require('../grunt-sections/migrate-bower-artifactory')(grunt);
  require('../grunt-sections/migrate-to-scopes')(grunt);
  require('../grunt-sections/verify-npm')(grunt);
  require('../grunt-sections/fedops')(grunt);

  grunt.registerTask('build', [
    'migrate-to-scopes',
    'migrate-bower-artifactory',
    'verify-npm',
    'pre-build:clean',
    shouldRunTests ? 'karma:single' : 'noop',
    'package',
    shouldRunTests ? 'e2eIfEnabled:normal' : 'noop'
  ]);

  grunt.registerTask('build:ci', [
    'pre-build:clean',
    shouldRunTests ? 'karma:teamcity' : 'noop',
    'package',
    'copy:sadignore',
    shouldRunFedops ? 'fedops-registration' : 'noop'
  ]);

  grunt.registerTask('publish', [
    'concat:dts',
    'replace:dts',
    'release'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });

  grunt.registerTask('noop', function () {
    console.log('step is skipped');
  });

  grunt.registerTask('runKarma', function () {
    if (grunt.option('enableCoverage')) {
      grunt.task.run('karma:single');
      grunt.task.run('remapIstanbul');
      grunt.task.run('remapIstanbulJsAndReport');
    } else {
      grunt.task.run('karma:unit:run');
    }
  });

  grunt.registerTask('convert-tsconfig', require('../grunt-sections/convert-tsconfig')(grunt).convertToTsConfig);

};
