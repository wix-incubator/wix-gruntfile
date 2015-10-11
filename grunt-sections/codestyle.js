'use strict';

var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
  var tslint = 'newer:tslint';

  grunt.registerTask('force-jshint', function () {
    grunt.task.run('ignore-code-style-checks');
  });

  grunt.registerTask('ignore-code-style-checks', function () {
    tslint = 'force:newer:tslint';
    ['jshint', 'jscs', 'scsslint', 'tslint'].forEach(function (section) {
      var config = grunt.config(section);
      config.options.force = true;
      grunt.config(section, config);
    });
  });

  grunt.registerTask('lint', ['newer-clean', 'jsstyleIfEnabled', 'scssstyleIfEnabled']);

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
      grunt.task.run(tslint);
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
            'app/{scripts,modules,test}/**/*.ts',
            'test/{spec,mock,e2e}/**/*.ts',
            '!app/{scripts,modules}/typings/**/*.ts',
            '!app/{scripts,modules,test}/reference.ts'
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
            '!app/test/**/*.js',
            '!app/scripts/lib/**/*.js'
          ]
        }]
      },
      test: {
        options: {
          jshintrc: featureDetector.isTestInAppFolderEnabled() ? 'app/test/.jshintrc' : 'test/.jshintrc'
        },
        files: [{
          src: ['test/{spec,mock,e2e}/**/*.js', 'app/modules/**/*.test.js', 'app/test/{spec,mock,e2e}/**/*.js']
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
            'app/{scripts,modules,test}/**/*.js',
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
