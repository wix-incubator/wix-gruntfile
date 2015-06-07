'use strict';

module.exports = function (grunt, options) {

  var extend = require('util')._extend;
  var shell = require('shelljs');

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
    karmaConf: null,
    appFirst: true,
    page: '',
    protractor: false,
    proxies: {},
    beforeProxies: {},
    bowerComponent: false,
    useModulesStructure: false,
    svgFontName: null,
    autoprefixer: true,
    inline: false
  }, options);

  if (options.inline) {
    options.autoprefixer = false;
  }

  if (!options.preloadModule) {
    options.preloadModule = options.translationsModule || 'wixAppPreload';
  }

  if (options.karmaConf) {
    options.karmaConf({set: function (karmaConf) {
      options.unitTestFiles = karmaConf.files.filter(function (value) {
        return value.indexOf('bower_component') !== -1;
      });
    }});
  }

  if (process.argv[2] === 'lint') {
    ['grunt-contrib-jshint', 'grunt-jscs', 'grunt-tslint', 'grunt-scss-lint', 'grunt-newer'].forEach(function (name) {
      grunt.loadNpmTasks('wix-gruntfile/node_modules/' + name);
    });
  } else {
    require('load-grunt-tasks')({loadNpmTasks: function (name) {
      grunt.loadNpmTasks('wix-gruntfile/node_modules/' + name);
    }}, {config: require('./package.json')});
    require('time-grunt')(grunt);
  }

  var optionalTasks = ['petriExperiments'];
  optionalTasks.forEach(function (task) {
    if (!grunt.task.exists(task)) {
      grunt.registerTask(task, function () {});
    }
  });

  grunt.initConfig({
    yeoman:                 require('./grunt-sections/flow')(grunt, options).yeoman,
    clean:                  require('./grunt-sections/flow')(grunt, options).clean,

    jshint:                 require('./grunt-sections/codestyle')(grunt, options).jshint,
    tslint:                 require('./grunt-sections/codestyle')(grunt, options).tslint,
    jscs:                   require('./grunt-sections/codestyle')(grunt, options).jscs,
    scsslint:               require('./grunt-sections/codestyle')(grunt, options).scsslint,

    autoprefixer:           require('./grunt-sections/transform-css')(grunt, options).autoprefixer,
    compass:                require('./grunt-sections/transform-css')(grunt, options).compass,
    traceur:                require('./grunt-sections/transform-js')(grunt, options).traceur,
    ts:                     require('./grunt-sections/transform-js')(grunt, options).typescript,
    replace:                require('./grunt-sections/transform-html')(grunt, options).replace,
    haml:                   require('./grunt-sections/transform-html')(grunt, options).haml,

    petriExperiments:       require('./grunt-sections/generators')(grunt, options).petriExperiments,
    jsonAngularTranslate:   require('./grunt-sections/generators')(grunt, options).translations,
    webfont:                require('./grunt-sections/generators')(grunt, options).webfont,

    watch:                  require('./grunt-sections/watch')(grunt, options),
    connect:                require('./grunt-sections/connect')(grunt, options),

    imagemin:               require('./grunt-sections/minify')(grunt, options).imagemin,
    svgmin:                 require('./grunt-sections/minify')(grunt, options).svgmin,
    ngAnnotate:             require('./grunt-sections/minify')(grunt, options).ngAnnotate,
    uglify:                 require('./grunt-sections/minify')(grunt, options).uglify,
    cssmin:                 require('./grunt-sections/minify')(grunt, options).cssmin,

    useminPrepare:          require('./grunt-sections/build-html')(grunt, options).useminPrepare,
    usemin:                 require('./grunt-sections/build-html')(grunt, options).usemin,
    velocityDebug:          require('./grunt-sections/build-html')(grunt, options).velocityDebug,
    processTags:            require('./grunt-sections/build-html')(grunt, options).processTags,
    cdnify:                 require('./grunt-sections/build-html')(grunt, options).cdnify,
    ngtemplates:            require('./grunt-sections/build-html')(grunt, options).ngtemplates,
    extractStyles:          require('./grunt-sections/build-html')(grunt, options).extractStyles,
    inline:                 require('./grunt-sections/build-html')(grunt, options).inline,

    release:                require('./grunt-sections/flow')(grunt, options).release,
    copy:                   require('./grunt-sections/flow')(grunt, options).copy,

    karma:                  require('./grunt-sections/test-runners')(grunt, options).karma,
    protractor:             require('./grunt-sections/test-runners')(grunt, options).protractor
  });

  grunt.registerTask('wix-install', function () {
    shell.exec('npm install; bower install; bundle install', {silent: true});
  });

  grunt.registerTask('pre-build', [
    'jsstyleIfEnabled',
    'typescriptIfEnabled',
    'traceurIfEnabled',
    'scssstyleIfEnabled',
    'webfontIfEnabled',
    'hamlIfEnabled',
    'compass:dist',
    'replace:dist',
    'copy:styles',
    'jsonAngularTranslate',
    'ngtemplates:single',
    'petriExperiments',
    'autoprefixerIfEnabled',
    'styleInlineServeIfEnabled',
    'copy:vm'
  ]);

  grunt.registerTask('package', function () {
    grunt.task.run([
      'imagemin',
      'copy:dist',
      'useminPrepare',
      'styleInlineDistIfEnabled',
      'ngtemplates',
      'concat',
      'cssmin',
      'ngAnnotate',
      'uglify',
      'cdnify',
      'usemin',
      'processTags',
      'clean:index'
    ]);
  });

  grunt.registerTask('serve', [
    'wix-install',
    'ignore-code-style-checks',
    'karma:unit',
    'clean:server',
    'pre-build',
    'karma:unit:run',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('serve:dist', [
    'ignore-code-style-checks',
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

  grunt.registerTask('test:e2e', function () {
    grunt.task.run('connect:localTest');
    grunt.task.run('webdriver');
    grunt.task.run('protractor:normal');
  });

  grunt.registerTask('test:ci', [
    'e2eIfEnabled:teamcity'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'test',
    'package',
    'e2eIfEnabled:normal'
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

  grunt.hookTask = function (name) {
    var hooked = name + '.hooked.' + Math.floor(Math.random() * 10000);
    var arr = [hooked];
    grunt.renameTask(name, hooked);
    grunt.registerTask(name, arr);
    return arr;
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
      conf = how.call(conf, conf) || conf;
    } else {
      applyModifications(conf, how);
    }
    grunt.config(what, conf);
  };

};
