'use strict';

var shell = require('shelljs');
var inquirer = require('inquirer');
var satisfaction = require('satisfaction');

module.exports = function register(grunt) {

  grunt.registerTask('verify-npm', function () {
    if (!process.env.VERIFY_NPM) {
      return;
    }

    function queryStatisfaction() {
      return {
        satisfied : satisfaction.status() && true,
        violations : satisfaction.violations().join('\n')
      };
    }

    function ppViolationsMessage(violations) {
      var pLine = '\n' + new Array(55).join('*') + '\n';
      return '\nWhoa there cowboy! The following NPM dependencies are outdated:' +
        pLine + violations + pLine +
        'Do you want to update outdated npm modules?';
    }

    function onPromptAnswer(answer, done) {
      if (answer) {
        grunt.log.ok('executing \'npm update\' ...');
        shell.exec('npm update');
        done();
      } else {
        grunt.log.subhead('Skipping updating outdated NPM dependencies...');
        done();
      }
    }

    var done = this.async(),
      result = queryStatisfaction();

    if (result.satisfied) {
      grunt.log.ok('\nNo outdated npm modules, yay!');
      done();
    } else {
      var question = ppViolationsMessage(result.violations);
      inquirer.prompt([{type: 'confirm', name: 'update', message: question}], function (answers) {
        onPromptAnswer(answers.update, done);
      });
    }

  });

};
