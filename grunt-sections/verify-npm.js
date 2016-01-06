'use strict';

module.exports = function register(grunt) {

  grunt.registerTask('verify-npm', function () {
    if (!process.env.VERIFY_NPM) {
      return;
    }

    function queryStatisfaction() {
      var satisfaction = require('satisfaction');
      return {
        satisfied : satisfaction.status() && true,
        violations : satisfaction.violations().join('\n')
      };
    }

    function ppViolationsMessage(violations) {
      var pLine = '\n' + new Array(55).join('*') + '\n';
      return '\nWhoa there cowboy! The following NPM dependencies are outdated:' +
        pLine + violations + pLine +
        'Do you want to install outdated npm modules? (Y/n): ';
    }

    function prompt(question, answerCallback) {
      var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(question, function (answer) {
        rl.close();
        answerCallback(answer);
      });
    }

    function onPromptAnswer(answer) {
      if (answer === 'Y') {
        info('executing \'npm update\' ...');
        require('shelljs').exec('npm update');
        done();
      } else {
        warn('Skipping updating outdated NPM dependencies...');
        done();
      }
    }

    function info(msg) {
      console.log('\x1b[34m%s\x1b[0m', msg); // ... I'm blue da ba dee da ba die
    }

    function warn(msg) {
      console.log('\x1b[33m%s\x1b[0m', msg); // ... and it was all yellow
    }

    var done = this.async(),
      satisfaction = queryStatisfaction();

    if (satisfaction.satisfied) {
      info('\nNo outdated npm modules, yay!');
      done();
    } else {
      var question = ppViolationsMessage(satisfaction.violations);
      prompt(question, onPromptAnswer);
    }

  });

};
