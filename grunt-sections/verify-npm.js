'use strict';

var shell = require('shelljs');
var semver = require('semver');
var inquirer = require('inquirer');
var fs = require('fs');
var jsonminify = require("jsonminify");
var _ = require('lodash');

module.exports = function register(grunt) {

  grunt.registerTask('verify-npm', function () {

    if (!process.env.VERIFY_NPM) {
      return;
    }

    var RESULT_FILE_NAME = process.cwd() + '/.npm-outdated';
    var UPDATING_DEPENDENCIES_CMD = 'npm update';
    var FS_ENCODING = 'utf-8';

    (function() {

      var outdated = {};

      function getPackagesNames() {
        return Object.getOwnPropertyNames(outdated);
      }

      function isReallyOutdated(pkg) {
        return semver.valid(outdated[pkg].wanted) && semver.lt(outdated[pkg].current, outdated[pkg].wanted);
      }

      function toDto(pkg) {
        return {name: pkg, current: outdated[pkg].current, update: outdated[pkg].wanted}
      }

      function writeToFs(path, data) {
        fs.writeFileSync(path, data ,{encoding: FS_ENCODING});
      }

      function toFileFormat(obj) {
        return JSON.minify(JSON.stringify(obj));
      }

      function verifyOutdated() {
        try {
          fs.statSync(RESULT_FILE_NAME).isFile();
        } catch (er) {
          var spawn = require('child_process').spawn;
          var cmd = spawn('npm', ['outdated', '--json'], {detached : true});
          cmd.stdout.on('data', function(output) {
            outdated = JSON.parse(output || {});
            var res = getPackagesNames()
              .filter(isReallyOutdated)
              .map(toDto);
            writeToFs(RESULT_FILE_NAME, toFileFormat(res));
          });
        }
      }

      verifyOutdated();

    })();

    function queryOutdated() {
      try {
        var file = fs.readFileSync(RESULT_FILE_NAME, {encoding : FS_ENCODING});
        return _.isEmpty(file) ? [] : JSON.parse(file);
      } catch (err) {
        return null;
      }
    }

    function formatOutdatedPackages(outdated) {
      return outdated.map(function (pkg) {
        return '(' + pkg.name + ') ' + pkg.current + ' -> ' + pkg.update;
      }).join('\n');
    }

    function ppViolationsMessage(outdated) {
      var pLine = '\n' + new Array(55).join('*') + '\n';
      return '\nWhoa there cowboy! The following NPM dependencies are outdated:' +
        pLine + formatOutdatedPackages(outdated) + pLine +
        'Do you want to update outdated npm modules? ';
    }

    function onPromptAnswer(answer) {
      if (answer) {
        grunt.log.ok('executing \'npm update\' ...');
        shell.exec(UPDATING_DEPENDENCIES_CMD);
      } else {
        grunt.log.subhead('Skipping updating outdated NPM dependencies...');
      }
    }

    function main(context) {
      var done = context.async(), result = queryOutdated();

      if (result) {
        fs.unlinkSync(RESULT_FILE_NAME);
        if (result.length === 0) {
          grunt.log.ok('\nNo outdated npm modules, yay!');
          done();
        } else {
          var question = ppViolationsMessage(result);
          inquirer.prompt([{type: 'confirm', name: 'update', message: question}], function (answers) {
            onPromptAnswer(answers.update);
            done();
          });
        }
      } else {
        grunt.log.write('A possible error occurred, this might be due a problem when verifying outdated npm modules.' +
          '\nIf this message repeats again - please contact admin');
        done();
      }
    }

    main(this);

  });

};
