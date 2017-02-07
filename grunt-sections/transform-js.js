'use strict';

var path = require('path');
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
    if (grunt.option('enableCoverage')){
      grunt.task.run('copy:ts');
    }
    grunt.task.run('sourceMapBasename');
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

  grunt.registerMultiTask('sourceMapBasename', function () {
    this.filesSrc.forEach(function (source) {
      var jsMap = grunt.file.readJSON(source);
      jsMap.sources = jsMap.sources.map(function (relativePath) {
        return path.basename(relativePath);
      });
      grunt.file.write(source, JSON.stringify(jsMap));
    });
  });

  grunt.registerTask('babelIfEnabled', 'Transpile ES6 code', function () {
    if (grunt.task.exists('babel') && options.babelEnabled) {
      grunt.task.run('newer:babel');
    }
  });

  var createDeclaration = options.bowerComponent;

  var typeScriptConfig;
  if (featureDetector.isTSConfigEnabled()) {
    var tsConfigJsonPath = 'app/tsconfig.json';
    var tsConfigJson = grunt.file.readJSON(tsConfigJsonPath);
    var isUsingTS20Include = !tsConfigJson.filesGlob && !!tsConfigJson.include;

    typeScriptConfig = {
      outDir: '.tmp',
      tsconfig: isUsingTS20Include ? {
        tsconfig: 'app/',
        passThrough: true
      } : {
        tsconfig: tsConfigJsonPath,
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
    typescript: {
      options: {
        target: 'es5',
        sourceMap: true,
        declaration: createDeclaration,
        removeComments: false,
        experimentalDecorators: true,
        module: 'commonjs',
        fast: 'never',
        stripInternal: true,
        compiler: './node_modules/typescript/bin/tsc'
      },
      build: typeScriptConfig
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      build: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['{modules,scripts}/**/*.js'],
          dest: '.tmp'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test',
          src: ['**/*.js'],
          dest: '.tmp/test'
        },
        {
          expand: true,
          cwd: 'app',
          src: ['test/**/*.js'],
          dest: '.tmp'
        }]
      }
    }
  };
};
