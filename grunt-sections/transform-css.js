'use strict';

module.exports = function (grunt, options) {
  var sassAssetFunctions = require('node-sass-asset-functions');

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
        browsers: ['last 3 versions', 'ie >= 10', 'Safari >= 8']
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
        specify: (options.useNodeSass) ? ('app/' + (options.useModulesStructure ? 'modules' : 'styles') + '/**/*.compass.scss') : undefined,
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
    },
    sass: {
      dist: {
        cwd: 'app',
        src: [(options.useModulesStructure ? 'modules' : 'styles') + '/**/*.scss', '!' + (options.useModulesStructure ? 'modules' : 'styles') + '/**/*.compass.scss'],
        dest: '.tmp',
        expand: true,
        ext: '.css',
        options: {
          outputStyle: 'compact',
          precision: 5
        }
      },
      options: {
        includePaths: ['app/bower_components', '.tmp/styles', 'app/styles', 'node_modules'],
        sourceComments: false,
        functions: sassAssetFunctions({
          images_path: 'app/images',
          fonts_path: 'app/fonts',
          http_images_path: '../images/generated',
          http_fonts_path: 'fonts'
        })
      }
    }
  };
};
