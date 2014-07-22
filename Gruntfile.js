'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt, options) {

  var extend = require('util')._extend;
  var protractorUtil = require('./grunt-protractor');

  Array.prototype.replace = function (j, k) {
    this.splice(Math.min(j, k), 0, this.splice(Math.max(j, k), 1)[0]);
    return this;
  };

  options = extend({
    protocol: 'http',
    staging: 'pizza',
    port: 9000,
    livereload: 35729,
    translationsModule: 'wixAppTranslations',
    unitTestFiles: [],
    karmaTestFiles: null,
    appFirst: true,
    page: '',
    protractor: false,
    proxies: {},
    beforeProxies: {},
    bowerComponent: false
  }, options);

  if (!options.preloadModule) {
    options.preloadModule = options.translationsModule || 'wixAppPreload';
  }

  var unitTestWildCards = [
    '{app,.tmp}/*.js',
    '{app,.tmp}/scripts/*.js', //do not move - position 1
    '{app,.tmp}/scripts/*/**/*.js', //do not move - position 2
    '{,.tmp/}test/**/*.js',
    '{app,.tmp}/views/**/*.html'
  ];

  if (!options.appFirst) {
    unitTestWildCards.replace(1, 2);
  }

  options.unitTestFiles = options.karmaTestFiles || options.unitTestFiles.concat(unitTestWildCards);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt, {config: require('./package.json')});

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var url = require('url');
  var path = require('path');
  var proxyMiddleware = require('proxy-middleware');

  function proxyFolder(src, dest) {
    var proxyOptions = url.parse(grunt.template.process(dest));
    proxyOptions.route = src;
    return proxyMiddleware(proxyOptions);
  }

  function getProxies(proxyType) {
    var arr = [];
    for (var key in options[proxyType]) {
      if (typeof(options[proxyType][key]) === 'string') {
        arr.push(proxyFolder(key, options[proxyType][key]));
      } else {
        if (key[0] === '_') {
          arr.unshift(options[proxyType][key]);
        } else {
          arr.push(options[proxyType][key]);
        }
      }
    }
    return arr;
  }

  function mountFolder(connect, dir, maxage) {
    return connect.static(require('path').resolve(grunt.template.process(dir)), { maxAge: maxage || 0 });
  }

  function arrayToObj(arr) {
    return typeof(arr.reduce) === 'function' ? arr.reduce(function (obj, replace) {
      if (typeof(replace.from) === 'string') {
        obj[replace.from] = replace.to;
      } else {
        obj.$$preserve.push(replace);
      }
      return obj;
    }, {$$preserve: []}) : arr;
  }

  function objToArray(obj) {
    var arr = obj.$$preserve || [];
    for (var key in obj) {
      if (key !== '$$preserve') {
        arr.push({from: key, to: obj[key]});
      }
    }
    return arr;
  }

  function loadReplacements() {
    var preserve, replacements = {};
    try {
      extend(replacements, arrayToObj(require(process.cwd() + '/replace.conf.js')));
      preserve = replacements.$$preserve;
      extend(replacements, arrayToObj(require(process.cwd() + '/replace.private.conf.js')));
      replacements.$$preserve = preserve.concat(replacements.$$preserve);
    } catch (e) {

    }
    return objToArray(replacements);
  }

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      api: 'http://www.' + options.staging + '.wixpress.com/_api/',
      partials: 'http://www.' + options.staging + '.wixpress.com/_partials/',
      local: options.protocol + '://local.' + options.staging + '.wixpress.com:<%= connect.options.port %>/' + options.page
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        livereload: options.livereload,
        nospawn: true
      },
      haml: {
        files: ['app/{,views/**/}*.haml'],
        tasks: ['haml', 'karma:unit:run']
      },
      html: {
        files: ['app/{,views/**/}*.html'],
        tasks: ['karma:unit:run']
      },
      replace: {
        files: ['app/**/*.vm'],
        tasks: ['replace', 'copy:vm']
      },
      replaceConf: {
        files: ['replace.conf.js', 'replace.private.conf.js'],
        tasks: ['replace', 'copy:vm'],
        options: {reload: true}
      },
      locale: {
        files: ['app/scripts/**/locale/**/*.*'],
        tasks: ['jsonAngularTranslate', 'jshint', 'karma:unit:run']
      },
      test: {
        files: [
          'app/scripts/**/*.js',
          'test/**/*.js'
        ],
        tasks: ['jshint', 'karma:unit:run']
      },
      ts: {
        files: ['{test,app/scripts}/**/*.ts'],
        tasks: ['ts', 'jshint', 'karma:unit:run']
      },
      compass: {
        files: ['app/styles/**/*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['app/styles/**/*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          'app/**/*.html',
          'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    ts: {
      build: {
        src: ['app/scripts/**/*.ts'],
        outDir: '.tmp/scripts/',
        reference: 'app/scripts/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: true
        }
      },
      test: {
        src: ['test/**/*.ts'],
        outDir: '.tmp/test/',
        reference: 'test/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: true
        }
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: options.port,
        // Change this to 'localhost' to block access to the server from outside.
        hostname: '0.0.0.0',
        livereload: options.livereload
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
            return getProxies('beforeProxies').concat([
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test'),
              mountFolder(connect, 'app'),
              proxyFolder('/wcservices/', '<%= yeoman.api %>'.replace('_api', 'wcservices')),
              proxyFolder('/_api/', '<%= yeoman.api %>'),
              proxyFolder('/_partials/', '<%= yeoman.partials %>'),
              proxyFolder('/_livereload/', 'http://localhost:<%= watch.options.livereload %>/'),
              connect.urlencoded()
            ]).concat(getProxies('proxies'));
          }
        }
      },
      test: {
        options: {
          port: 9000,
          middleware: function (connect) {
            return getProxies('beforeProxies').concat([
              connect.compress(),
              mountFolder(connect, 'test', 86400000),
              mountFolder(connect, 'dist', 86400000),
              connect.urlencoded()
            ]).concat(getProxies('proxies'));
          }
        }
      },
      dist: {
        options: {
          open: '<%= yeoman.local %>',
          middleware: function (connect) {
            return getProxies('beforeProxies').concat([
              mountFolder(connect, 'test'),
              mountFolder(connect, 'dist'),
              proxyFolder('/_api/', '<%= yeoman.api %>'),
              proxyFolder('/_partials/', '<%= yeoman.partials %>'),
              connect.urlencoded()
            ]).concat(getProxies('proxies'));
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        force: false,
        reporter: require('jshint-stylish')
      },
      scripts: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [
            'Gruntfile.js',
            'app/scripts/**/*.js',
            '!app/scripts/lib/**/*.js'
          ]
        }
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: {
          src: ['test/{spec,mock}/**/*.js']
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
          src: '**/*.css',
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
          src: '**/*.vm',
          dest: 'dist'
        }]
      }
    },

    processTags: {
      dist: {
        options: {
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '**/*.vm',
          dest: 'dist'
        }]
      }
    },

    // The following *-min tasks produce minified files in the dist folder
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

    ngtemplates:  {
      app: {
        files : [{
          cwd: '.tmp',
          src: 'views/**/*.preload.html',
          dest: '.tmp/templates.js',
          options: {
            module: options.preloadModule,
            usemin: 'scripts/scripts.js'
          }
        }, {
          cwd: 'app',
          src: 'views/**/*.preload.html',
          dest: '.tmp/templates.js',
          options: {
            module: options.preloadModule,
            usemin: 'scripts/scripts.js'
          }
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
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

    // Replace Google CDN references
    cdnify: {
      options: {
        cdn: require('wix-cdn-data')[options.protocol]()
      },
      dist: {
        html: ['dist/*.html', 'dist/**/*.vm']
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

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['**/*.vm', 'scripts/**/locale/**/*.js', '*.html', 'views/**/*.html'],
          dest: 'dist'
        }, {
          expand: true,
          cwd: '.tmp',
          src: ['*.js', 'scripts/**/locale/**/*.js', '*.html', 'views/**/*.html'],
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
        cwd: 'app/styles',
        dest: '.tmp/styles/',
        src: '**/*.css'
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
        //'svgmin',
        'copy:dist'
      ]
    },

    uglify: {
      options: {
        mangle: !options.bowerComponent,
        compress: !options.bowerComponent,
        beautify: options.bowerComponent
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

    // Test settings
    karma: {
      options: {
        basePath: process.cwd(),
        ngHtml2JsPreprocessor: {
          stripPrefix: '(app|.tmp)/',
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
          preprocessors: {
            '{app,.tmp}/**/*.html': 'ng-html2js',
            '{app,.tmp}/images/**/*.svg': 'ng-html2js'
          },
          singleRun: false,
          background: true
        }
      }
    },

    protractor: {
      normal: 'protractor-conf.js',
      teamcity: path.join(__dirname, 'protractor-teamcity-conf.js')
    },

    replace: {
      dist: {
        src: ['app/**/*.vm'],
        dest: '.tmp/',
        replacements: loadReplacements()
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
          src: '{,views/**/}*.haml',
          dest: '.tmp',
          ext: '.html',
          extDot: 'last'
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

  grunt.registerTask('forceJshint', function () {
    var jshint = grunt.config('jshint');
    jshint.options.force = true;
    grunt.config('jshint', jshint);
  });

  grunt.registerTask('enableCoverage', function () {
    var karma = grunt.config('karma');
    delete karma.unit.options.preprocessors;
    grunt.config('karma', karma);
  });

  grunt.registerTask('webdriver', 'Update webdriver', function () {
    protractorUtil.updateWebdriver.call(protractorUtil, this.async());
  });

  grunt.registerMultiTask('protractor', 'Run Protractor integration tests', function () {
    protractorUtil.startProtractor.call(protractorUtil, this.data, this.async());
  });

  if (options.protractor) {
    grunt.registerTask('e2e:normal', ['webdriver', 'protractor:normal']);
    grunt.registerTask('e2e:teamcity', ['protractor:teamcity']);
  } else {
    grunt.registerTask('e2e:normal', ['karma:e2e']);
    grunt.registerTask('e2e:teamcity', ['karma:e2eTeamcity']);
  }

  grunt.registerTask('pre-build', function () {
    grunt.task.run([
      'ts',
      'jshint',
      'concurrent:server',
      'autoprefixer',
      'copy:vm'
    ]);
  });

  grunt.registerTask('package', function () {
    grunt.task.run([
      'useminPrepare',
      'ngtemplates',
      'concat',
      'cssmin',
      'ngAnnotate',
      'uglify',
      'concurrent:dist',
      'cdnify',
      'usemin',
      'velocityDebug',
      'processTags'
    ]);
  });

  grunt.registerTask('serve', [
    'forceJshint',
    'karma:unit',
    'clean:server',
    'pre-build',
    'karma:unit:run',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('serve:dist', [
    'forceJshint',
    'connect:dist:keepalive'
  ]);

  grunt.registerTask('serve:coverage', [
    'enableCoverage',
    'serve'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'pre-build',
    'karma:single'
  ]);

  grunt.registerTask('test:ci', [
    'connect:test',
    'e2e:teamcity'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'test',
    'package',
    'connect:test',
    'e2e:normal'
  ]);

  grunt.registerTask('build:ci', [
    'clean:dist',
    'pre-build',
    'karma:teamcity',
    'package'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });

};
