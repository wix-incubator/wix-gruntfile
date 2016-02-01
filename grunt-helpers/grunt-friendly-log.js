'use strict';

module.exports = function (grunt) {
  var currentStage, stages = {
    'jshint:scripts': 'Running Linters',
    'jshint:test': 'Running Linters',
    'tslint:all': 'Running Linters',
    'ts:build': 'Transpiling Typescript',
    'webfont:icons': 'Building Font icons',
    'haml:dist': 'Compiling Haml',
    'compass:dist': 'Runing Compass',
    'replaceOrVelocity': 'Rendering Velocity',
    'jsonAngularTranslate:server': 'Generating Translations',
    'ngtemplates:single': 'Preloading Templates',
    'petriExperiments:all': 'Defining Experiments',
    'autoprefixer:dist': 'Adding CSS prefixes',
    'connect:livereload': 'Running Local server',
    'karma:unit:run': 'Running Unit tests',
    'watch': 'Watching Changes'
  };

  function silence() {
    var hooks = {};
    ['header', 'writeln', 'write', 'ok'].forEach(function (x) {
      hooks[x] = grunt.log[x];
      grunt.log[x] = function () {};
    });
    grunt.log.header = function () {
      Object.assign(grunt.log, hooks);
      grunt.log.header.apply(this, arguments);
    };
  }

  if (process.argv[2] === 'serve' || process.argv[2] === 'serve:clean') {
    var chalk = require('chalk');
    grunt.log.header = function (x) {
      var match = x.match(/Running "([^"]*)"/);
      if (match && stages[match[1]] && currentStage !== stages[match[1]]) {
        currentStage = stages[match[1]];
        console.log(currentStage.split(' ').map((x, i) => chalk[i === 0 ? 'gray' : 'green'](x)).join(' ') + '...');
      }
      silence();
    };
  }
};