'use strict';

var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
  grunt.registerTask('force-jshint', function () {
    grunt.task.run('ignore-code-style-checks');
  });

  grunt.registerTask('ignore-code-style-checks', function () {
    ['jshint', 'jscs', 'scsslint'].forEach(function (section) {
      var config = grunt.config(section);
      config.options.force = true;
      grunt.config(section, config);
    });
  });

  grunt.registerTask('jsstyleIfEnabled', function () {
    if (featureDetector.isJshintEnabled()) {
      grunt.task.run('jshint');
    }
    if (featureDetector.isJscsEnabled()) {
      grunt.task.run('jscs');
    }
  });

  grunt.registerTask('scssstyleIfEnabled', function () {
    if (featureDetector.isScssStyleEnabled()) {
      grunt.task.run('scsslint');
    }
  });

  return {
    jshint: {
      options: {
        force: false,
        reporter: require('jshint-stylish')
      },
      scripts: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [
            'Gruntfile.js',
            'app/{scripts,modules}/**/*.js',
            '!app/modules/**/*.test.js',
            '!app/scripts/lib/**/*.js'
          ]
        }
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: {
          src: ['test/{spec,mock,e2e}/**/*.js', 'app/modules/**/*.test.js']
        }
      }
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      files: {
        src: [
          'Gruntfile.js',
          'app/{scripts,modules}/**/*.js',
          '!app/scripts/lib/**/*.js',
          'test/{spec,mock,e2e}/**/*.js'
        ]
      }
    },
    scsslint: {
      styles: [
        'app/{styles,modules}/**/*.scss'
      ],
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        compact: true,
        colorizeOutput: true
      }
    }
  };
};