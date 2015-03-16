'use strict';

var extend = require('util')._extend;
var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
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

  grunt.registerTask('hamlIfEnabled', function () {
    if (featureDetector.isHamlEnabled()) {
      grunt.task.run('haml');
    }
  });

  return {
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
    }
  };
};