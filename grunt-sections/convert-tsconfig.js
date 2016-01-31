'use strict';
module.exports = function (grunt) {

  var baseTsConfig = {
    compilerOptions: {
      outDir: '../.tmp'
    },
    filesGlob: [
      'scripts/**/*.ts',
      'test/**/*.ts',
      'typings/tsd.d.ts'
    ],
    files: []
  };

  grunt.registerTask('create-ts-config', function () {
    var lineReader = grunt.file.read(process.cwd() + '/.tmp/convert-reference.ts.tmp').split('\n');
    if (grunt.file.exists(process.cwd() + '/app/tsconfig.json')) {
      var currentTsConfig = grunt.file.readJSON(process.cwd() + '/app/tsconfig.json');
      currentTsConfig.filesGlob.forEach(function (file) {
        if (file.indexOf('bower_components') > -1) {
          baseTsConfig.filesGlob.push(file);
        }
      });
    }
    lineReader.forEach(function (line) {
      var bowerIndex = line.indexOf('bower_components');
      if (bowerIndex > -1) {
        baseTsConfig.filesGlob.push(line.substring(bowerIndex).replace(/["'].*>.*$/m, ''));
      }
    });
    grunt.file.write(process.cwd() + '/app/tsconfig.json', JSON.stringify(baseTsConfig, null, 2));
  });

  function convertToTsConfig() {
    grunt.task.run([
      'replace:referencesFromTest',
      'concat:referenceFiles',
      'copy:testToApp',
      'copy:typingsToApp',
      'replace:removeReferenceComments',
      'replace:dtsBower',
      'clean:tsconfigConvert',
      'replace:karmaAfterMovingTest',
      'replace:updateReferenceInVms',
      'create-ts-config']);
  }

  return {
    convertToTsConfig: convertToTsConfig,
    concat: {
      referenceFiles: {
        src: ['app/scripts/**/reference.ts', 'app/test/**/reference.ts', 'reference.ts', '**/typings/tsd.d.ts'],
        dest: '.tmp/convert-reference.ts.tmp'
      }
    },
    copy: {
      testToApp: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'test/',
          src: ['**'],
          dest: 'app/test/'
        }]
      },
      typingsToApp: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app/scripts/typings/',
          src: ['**'],
          dest: 'app/typings/'
        }]
      }
    },
    replace: {
      dtsBower: {
        src: ['app/typings/tsd.d.ts'],
        overwrite: true,
        replacements: [{
          from: /^\/\/\/+\s(<reference path=).*(bower_components).*$\n/mg,
          to: null
        }]
      },
      karmaAfterMovingTest: {
        src: ['karma.conf.js'],
        overwrite: true,
        replacements: [{
          from: '{,.tmp/}test',
          to: '{app,.tmp}/test'
        }]
      },
      referencesFromTest: {
        src: ['test/**/*.*'],
        overwrite: true,
        replacements: [{
          from: '../app/',
          to: '../'
        }, {
          from: '/node_modules',
          to: '../node_modules'
        }]
      },
      removeReferenceComments: {
        src: ['app/scripts/**/*.ts', 'app/test/**/*.ts'],
        overwrite: true,
        replacements: [{
          from: /^\/\/\/+\s(<reference path=).*$\n*/m,
          to: null
        }]
      },
      updateReferenceInVms: {
        src: ['app/**/*.vm'],
        overwrite: true,
        replacements: [{
          from: '<!-- build:js(test)',
          to: '<!-- build:js(app)'
        }, {
          from: 'src="mock',
          to: 'src="test/mock'
        }, {
          from: "src='mock",
          to: "src='test/mock"
        }]
      }
    },
    clean: {
      tsconfigConvert: {
        files: [{
          dot: true,
          src: [
            'test',
            'app/scripts/**/reference.ts',
            'app/test/**/reference.ts',
            'reference.ts',
            'app/scripts/typings'
          ]
        }]
      }
    }

  };
};
