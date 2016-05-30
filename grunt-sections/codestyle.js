'use strict';

var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
  var tslint = 'newer:tslint';

  grunt.registerTask('force-jshint', function () {
    grunt.task.run('ignore-code-style-checks');
  });

  grunt.registerTask('ignore-code-style-checks', function () {
    tslint = 'force:newer:tslint';
    ['jshint', 'jscs', 'scsslint', 'tslint', 'eslint'].forEach(function (section) {
      var config = grunt.config(section);
      config.options.force = true;
      grunt.config(section, config);
    });
  });

  grunt.registerTask('lint', ['newer-clean', 'jsstyleIfEnabled', 'scssstyleIfEnabled']);

  function isTaskForced(name) {
    return (grunt.config(name).options || {}).force || false;
  }

  grunt.registerTask('jsstyleIfEnabled', function () {
    if (featureDetector.isEslintEnabled()) {
      grunt.task.run(isTaskForced('eslint') ? 'force:newer:eslint' : 'newer:eslint');
    } else {
      if (featureDetector.isJshintEnabled()) {
        grunt.task.run('newer:jshint');
      }
      if (featureDetector.isJscsEnabled()) {
        grunt.task.run('newer:jscs');
      }
    }
    if (featureDetector.isTslintEnabled()) {
      var config = grunt.config('tslint');
      config.options.configuration = grunt.file.readJSON('tslint.json');
      if (config.options.configuration.rulesDirectory) {
        // copy the rules directory to the options (This is how the Linter works)
        config.options.rulesDirectory = config.options.configuration.rulesDirectory;
      }
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
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      all: {
        files: [{
          src: [
            'Gruntfile.js',
            'app/{scripts,modules,test}/**/*.js',
            '!app/scripts/lib/**/*.js',
            'test/{spec,mock,e2e}/**/*.js',
          ]
        }]
      }
    },
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
