'use strict';

module.exports = function (grunt, options) {
  return {
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/**/}*.{png,jpg,jpeg,gif}',
          dest: 'dist/images'
        }]
      },
      generated: {
        files: [{
          expand: true,
          cwd: '.tmp/images',
          src: '{,*/**/}*.{png,jpg,jpeg}',
          dest: 'dist/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*.svg',
          dest: 'dist/images'
        }]
      }
    },
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/concat',
          src: '**/*.js',
          dest: 'dist/concat'
        }]
      }
    },
    uglify: {
      options: {
        mangle: !options.bowerComponent,
        compress: options.bowerComponent ? false : {},
        beautify: options.bowerComponent,
        sourceMap: true
      },
      locale: {
        files: [{
          expand: true,
          cwd: 'dist/scripts',
          src: '**/locale/**/*.js',
          dest: 'dist/scripts'
        }]
      }
    },
    cssmin: {
      options: {
        processImport: false,
        rebase: false
      }
    }
  };
};
