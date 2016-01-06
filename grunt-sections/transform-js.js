'use strict';

var shell = require('shelljs');
var featureDetector = require('../feature-detector');

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (grunt.task.exists('ts') && featureDetector.isTypescriptEnabled()) {
      if (!featureDetector.isTSConfigEnabled()) {
        grunt.file.write('app/scripts/reference.ts', '/// <reference path="../../reference.ts" />');
        if (featureDetector.isTestInAppFolderEnabled()) {
          grunt.file.write('app/test/reference.ts', '/// <reference path="../../reference.ts" />');
        } else {
          grunt.file.write('test/reference.ts', '/// <reference path="../reference.ts" />');
        }
      }
      grunt.task.run('tsWithHack:copy');
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
    if (grunt.task.exists('traceur') && featureDetector.isTraceurEnabled()) {
      grunt.task.run('newer:traceur');
    }
  });
  var createDeclaration = options.bowerComponent;

  var typeScriptConfig;
  if (featureDetector.isTSConfigEnabled()) {
    typeScriptConfig = {
      outDir: '.tmp',
      tsconfig: {
        tsconfig: 'app/tsconfig.json',
        ignoreFiles: true,
        ignoreSettings: false,
        overwriteFilesGlob: false,
        updateFiles: true,
        passThrough: false
      }
    };
  } else {
    typeScriptConfig = {
      src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts',
        'app/test/**/*.ts', 'test/**/*.ts'
      ],
      reference: 'reference.ts',
      outDir: '.tmp/'
    };
  }

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
      options: {
        target: 'es5',
        sourceMap: false,
        declaration: createDeclaration,
        removeComments: false,
        experimentalDecorators: true,
        module: 'commonjs',
        fast: 'never'
      },
      build: typeScriptConfig
    }
  };
};
