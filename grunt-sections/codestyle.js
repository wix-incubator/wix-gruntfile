'use strict';

var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
  grunt.registerTask('force-jshint', function () {
    grunt.task.run('ignore-code-style-checks');
  });

  grunt.registerTask('ignore-code-style-checks', function () {
    ['jshint', 'jscs', 'scsslint', 'tslint'].forEach(function (section) {
      var config = grunt.config(section);
      config.options.force = true;
      grunt.config(section, config);
    });
  });

  grunt.registerTask('lint', ['jsstyleIfEnabled', 'scssstyleIfEnabled']);

  grunt.registerTask('jsstyleIfEnabled', function () {
    if (featureDetector.isJshintEnabled()) {
      grunt.task.run('newer:jshint');
    }
    if (featureDetector.isJscsEnabled()) {
      grunt.task.run('newer:jscs');
    }
    if (featureDetector.isTslintEnabled()) {
      var config = grunt.config('tslint');
      config.options.configuration = grunt.file.readJSON('tslint.json');
      grunt.config('tslint', config);
      grunt.task.run('newer:tslint');
    }
  });

  grunt.registerTask('scssstyleIfEnabled', function () {
    if (featureDetector.isScssStyleEnabled()) {
      grunt.task.run('newer:scsslint');
    }
  });

  return {
    tslint: {
      options: {
      },
      all: {
        files: [{
          src: [
            'app/{scripts,modules}/**/*.ts',
            'test/{spec,mock,e2e}/**/*.ts',
            '!app/scripts/typings/**/*.ts',
            '!app/scripts/reference.ts'
          ]
        }]
      }
    },
    jshint: {
      options: {
        force: false,
        reporter: require('jshint-stylish')
      },
      scripts: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: [{
          src: [
            'Gruntfile.js',
            'app/{scripts,modules}/**/*.js',
            '!app/modules/**/*.test.js',
            '!app/scripts/lib/**/*.js'
          ]
        }]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: [{
          src: ['test/{spec,mock,e2e}/**/*.js', 'app/modules/**/*.test.js']
        }]
      }
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      all: {
        files: [{
          src: [
            'Gruntfile.js',
            'app/{scripts,modules}/**/*.js',
            '!app/scripts/lib/**/*.js',
            'test/{spec,mock,e2e}/**/*.js'
          ]
        }]
      }
    },
    scsslint: {
      styles: {
        files: [{
          src: 'app/{styles,modules}/**/*.scss'
        }]
      },
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        compact: true,
        colorizeOutput: true
      }
    }
  };
};
