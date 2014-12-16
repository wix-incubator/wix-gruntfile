'use strict';

var shell = require('shelljs');

module.exports = function (grunt, options) {
  grunt.registerTask('releaseIfBower', function () {
    if (options.bowerComponent) {
      if (shell.exec('git add dist').code === 0) {
        grunt.task.run('release');
      }
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