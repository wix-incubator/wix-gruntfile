'use strict';

var featureDetector = require('../feature-detector');

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (featureDetector.isTypescriptEnabled()) {
      grunt.task.run('tsstyleIfEnabled');
      grunt.task.run('ts');
    }
  });

  grunt.registerTask('traceurIfEnabled', function () {
    if (featureDetector.isTraceurEnabled()) {
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
        src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts', '!app/modules/**/*.test.ts'],
        outDir: '.tmp/' + (options.useModulesStructure ? 'modules' : 'scripts'),
        reference: 'app/scripts/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: false,
          module: 'commonjs'
        }
      },
      test: {
        src: [options.useModulesStructure ? 'app/modules/**/*.test.ts' : 'test/**/*.ts'],
        outDir: '.tmp/test/',
        reference: 'test/reference.ts',
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
