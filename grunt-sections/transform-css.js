'use strict';

module.exports = function (grunt, options) {
  return {
    autoprefixer: {
      options: {
        browsers: ['last 3 versions']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '{styles,modules}/**/*.css',
          dest: '.tmp'
        }]
      }
    },
    compass: {
      options: {
        bundleExec: true,
        sassDir: 'app/' + (options.useModulesStructure ? 'modules' : 'styles'),
        cssDir: '.tmp/' + (options.useModulesStructure ? 'modules' : 'styles'),
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: 'app/images',
        javascriptsDir: 'app/scripts',
        fontsDir: 'app/fonts',
        importPath: 'app/bower_components',
        httpImagesPath: '../images',
        httpGeneratedImagesPath: '../images/generated',
        httpFontsPath: 'fonts',
        relativeAssets: false
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    }
  };
};