'use strict';

module.exports = function register(grunt) {

  grunt.registerTask('verify-npm', function () {

    if (!process.env.VERIFY_NPM) {
      grunt.log.write('verify-npm task is deactivated. please set \'VERIFY_NPM\' environment variable if you wish to enable it.');
      return;
    }

    const RESULT_FILE_NAME = process.cwd() + '/node_modules/.npm-outdated';
    const FS_ENCODING = 'utf-8';
    const OUTDATED_CMD_TOKENS = 'outdated --json'.split(' ');

    function formatOutdatedPackages(outdated) {
      return outdated.map((pkg) => `(${pkg.name}) ${pkg.current} -> ${pkg.update}`).join('\n');
    }

    function ppViolationsMessage(outdated) {
      let line = `\n****\n`;
      let outdatedPkg = line + formatOutdatedPackages(outdated) + line;
      return `\nWhoa there cowboy! The following NPM modules are outdated:${outdatedPkg}Do you want to update outdated npm modules?`;
    }

    function toUpdateCmd(modules) {
      let pkgs = (modules || []).map((mdl) => mdl.name);
      return `npm update ${pkgs}`
    }

    function onPromptAnswer(answer, cmd) {
      if (answer) {
        grunt.log.ok(`executing 'npm update' ...`);
        require('shelljs').exec(cmd);
      } else {
        grunt.log.subhead('Skipping updating outdated NPM modules...');
      }
    }

    function fetchOutdatedModules() {

      require("jsonminify"); // sets JSON.minify
      let semver = require('semver');
      let fs = require('fs');

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
        let cmd = require('child_process').spawn('npm', OUTDATED_CMD_TOKENS, {detached: true});
        let result = '';
        cmd.stdout.on('data', (output) => {
          result += output;
        });
        cmd.on('close', (code) => {
          if (code === 0) {
            outdated = JSON.parse(result || '[]');
            let res = Object.keys(outdated).filter(isReallyOutdated).map(toDto);
            writeToFs(RESULT_FILE_NAME, toFileFormat(res));
          }
        });
      }

      try {
        let file = fs.readFileSync(RESULT_FILE_NAME, {encoding : FS_ENCODING});
        fs.unlinkSync(RESULT_FILE_NAME);
        return file ? JSON.parse(file) : [];
      } catch (er) {
        execNpmVerify();
        return null;
      }
    }

    let done = this.async();

    let outdatedModule = fetchOutdatedModules();

    if (outdatedModule === null) {
      grunt.log.write('Outdated npm modules result is not available yet. If you are seeing this messages repeatedly, please contact admin');
      done();
    } else if (outdatedModule.length === 0) {
      grunt.log.ok('\nNo outdated npm modules, yay!');
      done();
    } else {
      let question = ppViolationsMessage(outdatedModule);
      require('inquirer').prompt([{type: 'confirm', name: 'update', message: question}], (answers) => {
        onPromptAnswer(answers.update, toUpdateCmd(outdatedModule));
        done();
      });
    }

  });

};
