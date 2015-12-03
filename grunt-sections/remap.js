'use strict';

var process = require('process');
var path = require('path');

module.exports = function (grunt) {
  // remapIstanbul skips the non-mapped entries in coverage.json and
  // doesn't update their path to relative path
  // This also uses istanbul report method instead of creating another task
  grunt.registerTask('remapIstanbulJsAndReport', function(){
    function shiftLeftDirectory(filePath) {
      var splitPath = filePath.split(path.sep);
      splitPath.shift();
      filePath = splitPath.join(path.sep);
      return filePath;
    }

    var istanbul = require('istanbul');
    var collector = new istanbul.Collector();
    var collectorOutput = new istanbul.Collector();
    var report = istanbul.Report.create('html', {dir: './coverage/report'});
    var coverage = {};

    collector.add(grunt.file.readJSON('./coverage/coverage-ts.json'));

    collector.files().forEach(function(file) {
      var fileCoverage = collector.fileCoverageFor(file);
      var filePath = fileCoverage.path;
      if (path.extname(file) === '.js'){
        filePath = path.relative(process.cwd(), file);
      }
      coverage[shiftLeftDirectory(filePath)] = fileCoverage;
    });

    collectorOutput.add(coverage);
    report.writeReport(collectorOutput, true);
  });

  return {
    remapIstanbul: {
      build: {
        src: './coverage/coverage-js.json',
        options: {
          reports: {
            json: './coverage/coverage-ts.json'
          },
          fail: false
        }
      }
    },
    sourceMapBasename: {
      build:{
        src: ['.tmp/**/*.js.map']
      }
    }
  };
};
