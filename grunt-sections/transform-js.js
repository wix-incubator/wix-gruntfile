'use strict';

var shell = require('shelljs');
var featureDetector = require('../feature-detector');

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (grunt.task.exists('typescriptUsingTsConfig') && featureDetector.isTypescriptEnabled()) {
      grunt.task.run('tsWithHack:copy');
    }
  });

  grunt.registerTask('tsWithHack', function (param) {
    grunt.task.run('typescriptUsingTsConfig');
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
      build: {
        options: {
          rootDir: "./",
          defaultTsConfig: {
            "compilerOptions": {
              "target": "es5",
              "module": "commonjs",
              "removeComments": false,
              "declaration": false,
              "sourceMap": false,
              "outDir": ".tmp"
            },
            "filesGlob": [
              'app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts',
              'test/**/*.ts'
            ],
            "files": []
          }
        }
      }
    }
  };
};
