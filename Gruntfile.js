'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt, options) {

  var fs = require('fs');
  var extend = require('util')._extend;
  var shell = require('shelljs');
  var protractorUtil = require('./grunt-protractor');
  var tasksLists = {};
  Array.prototype.replace = function (j, k) {
    this.splice(Math.min(j, k), 0, this.splice(Math.max(j, k), 1)[0]);
    return this;
  };

  options = extend({
    cdnify: 'http',
    protocol: 'http',
    staging: 'pizza',
    subdomain: 'www',
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
    bowerComponent: false,
    useModulesStructure: false,
    svgFontName: null
  }, options);

  if (!options.preloadModule) {
    options.preloadModule = options.translationsModule || 'wixAppPreload';
  }

  var unitTestWildCards = [
    '{app,.tmp}/*.js',
    '{app,.tmp}/{scripts,modules}/*.js', //do not move - position 1
    '{app,.tmp}/{scripts,modules}/*/**/*.js', //do not move - position 2
    '{,.tmp/}test/**/*.js',
    '{app,.tmp}/{views,modules}/**/*.html'
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

  function registerTask(name, taskList) {
    tasksLists[name] = taskList;
    grunt.registerTask(name, taskList);
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
      api: 'http://' + options.subdomain + '.' + options.staging + '.wixpress.com/_api/',
      partials: 'http://' + options.subdomain + '.' + options.staging + '.wixpress.com/_partials/',
      local: options.protocol + '://local.' + options.staging + '.wixpress.com:<%= connect.options.port %>/' + options.page
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        livereload: options.livereload,
        nospawn: true
      },
      haml: {
        files: ['app/{views,modules}/**/*.haml'],
        tasks: ['haml', 'karma:unit:run']
      },
      svgFont: {
        files: ['app/images/svg-font-icons/*.*'],
        tasks: ['webfont', 'compass:server', 'autoprefixer']
      },
      html: {
        files: ['app/{views,modules}/**/*.html'],
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
        tasks: ['jsonAngularTranslate', 'jsstyle', 'karma:unit:run']
      },
      test: {
        files: [
          'app/{scripts,modules}/**/*.js',
          'test/**/*.js',
          'karma.conf.js',
          '!test/spec/e2e/**/*.js',
          '!test/e2e/**/*.js'
        ],
        tasks: ['jsstyle', 'karma:unit:run']
      },
      ts: {
        files: ['{test,app/scripts,app/modules}/**/*.ts'],
        tasks: ['ts', 'jsstyle', 'karma:unit:run']
      },
      es6: {
        files: ['{test,app/scripts,app/modules}/**/*.es6'],
        tasks: ['traceur', 'jsstyle', 'karma:unit:run']
      },
      compass: {
        files: ['app/{styles,modules}/**/*.{scss,sass}'],
        tasks: ['scsslint', 'compass:server', 'autoprefixer']
      },
      styles: {
        files: ['app/{styles,modules}/**/*.css'],
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

    traceur: {
      options: {
        experimental: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['{modules,scripts}/**/*.es6', '!modules/**/*.test.es6'],
          dest: '.tmp'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test',
          src: ['**/*.es6'],
          dest: '.tmp/test'
        }]
      }
    },

    ts: {
      build: {
        src: ['app/' + (options.useModulesStructure ? 'modules' : 'scripts') + '/**/*.ts', '!app/modules/**/*.test.ts'],
        outDir: '.tmp/' + (options.useModulesStructure ? 'modules' : 'scripts'),
        reference: 'app/scripts/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: true,
          module: 'commonjs'
        }
      },
      test: {
        src: [options.useModulesStructure ? 'app/modules/**/*.test.ts' : 'test/**/*.ts'],
        outDir: '.tmp/test/',
        reference: 'test/reference.ts',
        options: {
          target: 'es5',
          sourceMap: false,
          declaration: false,
          removeComments: true,
          module: 'commonjs'
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
              //connect.compress(),
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
            'app/{scripts,modules}/**/*.js',
            '!app/modules/**/*.test.js',
            '!app/scripts/lib/**/*.js'
          ]
        }
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        files: {
          src: ['test/{spec,mock,e2e}/**/*.js', 'app/modules/**/*.test.js']
        }
      }
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      files: {
        src: [
          'Gruntfile.js',
          'app/{scripts,modules}/**/*.js',
          '!app/scripts/lib/**/*.js',
          'test/{spec,mock,e2e}/**/*.js'
        ]
      }
    },
    scsslint: {
      styles: [
        'app/{styles,modules}/**/*.scss'
      ],
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        compact: true,
        colorizeOutput: true
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

    // Compiles Sass to CSS and generates necessary files if requested
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
          processors: {
            prefix: function (prefix) {
              return function (string) {
                string = string + '';
                if (string.indexOf(prefix) === 0 || string[0] === '$') {
                  return string;
                }
                if (url.parse(string).protocol) {
                  return string;
                }
                return prefix + string;
              };
            }
          }
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

    ngtemplates: {
      app: {
        options: {
          module: options.preloadModule,
          usemin: 'scripts/scripts.js'
        },
        files: [{
          cwd: '.tmp',
          src: '{views,modules}/**/*.preload.html',
          dest: '.tmp/templates.tmp.js'
        }, {
          cwd: 'app',
          src: '{views,modules}/**/*.preload.html',
          dest: '.tmp/templates.app.js'
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
        cdn: require('wix-cdn-data')[options.cdnify]()
      },
      dist: {
        html: ['dist/**/*.vm']
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

    cssmin: {
      options: {
        processImport: false
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
          coverageReporter: { type: 'teamcity' }
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
        src: ['app/*.vm'],
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
          src: '{views,modules}/**/*.haml',
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
          font: options.svgFontName + '-svg-font-icons',
          template: path.join(__dirname, 'webfont-css-generator-template.css'), /* Custom template is a copy-paste of 'bootstrap' template + including 'bem' general class so it will be easily used with @mixins */
          templateOptions: {
            baseClass: options.svgFontName + '-svg-font-icons',
            classPrefix: options.svgFontName + '-svg-font-icons-'
          }
        }
      }
    }
  });


  grunt.registerTask('force-jshint', function () {
    grunt.task.run('ignore-code-style-checks');
  });

  grunt.registerTask('wix-install', function () {
    if (!process.env.BUILD_NUMBER || process.env.BUILD_NUMBER === '12345') {
      shell.exec('npm install; bower install; bundle install', {silent: true});
    }
  });

  grunt.registerTask('ignore-code-style-checks', function () {
    ['jshint', 'jscs', 'scsslint'].forEach(function (section) {
      var config = grunt.config(section);
      config.options.force = true;
      grunt.config(section, config);
    });
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
    registerTask('e2e:normal', ['webdriver', 'protractor:normal']);
    registerTask('e2e:teamcity', ['protractor:teamcity']);
  } else {
    registerTask('e2e:normal', ['karma:e2e']);
    registerTask('e2e:teamcity', ['karma:e2eTeamcity']);
  }

  grunt.registerTask('jsstyle', function () {
    grunt.task.run('jshint');
    if (fs.existsSync(process.cwd() + '/.jscsrc')) {
      grunt.task.run('jscs');
    }
  });

  grunt.registerTask('scssstyle', function () {
    if (fs.existsSync(process.cwd() + '/.scss-lint.yml')) {
      grunt.task.run('scsslint');
    }
  });

  registerTask('pre-build', [
    'ts',
    'traceur',
    'jsstyle'].concat(options.svgFontName ?
    ['webfont'] : []).concat([
    'scssstyle',
    'concurrent:server',
    'autoprefixer',
    'copy:vm'
  ]));


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

  registerTask('serve', [
    'wix-install',
    'ignore-code-style-checks',
    'karma:unit',
    'clean:server',
    'pre-build',
    'karma:unit:run',
    'connect:livereload',
    'watch'
  ]);

  registerTask('serve:dist', [
    'ignore-code-style-checks',
    'connect:dist:keepalive'
  ]);

  registerTask('serve:coverage', [
    'enableCoverage',
    'serve'
  ]);

  registerTask('test', [
    'clean:server',
    'pre-build',
    'karma:single'
  ]);

  registerTask('test:ci', [
    'connect:test',
    'e2e:teamcity'
  ]);

  registerTask('build', [
    'clean:dist',
    'test',
    'package',
    'connect:test',
    'e2e:normal'
  ]);

  registerTask('build:ci', [
    'clean:dist',
    'pre-build',
    'karma:teamcity',
    'package'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });

  grunt.hookTask = function (name) {
    var hooked = name + '.hooked.' + Math.floor(Math.random() * 10000);
    var arr = [hooked];
    grunt.renameTask(name, hooked);
    grunt.registerTask(name, arr);
    return tasksLists[name] ? tasksLists[name] : arr;

  };

  function isObject(v) {
    return v !== null && typeof v === 'object' && v.constructor !== Array;
  }

  function applyModifications(conf, partial) {
    for (var k in partial) {
      if (partial.hasOwnProperty(k)) {
        if (isObject(partial[k])) {
          conf[k] = conf[k] || {};
          applyModifications(conf[k], partial[k]);
        } else {
          conf[k] = partial[k];
        }
      }
    }
  }

  grunt.modifyTask = function (what, how) {
    var conf = grunt.config(what);
    if (typeof how === 'function') {
      how.call(conf);
    } else {
      applyModifications(conf, how);
    }
    grunt.config(what, conf);
  };

};
