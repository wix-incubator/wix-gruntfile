'use strict';
module.exports = function (grunt, options) {
  grunt.loadNpmTasks('grunt-file-creator');
  grunt.loadNpmTasks('grunt-extend-config');
  grunt.loadNpmTasks('grunt-merge-json');
  var norepeat = require('array-norepeat');

  grunt.extendConfig({
    'merge-json': {
      "merge-user": {
        src: ['app/petriExperiments/*.json'],
        dest: 'app/user-petriExperiments.json'
      },
      "merge-bower": {
        src: ['app/bower_components/*/dist/petriExperiments.json'],
        dest: 'app/bower-petriExperiments.json'
      }
    },
    'file-creator': {
      'packageSpecs': {
        'dist/petriExperiments.json': function (fs, fd, done) {
          var packagedSpecs = [];

          function validateSpec(aSpec) {
            return typeof aSpec.name === 'string' && aSpec.name.length > 0 &&
                typeof aSpec.owner === 'string' && aSpec.owner.length > 0 &&
                typeof aSpec.scope === 'string' && aSpec.scope.length > 0 &&
                typeof aSpec.onlyForLoggedInUsers === 'boolean' &&
                Array.isArray(aSpec.testGroups) && aSpec.testGroups.length > 1;
          }

          function processSingle(abspath, rootdir, subdir, filename) {
            var singleSpec = grunt.file.readJSON(abspath);
            if (validateSpec(singleSpec)) {
              packagedSpecs.push(singleSpec);
            }
            else {
              grunt.fail.warn('Illegal petriSpec file: ' + abspath);
            }
          }

          grunt.file.recurse('petriExperiments', processSingle);
          fs.writeSync(fd, JSON.stringify(packagedSpecs, null, 4));

          done();
        }
      },
      compileSpecs: {
        'dist/petriExperiments.json': function (fs, fd, done) {
          var userJson = grunt.file.readJSON('app/user-petriExperiments.json');
          var bowerJson = grunt.file.readJSON('app/bower-petriExperiments.json');

          var finalJson = {};

          function buildJson(firstJSON, secJSON) {
            for (var keyInFirst in firstJSON) {
              var valid = true;
              for (var keyInSec in secJSON) {
                if (keyInSec === keyInFirst && finalJson[keyInFirst]) {
                  valid = false;
                  //grunt.fail.warn('Duplicated PETRI experiment key: ' + keyInFirst + '!!!');
                }
              }
              if (valid) {
                finalJson[keyInFirst] = firstJSON[keyInFirst];
              }
            }
          }

          buildJson(userJson, bowerJson);
          buildJson(bowerJson, userJson);
          var stringifyJSON = JSON.stringify(finalJson, null, '\t');
          fs.writeSync(fd, stringifyJSON);

          done();
        },
        'app/petriExperiments.js': function (fs, fd, done) {

          var experiments = {};
          var scopes = [];
          var allSpecs = grunt.file.readJSON('dist/petriExperiments.json');

          for (var spec in allSpecs) {
            var scope = allSpecs[spec].scope;
            scopes.push("'" + scope + "'");
            experiments[allSpecs[spec].name] = allSpecs[spec].name;
          }

          scopes = norepeat(scopes, false);

          fs.writeSync(fd, '//auto generated code, do not edit.\n');
          fs.writeSync(fd, '\'use strict\';\n');
          fs.writeSync(fd, '(function () {\n');
          fs.writeSync(fd, '\tvar W = W || {};\n');
          fs.writeSync(fd, '\tW.petriExperiments = W.petriExperiments || {};\n');
          fs.writeSync(fd, '\tW.petriExperiments.experiments = W.petriExperiments.experiments || {};\n');
          fs.writeSync(fd, '\tW.petriExperiments.scopes = W.petriExperiments.scopes || {};\n');
          for (var spec in experiments) {
            fs.writeSync(fd, '\tW.petriExperiments.experiments.' + spec + ' = \'' + spec + '\' ;\n');
          }
          ;
          fs.writeSync(fd, '\tW.petriExperiments.scopes = [' + scopes.join(', ') + ']\n');
          fs.writeSync(fd, '})();\n');

          grunt.file.delete('app/user-petriExperiments.json');
          grunt.file.delete('app/bower-petriExperiments.json');
          done();
        }
      }
    }
  })
  ;

}
;
