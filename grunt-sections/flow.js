'use strict';

var fs = require('fs');
var semver = require('semver');
var shell = require('shelljs');

module.exports = function (grunt, options) {
  grunt.registerTask('checkIfBower', function () {
    if (!options.bowerComponent) {
      grunt.fail.fatal('not bower component');
    }
  });

  if (grunt.task.exists('release') && !grunt.task.exists('realRelease')) {
    grunt.renameTask('release', 'realRelease');
    grunt.registerTask('release', function (type) {
      var result = shell.exec('git show origin/bower-component:bower.json', {silent: true});
      if (result.code === 0) {
        var bowerJson = require(process.cwd() + '/bower.json');
        var branchVersion = JSON.parse(result.output).version;
        var currentVersion = bowerJson.version;
        grunt.log.ok('branch:', branchVersion);
        grunt.log.ok('me:', currentVersion);
        if (semver.gt(branchVersion, currentVersion)) {
          bowerJson.version = branchVersion;
          fs.writeFileSync(process.cwd() + '/bower.json', JSON.stringify(bowerJson, null, 2));
          grunt.log.ok('now:', branchVersion);
        }
      }
      grunt.config('realRelease', grunt.config('release'));
      grunt.task.run(type ? 'realRelease:' + type : 'realRelease');
    });
  }

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
      ts: ['.tmp/test', '.tmp/scripts/*', '!.tmp/scripts/locale', '.tmp/templates.*.js'],
      server: '.tmp',
      index: '.tmp/*.{vm,html}'
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
          src: ['**/*.vm', 'scripts/**/locale/**/*.js', '*.html', '{views,modules}/**/*.html', '*.manifest.json'],
          dest: 'dist'
        }, {
          expand: true,
          cwd: '.tmp',
          src: ['*.js', 'scripts/**/locale/**/*.js', '*.html', '{views,modules}/**/*.{html,html.js}', 'styles/svg-font/*'],
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
            'fonts/**/*',
            'videos/**/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/scripts/',
          src: ['**/*.js'],
          dest: 'dist/_debug_scripts'
        }, {
          expand: true,
          cwd: 'app/scripts/',
          src: ['**/*.js'],
          dest: 'dist/_debug_scripts'
        }, {
          expand: true,
          cwd: '.tmp/modules/',
          src: ['**/!(*.test).js'],
          dest: 'dist/_debug_modules'
        }, {
          expand: true,
          cwd: 'app/modules/',
          src: ['**/!(*.test).js'],
          dest: 'dist/_debug_modules'
        }, {
          expand: true,
          cwd: '.tmp/styles/',
          src: ['**/*.css', 'svg-font/*'],
          dest: 'dist/_debug_styles'
        }, {
          expand: true,
          cwd: 'app/styles/',
          src: ['**/*.css', 'svg-font/*'],
          dest: 'dist/_debug_styles'
        }, {
          src: 'node_modules/wix-gruntfile/.sadignore',
          dest: 'dist/.sadignore'
        }]
      },
      styles: {
        expand: true,
        cwd: 'app',
        dest: '.tmp',
        src: '{styles,modules}/**/*.css'
      },
      vmTmp: {
        expand: true,
        cwd: 'app',
        src: '*.vm',
        dest: '.tmp'
      },
      vmDist: {
        expand: true,
        cwd: '.tmp',
        src: '*.{html,vm}',
        dest: 'dist'
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
