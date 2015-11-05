'use strict';

module.exports = function (grunt, options) {

  grunt.registerTask('autoprefixerIfEnabled', function () {
    if (options.autoprefixer) {
      grunt.task.run(['replace:wixStyleToBrackets', 'newer:autoprefixer', 'replace:wixStyleToCurlies']);
    }
  });

  grunt.registerTask('mkdirTmpStyles', function () {
    grunt.file.mkdir('.tmp/styles');
  });

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
        importPath: ['app/bower_components', '.tmp/styles/'],
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
