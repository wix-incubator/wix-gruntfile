'use strict';

module.exports = function (grunt, options) {
  grunt.registerTask('checkIfBower', function () {
    if (!options.bowerComponent) {
      grunt.fail.fatal('not bower component');
    }
  });

  return {
    yeoman: {
      api: 'http://' + options.subdomain + '.' + options.staging + '.wixpress.com/_api/',
      partials: 'http://' + options.subdomain + '.' + options.staging + '.wixpress.com/_partials/',
      local: options.protocol + '://local.' + options.staging + '.wixpress.com:<%= connect.options.port %>/' + options.page
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    release: {
      options: {
        file: 'bower.json',
        npm: false
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['**/*.vm', 'scripts/**/locale/**/*.js', '*.html', '{views,modules}/**/*.html'],
          dest: 'dist'
        }, {
          expand: true,
          cwd: '.tmp',
          src: ['*.js', 'scripts/**/locale/**/*.js', '*.html', '{views,modules}/**/*.html', 'styles/svg-font/*'],
          dest: 'dist'
        }, {
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'bower_components/**/*',
            'images/**/*.{webp,ico,svg}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/scripts/',
          src: ['**/*.js'],
          dest: 'dist/_debug/scripts'
        }, {
          expand: true,
          cwd: 'app/scripts/',
          src: ['**/*.js'],
          dest: 'dist/_debug/scripts'
        }, {
          expand: true,
          cwd: '.tmp/images/',
          src: ['**/*.js'],
          dest: 'dist/_debug/images'
        }, {
          expand: true,
          cwd: 'app/images/',
          src: ['**/*.js'],
          dest: 'dist/_debug/images'
        }, {
          expand: true,
          cwd: '.tmp/styles/',
          src: ['**/*.css'],
          dest: 'dist/_debug/styles'
        }, {
          expand: true,
          cwd: 'app/styles/',
          src: ['**/*.css'],
          dest: 'dist/_debug/styles'
        }]
      },
      styles: {
        expand: true,
        cwd: 'app',
        dest: '.tmp',
        src: '{styles,modules}/**/*.css'
      },
      vm: {
        files: [{
          expand: true,
          cwd: '.tmp',
          dest: '.tmp',
          src: '*.js.vm',
          ext: '.js'
        }, {
          expand: true,
          cwd: '.tmp',
          dest: '.tmp',
          src: '**/*.vm',
          ext: '.html'
        }]
      }
    }
  };
};
