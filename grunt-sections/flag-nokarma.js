/* global process */
'use strict';

module.exports = function (grunt) {

  var noKarma = (process.argv.indexOf('--nokarma') !== -1);
  if (noKarma) {
    grunt.registerTask('noKarma', function () {
      grunt.log.writeln('WITH GREAT POWER COMES GREAT RESPONSIBILITY!');
    });
    var deps = grunt.hookTask('karma');
    deps.splice(0, 1);
    deps.push('noKarma');
  }

}
