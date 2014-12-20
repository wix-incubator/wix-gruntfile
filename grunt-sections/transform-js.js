'use strict';

module.exports = function (grunt, options) {
  grunt.registerTask('typescriptIfEnabled', function () {
    if (grunt.file.expand(process.cwd() + '/app/scripts/*.ts').length) {
      grunt.task.run('ts');
    }
  });

  grunt.registerTask('traceurIfEnabled', function () {
    if (grunt.file.expand(process.cwd() + '/app/scripts/*.es6').length) {
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
          dest: '.tmp'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test',
          src: ['**/*.es6'],
          dest: '.tmp/test'
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
          removeComments: true,
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
          removeComments: true,
          module: 'commonjs'
        }
      }
    }
  };
};