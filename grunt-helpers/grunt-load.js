'use strict';

var path = require('path');

Array.prototype.replace = function (j, k) {
  this.splice(Math.min(j, k), 0, this.splice(Math.max(j, k), 1)[0]);
  return this;
};

module.exports = function (grunt, options) {
  var lintPlugins = [
    'grunt-contrib-jshint',
    'grunt-eslint',
    'grunt-jscs',
    'grunt-tslint',
    'grunt-scss-lint',
    'grunt-newer',
    'grunt-force-task'
  ];

  var servePlugins = [
    'grunt-text-replace',
    'grunt-ejs',
    'grunt-contrib-copy',
    'grunt-karma',
    'grunt-contrib-watch',
    'grunt-contrib-connect',
    'grunt-contrib-compass',
    'grunt-angular-templates',
    'grunt-json-angular-translate',
    'grunt-petri-experiments',
    'grunt-contrib-clean'
  ];

  var optionalTasks = [
    'petriExperiments',
    'manifestPackager'
  ];

  function getRelativePluginPath(name) {
    var pluginPath = require.resolve(name + '/package.json').replace(path.sep + 'package.json', '');
    var relativePath = path.relative(process.cwd() + '/node_modules', pluginPath);
    return relativePath;
  }

  function getServePlugins(options) {
    var featureDetector = require('../feature-detector');
    var plugins = lintPlugins.concat(servePlugins);
    plugins = plugins.concat(options.inline ? ['grunt-extract-styles', 'grunt-wix-inline'] : []);
    plugins = plugins.concat(options.svgFontName ? ['grunt-webfont'] : []);
    plugins = plugins.concat(options.autoprefixer ? ['grunt-autoprefixer'] : []);
    plugins = plugins.concat(options.babelEnabled  ? ['grunt-babel'] : []);
    plugins = plugins.concat(featureDetector.isTypescriptEnabled() ? ['grunt-ts'] : []);
    plugins = plugins.concat(featureDetector.isHamlEnabled() ? ['grunt-haml2html-shahata'] : []);
    plugins = plugins.concat(featureDetector.isVelocityEnabled() ? ['grunt-velocity-parser'] : []);
    return plugins;
  }


  function loadPlugins(grunt, plugins) {
    plugins.forEach(function (name) {
      grunt.loadNpmTasks(getRelativePluginPath(name));
    });
  }

  function registerIfDontExist(grunt, tasks) {
    tasks.forEach(function (task) {
      if (!grunt.task.exists(task)) {
        grunt.registerTask(task, function () {
        });
      }
    });
  }

  function loadAllPlugins(grunt) {
    require('load-grunt-tasks')({
      loadNpmTasks : function (name) {
        try {
          grunt.loadNpmTasks(getRelativePluginPath(name));
        } catch (e) {}
      }
    }, {config : require('../package.json')});
    require('time-grunt')(grunt);
  }

  loadPlugins(grunt, ['remap-istanbul', 'grunt-sass']);

  if (process.argv[2] === 'lint') {
    loadPlugins(grunt, lintPlugins);
  } else if (process.argv[2] === 'serve' || process.argv[2] === 'serve:clean') {
    loadPlugins(grunt, getServePlugins(options));
  } else {
    loadAllPlugins(grunt);
  }

  registerIfDontExist(grunt, optionalTasks);
};
