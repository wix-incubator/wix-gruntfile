'use strict';

module.exports = function (grunt) {
  return {
    addMigration: function () {
      function makeReplacements() {
        var modules = ['angular', 'angular-mocks', 'angular-sanitize', 'angular-animate',
          'angular-route'
        ];
        var bowerPrefix = 'bower_components';
        var cdnPath = 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.4';
        return modules.map(function (moduleName) {
          var fileName = moduleName + '.js';
          return {
            from: [bowerPrefix, moduleName, fileName].join('/'),
            to: [cdnPath, fileName].join('/')
          };
        });
      }

      grunt.modifyTask('copy', {
        angular: {
          files: [{
            expand: true,
            cwd: 'dist',
            src: '**/*',
            dest: 'dist-angular'
          }]
        }
      });

      grunt.modifyTask('replace', {
        angular: {
          src: ['dist-angular/*.html'],
          overwrite: true,
          replacements: makeReplacements()
        }
      });

      grunt.modifyTask('connect', {
        angular: {
          options: {
            port: 9009,
            base: ['test', 'dist-angular']
          }
        }
      });

      grunt.modifyTask('protractor', {
        angular: {
          options: {
            configFile: 'protractor-conf.js',
            baseUrl: 'http://localhost:9009'
          }
        },
        angularTeamcity: {
          options: {
            configFile: 'node_modules/wix-gruntfile/protractor-teamcity-conf.js',
            baseUrl: 'http://localhost:9009'
          }
        }
      });

      grunt.hookTask('build').push('copy:angular');
      grunt.hookTask('build').push('replace:angular');
      grunt.hookTask('build').push('connect:angular');
      grunt.hookTask('build').push('protractor:angular');

      grunt.hookTask('build:ci').push('copy:angular');
      grunt.hookTask('build:ci').push('replace:angular');
      grunt.hookTask('test:ci').push('connect:angular');
      grunt.hookTask('test:ci').push('protractor:angularTeamcity');
    }
  };
};
