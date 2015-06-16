'use strict';

var shell = require('shelljs');

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (grunt.task.exists('ts')) {
      grunt.file.write('app/scripts/reference.ts', '/// <reference path="../../reference.ts" />');
      grunt.file.write('test/reference.ts', '/// <reference path="../reference.ts" />');
      grunt.task.run('tsWithHack:rename');
    }
  });

  grunt.registerTask('tsWithHack', function (param) {
    grunt.task.run('ts');
    grunt.task.run('theTsHack:' + param);
  });

  grunt.registerTask('theTsHack', function (param) {
    if (param === 'rename') {
      shell.mv('.tmp/app/*', '.tmp/');
    } else {
      shell.cp('-Rf', '.tmp/app/*', '.tmp/');
    }
    grunt.file.delete('.tmp/app');
  });

  grunt.registerTask('traceurIfEnabled', function () {
    if (grunt.task.exists('traceur')) {
      grunt.task.run('traceur');
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
      build: {
        src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts', 'test/**/*.ts'],
        outDir: '.tmp/',
        reference: 'reference.ts',
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
