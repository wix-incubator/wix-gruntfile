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

    const RESULT_FILE_NAME = process.cwd() + '/.npm-outdated';
    const UPDATING_DEPENDENCIES_CMD = 'npm update';
    const FS_ENCODING = 'utf-8';

    var outdatedModule = null;

    (function() {

      let outdated = {};

      function isReallyOutdated(pkg) {
        return semver.valid(outdated[pkg].wanted && outdated[pkg].current)
          && semver.lt(outdated[pkg].current, outdated[pkg].wanted);
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

      function execNpmVerify() {
        let cmd = require('child_process').spawn('npm', ['outdated', '--json'], {detached: true});
        let result = '';
        cmd.stdout.on('data', (output) => {
          result += output;
        });
        cmd.on('close', (code) => {
          if (code === 0) {
            outdated = JSON.parse(result || {});
            let res = Object.keys(outdated).filter(isReallyOutdated).map(toDto);
            writeToFs(RESULT_FILE_NAME, toFileFormat(res));
          }
        });
      }

      let fetchOutdated = () => {
        try {
          let file = fs.readFileSync(RESULT_FILE_NAME, {encoding : FS_ENCODING});
          return _.isEmpty(file) ? [] : JSON.parse(file);
        } catch (er) {
          execNpmVerify();
          return null;
        }
      };

      outdatedModule = fetchOutdated();

    })();

    function formatOutdatedPackages(outdated) {
      return outdated.map((pkg) => `(${pkg.name}) ${pkg.current} -> ${pkg.update}`).join('\n');
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

    let done = this.async();

    let main = () => {
      if (outdatedModule) {
        fs.unlinkSync(RESULT_FILE_NAME);
        if (outdatedModule.length === 0) {
          grunt.log.ok('\nNo outdated npm modules, yay!');
          done();
        } else {
          var question = ppViolationsMessage(outdatedModule);
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
    };

    main();

  });

};
