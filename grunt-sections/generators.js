'use strict';

var path = require('path');

module.exports = function (grunt, options) {
  grunt.registerMultiTask('webfontIfEnabled', function () {
    if (options.svgFontName && this.files.length) {
      grunt.task.run('webfont');
    } else {
      console.log('Task disabled');
    }
  });

  return {
    petriExperiments: {
      all: [
        'app/petri-experiments/*.json',
        'app/bower_components/*/dist/petri-experiments.json'
      ],
      options: {
        json: 'dist/petri-experiments.json',
        js: '.tmp/petri-experiments.js'
      }
    },
    manifestPackager: {
      all: {
        files: [{
          expand: true,
          cwd: 'app',
          src: '*.manifest.json',
          dest: '.tmp/manifests',
          ext: '.html',
          extDot: 'last'
        }]
      }
    },
    translations: {
      server: {
        options: {
          moduleName: options.translationsModule,
          hasPreferredLanguage: false /* temporary until we move to angular-translate 2.0 */
        },
        files: [{
          expand: true,
          cwd: 'app/scripts/locale',
          src: '*/*.{json,new_json}',
          flatten: true,
          dest: '.tmp/scripts/locale',
          ext: '.js'
        }, {
          expand: true,
          cwd: 'app/scripts/locale',
          src: '*.{json,new_json}',
          dest: '.tmp/scripts/locale',
          ext: '.js'
        }, {
          expand: true,
          cwd: 'app/scripts',
          src: '*/**/locale/*.{json,new_json}',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      }
    },
    webfontIfEnabled: {
      all: {
        files: [{
          src: 'app/images/svg-font-icons/*.svg'
        }]
      }
    },
    webfont: {
      icons: {
        src: 'app/images/svg-font-icons/*.svg',
        dest: '.tmp/styles/svg-font',
        destCss: '.tmp/styles',
        options: {
          htmlDemo: false,
          stylesheet: 'scss',
          engine: 'node',
          hashes: false,
          font: options.svgFontName + '-svg-font-icons',
          template: path.join(__dirname, '../webfont-css-generator-template.css'), /* Custom template is a copy-paste of 'bootstrap' template + including 'bem' general class so it will be easily used with @mixins */
          templateOptions: {
            baseClass: options.svgFontName + '-svg-font-icons',
            classPrefix: options.svgFontName + '-svg-font-icons-',
            codePrefix: '',
            codeSuffix: ''
          }
        }
      }
    }
  };
};
