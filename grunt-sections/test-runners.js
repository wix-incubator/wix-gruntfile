'use strict';

var path = require('path');
var protractorUtil = require('../grunt-protractor');

module.exports = function (grunt, options) {
  var unitTestWildCards = [
    '{app,.tmp}/*.js',
    '{app,.tmp}/{scripts,modules}/*.js', //do not move - position 1
    '{app,.tmp}/{scripts,modules}/*/**/*.js', //do not move - position 2
    '{,.tmp/}test/**/*.js',
    {pattern: '.tmp/**/*.js.map', included: false},
    {pattern: '.tmp/**/*.ts', included: false},
    '{app,.tmp}/{views,modules}/**/*.html'
  ];

  if (!options.appFirst) {
    unitTestWildCards.replace(1, 2);
  }

  options.karmaConf.files = options.karmaTestFiles || options.karmaConf.files.concat(unitTestWildCards);

  grunt.registerTask('webdriver', 'Update webdriver', function () {
    protractorUtil.updateWebdriver.call(protractorUtil, this.async());
  });

  grunt.registerMultiTask('protractor', 'Run Protractor integration tests', function () {
    protractorUtil.startProtractor.call(protractorUtil, this.options(), this.async());
  });

  grunt.registerTask('enableCoverage', function () {
    grunt.option('enableCoverage', true);

    var karma = grunt.config('karma');
    delete karma.unit.options.preprocessors;
    grunt.config('karma', karma);
  });

  grunt.registerTask('e2eIfEnabled:normal', function () {
    if (options.protractor) {
      grunt.task.run('connect:test');
      grunt.task.run('webdriver');
      grunt.task.run('protractor:normal');
    }
  });

  grunt.registerTask('e2eIfEnabled:teamcity', function () {
    if (options.protractor) {
      grunt.task.run('connect:test');
      grunt.task.run('webdriver');
      grunt.task.run('protractor:teamcity');
    }
  });

  return {
    karma: {
      options: Object.assign({
        configFile: path.join(__dirname, '../karma.conf.js'),
        basePath: process.cwd(),
        ngHtml2JsPreprocessor: {
          stripPrefix: '(app|.tmp)/',
          moduleName: options.preloadModule
        }
      }, options.karmaConf),
      teamcity: {
        options: {
          reporters: ['teamcity', 'coverage'],
          coverageReporter: {type: 'teamcity'}
        }
      },
      single: {
        options: {}
      },
      unit: {
        options: {
          preprocessors: {
            '{app,.tmp}/**/*.html': 'ng-html2js',
            '{app,.tmp}/images/**/*.svg': 'ng-html2js',
            '.tmp/**/*.js': ['sourcemap']
          },
          singleRun: false,
          background: true
        }
      }
    },
    protractor: {
      normal: {
        options: {
          configFile: 'protractor-conf.js',
          baseUrl: 'http://localhost:9876/'
        }
      },
      teamcity: {
        options: {
          configFile: path.join(__dirname, '../protractor-teamcity-conf.js'),
          baseUrl: 'http://localhost:9876/',
          sauceSeleniumAddress: 'localhost:4445/wd/hub'
        }
      }
    }
  };
};
