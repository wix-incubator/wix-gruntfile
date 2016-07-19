'use strict';

var extend = require('util')._extend;
var featureDetector = require('../feature-detector');

module.exports = function (grunt) {
  function arrayToObj(arr) {
    return typeof arr.reduce === 'function' ? arr.reduce(function (obj, replace) {
      if (typeof replace.from === 'string') {
        obj[replace.from] = replace.to;
      } else {
        obj.$$preserve.push(replace);
      }
      return obj;
    }, { $$preserve: [] }) : arr;
  }

  function objToArray(obj) {
    var arr = obj.$$preserve || [];
    for (var key in obj) {
      if (key !== '$$preserve') {
        arr.push({ from: key, to: obj[key] });
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

  function loadVelocityData() {
    var object = {};
    try {
      extend(object, require(process.cwd() + '/velocity.data.js'));
      extend(object, require(process.cwd() + '/velocity.private.data.js'));
    } catch (e) {
    }
    return object;
  }

  grunt.registerTask('hamlIfEnabled', function () {
    if (grunt.task.exists('haml') && featureDetector.isHamlEnabled()) {
      grunt.task.run('newer:haml');
    }
  });

  grunt.registerTask('replaceOrVelocity', function () {
    if (grunt.task.exists('replace') && !featureDetector.isVelocityEnabled()) {
      grunt.task.run('replace:dist');
    } else {
      grunt.task.run('velocity:dist');
    }
  });

  return {
    ejs: {
      serve: {
        options: require(process.cwd() + '/replace.conf.js'),
        src: 'app/index.ejs',
        dest: '.tmp/index.html',
      },
      dist: {
        options: extend(require(process.cwd() + '/replace.conf.js'), { debug: false }),
        src: 'dist/index.ejs',
        dest: 'dist/index.html',
      }
    },
    replace: {
      dist: {
        src: ['app/*.vm'],
        dest: '.tmp/',
        replacements: loadReplacements()
      },
      wixStyleToBrackets: {
        src: ['.tmp/{styles,modules}/**/*.css'],
        overwrite: true,
        replacements: [{
          from: /font: ?; ?{{([^}]+)}};/g,
          to: 'font: [[$1]];'
        }, {
            from: /{{([^}]+)}}/g,
            to: '[[$1]]'
          }]
      },
      wixStyleToCurlies: {
        src: ['.tmp/{styles,modules}/**/*.css'],
        overwrite: true,
        replacements: [{
          from: /font: \[\[([^\]]+)\]\];/g,
          to: 'font:;{{$1}};'
        }, {
            from: /\[\[([^\]}]+)\]\]/g,
            to: '{{$1}}'
          }]
      }
    },
    velocity: {
      dist: {
        options: {
          data: loadVelocityData()
        },
        files: [{
          expand: true,
          cwd: 'app',
          src: '*.vm',
          dest: '.tmp'
        }]
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
