'use strict';

module.exports = function (grunt) {
  return {
    addMigration: function () {
      function makeReplacements() {
        var modules = ['angular', 'angular-mocks', 'angular-sanitize', 'angular-animate',
          'angular-route', 'angular-resource'
        ];
        var bowerPrefix = 'bower_components';
        var cdnPath = 'https://static.parastorage.com/services/third-party/angularjs/1.4.7';
        return modules.map(function (moduleName) {
          var fileName = moduleName + '.js';
          return {
            from: [bowerPrefix, moduleName, fileName].join('/'),
            to: [cdnPath, fileName].join('/')
          };
        });
      }

      grunt.modifyTask('replace', {
        angular: {
          src: ['dist/*.html'],
          dest: 'dist-angular/',
          replacements: makeReplacements()
        }
      });

      grunt.modifyTask('protractor', {
        teamcitySecondary: {
          options: {
            configFile: 'node_modules/wix-gruntfile/protractor-teamcity-conf.js',
            baseUrl: 'http://localhost:9877'
          }
        }
      });

      grunt.hookTask('build').push('replace:angular');
      grunt.hookTask('build').push('protractor:normal');
      grunt.hookTask('test:ci').push('replace:angular');
      grunt.hookTask('test:ci').push('connect:testSecondaryServer');
      grunt.hookTask('test:ci').push('protractor:teamcitySecondary');
    }
  };
};
