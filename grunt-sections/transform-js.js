'use strict';

var shell = require('shelljs');
var featureDetector = require('../feature-detector');

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (grunt.task.exists('ts') && featureDetector.isTypescriptEnabled()) {
      grunt.file.write('./app/scripts/reference.ts', '/// <reference path="../reference.ts" />');
      grunt.file.write('./test/reference.ts', '/// <reference path="./spec/reference.ts" />');
      grunt.task.run('ts');
      grunt.task.run('theTsHack:e2e');
      grunt.task.run('theTsHack:copy');
    }
  });

  grunt.registerTask('theTsHack', function (param) {
    if (param === 'e2e') {
      shell.cp('-R', '.tmp/test/e2e', '.tmp');
      shell.cp('-R', './test/e2e/*', '.tmp/e2e/');
    } else if (param === 'rename') {
      shell.mv('.tmp/app/*', '.tmp/');
      grunt.file.delete('.tmp/app');
    } else {
      shell.cp('-Rf', '.tmp/app/*', '.tmp/');
      grunt.file.delete('.tmp/app');
    }

  });

  grunt.registerTask('traceurIfEnabled', function () {
    if (grunt.task.exists('traceur') && featureDetector.isTraceurEnabled()) {
      grunt.task.run('newer:traceur');
    }
  });

  return {
    traceur: {
      options: {
        experimental: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['{modules,scripts}/**/*.es6', '!modules/**/*.test.es6'],
          dest: '.tmp',
          ext: '.js',
          extDot: 'last'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test',
          src: ['**/*.es6'],
          dest: '.tmp/test',
          ext: '.js',
          extDot: 'last'
        }]
      }
    },
    typescript: {
      ut: {
        src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts',
          'test/spec/**/*.ts', 'test/mock/**/*.ts'],
        outDir: '.tmp/',
        reference: './test/spec/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false,
          module: 'commonjs'
        }
      },
      source: {
        src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts'],
        outDir: '.tmp/',
        reference: './app/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false,
          module: 'commonjs'
        }
      },
      e2e: {
        src: [
          'app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts', '!app/scripts/typings/**/*.ts',
          'test/e2e/**/*.ts', 'test/mock/**/*.ts'],
        outDir: '.tmp/',
        reference: './test/e2e/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false,
          module: 'commonjs'
        }
      }
    }
  };
};
