'use strict';

module.exports = function (grunt, options) {

  var extend = require('util')._extend;
  var shell = require('shelljs');
  var featureDetector = require('./feature-detector');

  var packageJson = grunt.file.readJSON('package.json');
  if (!packageJson.scripts || !packageJson.scripts.build || !packageJson.scripts.release) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.build = packageJson.scripts.build || 'node_modules/wix-gruntfile/scripts/build.sh';
    packageJson.scripts.release = packageJson.scripts.release || 'node_modules/wix-gruntfile/scripts/release.sh';
    grunt.file.write('package.json', JSON.stringify(packageJson, null, 2));
  }

  Array.prototype.replace = function (j, k) {
    this.splice(Math.min(j, k), 0, this.splice(Math.max(j, k), 1)[0]);
    return this;
  };

  options = extend({
    version: '0.0.0',
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
    inline: false,
    enableAngularMigration: false
  }, options);

  if (options.version.split('.')[0] > 0) {
    options.cdnify = 'vm';
  }

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

  var lintPlugins = ['grunt-contrib-jshint', 'grunt-jscs', 'grunt-tslint', 'grunt-scss-lint',
                     'grunt-newer', 'grunt-force-task'];
  if (process.argv[2] === 'lint') {
    lintPlugins.forEach(function (name) {
      grunt.loadNpmTasks('wix-gruntfile/node_modules/' + name);
    });
  } else if (process.argv[2] === 'serve' || process.argv[2] === 'serve:clean') {
    var plugins = lintPlugins.concat([
                   'grunt-text-replace', 'grunt-contrib-copy', 'grunt-karma', 'grunt-contrib-watch',
                   'grunt-contrib-connect', 'grunt-contrib-compass', 'grunt-angular-templates',
                   'grunt-json-angular-translate',  'grunt-petri-experiments', 'grunt-contrib-clean'
                  ]);
    plugins = plugins.concat(options.inline ? ['grunt-extract-styles', 'grunt-wix-inline'] : []);
    plugins = plugins.concat(options.svgFontName ? ['grunt-webfont'] : []);
    plugins = plugins.concat(options.autoprefixer ? ['grunt-autoprefixer'] : []);
    plugins = plugins.concat(featureDetector.isTraceurEnabled() ? ['grunt-traceur-latest'] : []);
    plugins = plugins.concat(featureDetector.isTypescriptEnabled() ? ['grunt-ts'] : []);
    plugins = plugins.concat(featureDetector.isHamlEnabled() ? ['grunt-haml2html-shahata'] : []);
    plugins.forEach(function (name) {
      grunt.loadNpmTasks('wix-gruntfile/node_modules/' + name);
    });
  } else {
    require('load-grunt-tasks')({loadNpmTasks: function (name) {
      grunt.loadNpmTasks('wix-gruntfile/node_modules/' + name);
    }}, {config: require('./package.json')});
    require('time-grunt')(grunt);
  }

  var optionalTasks = ['petriExperiments', 'manifestPackager'];
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
    manifestPackager:       require('./grunt-sections/generators')(grunt, options).manifestPackager,
    jsonAngularTranslate:   require('./grunt-sections/generators')(grunt, options).translations,
    webfontIfEnabled:       require('./grunt-sections/generators')(grunt, options).webfontIfEnabled,
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
    'mkdirTmpStyles',
    'newer:webfontIfEnabled',
    'hamlIfEnabled',
    'compass:dist',
    'replace:dist',
    'newer:copy:styles',
    'newer:jsonAngularTranslate',
    'newer:ngtemplates:single',
    'newer:petriExperiments',
    'autoprefixerIfEnabled',
    'styleInlineServeIfEnabled',
    'newer:copy:vm'
  ]);

  grunt.registerTask('pre-build:clean', [
    'clean:dist',
    'newer-clean',
    'pre-build'
  ]);

  grunt.registerTask('package', function () {
    grunt.task.run([
      'imagemin',
      'copy:dist',
      'manifestPackager',
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
    'ignore-code-style-checks',
    'karma:unit',
    'clean:ts',
    'pre-build',
    'livereloadServer',
    'connect:livereload',
    'force:karma:unit:run',
    'watch'
  ]);

  grunt.registerTask('serve:dist', [
    'ignore-code-style-checks',
    'connect:dist:keepalive'
  ]);

  grunt.registerTask('serve:clean', [
    'clean:server',
    'newer-clean',
    'serve'
  ]);

  grunt.registerTask('serve:coverage', [
    'enableCoverage',
    'serve'
  ]);

  grunt.registerTask('test', [
    'pre-build:clean',
    'karma:single'
  ]);

  grunt.registerTask('test:e2e', function (type) {
    if (type === 'noshard') {
      grunt.modifyTask('protractor', {normal: {options: {'capabilities.shardTestFiles': 0}}});
    }

    grunt.task.run('connect:localTest');
    grunt.task.run('webdriver');
    grunt.task.run('protractor:normal');
  });

  grunt.registerTask('test:ci', [
    'e2eIfEnabled:teamcity'
  ]);

  grunt.registerTask('test:ci_parallel_main_server', [
    'e2eIfEnabled:teamcity_main_server_parallel'
  ]);

  grunt.registerTask('test:ci_parallel_diff_server_diff_tunnel', [
    'e2eIfEnabled:teamcity_diff_server_diff_tunnel'
  ]);

  grunt.registerTask('test:ci_parallel_same_tunnel', [
    'e2eIfEnabled:teamcity_diff_server_diff_tunnel'
  ]);

  grunt.registerTask('test:ci_parallel_same_server', [
    'e2eIfEnabled:teamcity_same_server'
  ]);

  grunt.registerTask('test:ci_parallel_same_server_tunnel', [
    'e2eIfEnabled:teamcity_same_server_tunnel'
  ]);

  grunt.registerTask('build', [
    'pre-build:clean',
    'karma:single',
    'package',
    'e2eIfEnabled:normal'
  ]);

  grunt.registerTask('build:ci', [
    'pre-build:clean',
    'karma:teamcity',
    'package'
  ]);

  grunt.registerTask('publish', [
    'release'
  ]);

  grunt.registerTask('default', function () {
    grunt.task.run(['build']);
  });

  grunt.hookTask = function (name) {
    var hooked = name + '(hooked' + Math.floor(Math.random() * 10000) + ')';
    var arr = [hooked];
    grunt.renameTask(name, hooked);
    grunt.registerTask(name, arr);
    var hookedCfgPath = hooked.replace(/:/g, '.');
    var nameCfgPath = name.replace(/:/g, '.');
    grunt.config.set(hookedCfgPath, grunt.config.getRaw(nameCfgPath));
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

  if (options.enableAngularMigration) {
    require('./grunt-sections/angular-migration')(grunt, options).addMigration();
  }

  require('./grunt-sections/flag-nokarma')(grunt, options);

};
