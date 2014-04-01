'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt, options) {

  var extend = require('util')._extend;

  options = extend({
    protocol: 'http',
    staging: 'pizza',
    port: 9000,
    preloadModule: 'wixAppPreload',
    translationsModule: 'wixAppTranslations',
    unitTestFiles: []
  }, options);

  options.unitTestFiles = options.unitTestFiles.concat([
    '{app,.tmp}/*.js',
    '{app,.tmp}/scripts/*.js',
    '{app,.tmp}/scripts/**/*.js',
    '{,.tmp/}test/**/*.js',
    '{app,.tmp}/views/*.preload.html'
  ]);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt, {config: require('./package.json')});

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var url = require('url');
  var path = require('path');
  var proxyMiddleware = require('proxy-middleware');

  var proxyFolder = function (src, dest) {
    var proxyOptions = url.parse(grunt.template.process(dest));
    proxyOptions.route = src;
    return proxyMiddleware(proxyOptions);
  };

  var mountFolder = function (connect, dir, maxage) {
    return connect.static(require('path').resolve(grunt.template.process(dir)), { maxAge: maxage || 0 });
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      api: 'http://www.' + options.staging + '.wixpress.com/_api/',
      partials: 'http://www.' + options.staging + '.wixpress.com/_partials/',
      local: options.protocol + '://local.' + options.staging + '.wixpress.com:<%= connect.options.port %>'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        livereload: 35729,
        nospawn: true
      },
      haml: {
        files: ['app/{,views/}*.haml'],
        tasks: ['haml']
      },
      replace: {
        files: ['app/*.vm'],
        tasks: ['replace', 'copy:vm']
      },
      locale: {
        files: ['app/scripts/locale/*'],
        tasks: ['jsonAngularTranslate', 'jshint', 'karma:unit:run']
      },
      test: {
        files: [
          'app/scripts/{,*/}*.js',
          'test/**/*.js'
        ],
        tasks: ['jshint', 'karma:unit:run']
      },
      compass: {
        files: ['app/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['app/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          'app/{,*/}*.html',
          'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: options.port,
        // Change this to 'localhost' to block access to the server from outside.
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          protocol: options.protocol,
          key: grunt.file.read(path.join(__dirname, 'server.key')).toString(),
          cert: grunt.file.read(path.join(__dirname, 'server.crt')).toString(),
          ca: grunt.file.read(path.join(__dirname, 'ca.crt')).toString(),
          passphrase: 'grunt',
          open: '<%= yeoman.local %>',
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test'),
              mountFolder(connect, 'app'),
              proxyFolder('/wcservices/', '<%= yeoman.api %>'.replace('_api', 'wcservices')),
              proxyFolder('/_api/', '<%= yeoman.api %>'),
              proxyFolder('/_partials/', '<%= yeoman.partials %>'),
              proxyFolder('/_livereload/', 'http://localhost:<%= watch.options.livereload %>/')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'test', 86400000),
              mountFolder(connect, 'dist', 86400000)
            ];
          }
        }
      },
      dist: {
        options: {
          open: '<%= yeoman.local %>',
          middleware: function (connect) {
            return [
              mountFolder(connect, 'test'),
              mountFolder(connect, 'dist'),
              proxyFolder('/_api/', '<%= yeoman.api %>'),
              proxyFolder('/_partials/', '<%= yeoman.partials %>')
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        force: true,
        reporter: require('jshint-stylish')
      },
      scripts: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [
            'Gruntfile.js',
            'app/scripts/{,*/}*.js',
            '!app/scripts/locale/*.js'
          ]
        }
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: {
          src: ['test/{spec,mock}/{,*/}*.js']
        }
      }
    },

    // Empties folders to start fresh
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

    // Add vendor prefixed styles
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        bundleExec: true,
        sassDir: 'app/styles',
        cssDir: '.tmp/styles',
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
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: 'app/*.{html,vm}',
      options: {
        staging: 'dist',
        dest: 'dist'
      }
    },

    // Performs rewrites based on rev and the useminPrepage configuration
    usemin: {
      html: ['dist/*.{html,vm}'],
      options: {
        assetsDirs: ['dist']
      }
    },

    velocityDebug: {
      dist: {
        options: {
          debug: 'dist/concat',
          prefix: 'concat'
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '*.vm',
          dest: 'dist',
        }]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
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
          src: '{,*/}*.svg',
          dest: 'dist/images'
        }]
      }
    },

    ngtemplates:  {
      app:        {
        cwd: '.tmp',
        src: 'views/**/*.html',
        dest: '.tmp/templates.js',
        options: {
          module: options.preloadModule,
          usemin: 'scripts/scripts.js'
        }
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/concat/scripts',
          src: '*.js',
          dest: 'dist/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      options: {
        cdn: require('wix-cdn-data')[options.protocol]()
      },
      dist: {
        html: ['dist/*.html', 'dist/*.vm']
      }
    },

    jsonAngularTranslate: {
      server: {
        options: {
          moduleName: options.translationsModule,
          hasPreferredLanguage: false /* temporary until we move to angular-translate 2.0 */
        },
        files: [{
          expand: true,
          cwd: 'app/scripts/locale',
          src: '*.{json,new_json}',
          dest: '.tmp/scripts/locale',
          ext: '.js'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['*.vm', 'scripts/locale/*.js', '*.html', 'views/*.html'],
          dest: 'dist'
        }, {
          expand: true,
          cwd: '.tmp',
          src: ['*.js', 'scripts/locale/*.js', '*.html', 'views/*.html'],
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
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: 'app/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
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
          src: '*.vm',
          ext: '.html'
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'haml',
        'compass:dist',
        'replace',
        'copy:styles',
        'jsonAngularTranslate'
      ],
      dist: [
        'imagemin',
        'svgmin',
        'copy:dist'
      ]
    },

    uglify: {
      locale: {
        files: [{
          expand: true,
          cwd: 'dist/scripts',
          src: 'locale/*.js',
          dest: 'dist/scripts'
        }]
      }
    },

    // Test settings
    karma: {
      options: {
        basePath: process.cwd(),
        ngHtml2JsPreprocessor: {
          stripPrefix: '(app|.tmp)',
          moduleName: options.preloadModule
        }
      },
      teamcity: {
        options: {
          configFile: path.join(__dirname, 'karma.conf.js'),
          files: options.unitTestFiles,
          reporters: ['teamcity', 'coverage'],
          coverageReporter: { type : 'teamcity' }
        }
      },
      single: {
        options: {
          configFile: path.join(__dirname, 'karma.conf.js'),
          files: options.unitTestFiles
        }
      },
      e2e: {
        options: {
          configFile: path.join(__dirname, 'karma-e2e.conf.js'),
          proxies: {'/': 'http://localhost:<%= connect.test.options.port %>/'},
          browsers: ['Chrome']
        }
      },
      e2eTeamcity: {
        options: {
          configFile: path.join(__dirname, 'karma-e2e.conf.js'),
          proxies: {'/': 'http://localhost:<%= connect.test.options.port %>/'},
          transports: ['xhr-polling'],
          reporters: ['dots', 'teamcity', 'saucelabs']
        }
      },
      unit: {
        options: {
          configFile: path.join(__dirname, 'karma.conf.js'),
          files: options.unitTestFiles,
          singleRun: false,
          background: true
        }
      }
    },

    replace: {
      dist: {
        src: ['app/*.vm'],
        dest: '.tmp/',
        replacements: require(process.cwd() + '/replace.conf.js')
      }
    },

    haml: {
      dist: {
        options: {
          bundleExec: true
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: '{,views/}*.haml',
          dest: '.tmp',
          ext: '.html'
        }]
      }
    },

    release: {
      options: {
        file: 'bower.json',
        npm: false
      }
    }
  });

  grunt.registerTask('pre-build', [
    'clean:server',
    'jshint',
    'concurrent:server',
    'autoprefixer',
    'copy:vm'
  ]);

  grunt.registerTask('package', [
    'useminPrepare',
    'ngtemplates',
    'concat',
    'cssmin',
    'ngmin',
    'uglify',
    'concurrent:dist',
    'cdnify',
    'usemin',
    'velocityDebug'
  ]);

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['connect:dist:keepalive']);
    }

    grunt.task.run([
      'karma:unit',
      'test',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', function (target) {
    if (target === 'ci') {
      grunt.task.run(['connect:test', 'karma:e2eTeamcity']);
    } else {
      grunt.task.run(['pre-build', 'karma:single']);
    }
  });

  grunt.registerTask('build', function (target) {
    if (target === 'ci') {
      var jshint = grunt.config('jshint');
      jshint.options.force = false;
      grunt.config('jshint', jshint);

      grunt.task.run([
        'clean:dist',
        'pre-build',
        'karma:teamcity',
        'package'
      ]);
    } else {
      grunt.task.run([
        'clean:dist',
        'test',
        'package',
        'connect:test',
        'karma:e2e'
      ]);
    }
  });

  grunt.registerTask('default', ['build']);

};
