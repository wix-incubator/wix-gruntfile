'use strict';

module.exports = function (grunt, options) {
  return {
    ngtemplates: {
      app: {
        options: {
          module: options.preloadModule,
          usemin: 'scripts/scripts.js'
        },
        files: [{
          cwd: '.tmp',
          src: '{views,modules}/**/*.preload.html',
          dest: '.tmp/templates.tmp.js'
        }, {
          cwd: 'app',
          src: '{views,modules}/**/*.preload.html',
          dest: '.tmp/templates.app.js'
        }]
      }
    },
    useminPrepare: {
      html: 'app/*.{html,vm}',
      options: {
        staging: 'dist',
        dest: 'dist',
        flow: {
          steps: {
            js: ['concat', 'uglifyjs'], //default
            css: ['concat', 'cssmin'], //default
            locale: [{ //Usage example: <!--build:locale({.tmp,app}) scripts/locale/messages_${locale}.js-->
              name: 'concat',
              createConfig: function (context, block) {
                var path = require('path'), cfg = {files: []}, localeChains = {};
                context.inFiles.forEach(function (pattern) {
                  var expanded = grunt.file.expand(path.join(context.inDir, pattern.replace('${locale}', '*')));
                  expanded.forEach(function (file) {
                    var locale = file.match(pattern.replace('${locale}', '(.+)'))[1],
                      destFile = block.dest.replace('${locale}', locale);
                    localeChains[destFile] = localeChains[destFile] || [];
                    localeChains[destFile].push(file);
                  });
                });

                for (var destination in localeChains) {
                  cfg.files.push({dest: path.join(context.outDir, destination), src: localeChains[destination]});
                  context.outFiles.push(destination);
                }
                return cfg;
              }
            }]
          },
          post: {}
        }
      }
    },
    usemin: {
      html: ['dist/*.{html,vm}'],
      options: {
        assetsDirs: ['dist'],
        blockReplacements: {
          js: function (block) {
            var defer = block.defer ? 'defer ' : '';
            var async = block.async ? 'async ' : '';

            var original = '';

            for (var i = 0; i < block.src.length; i++) {
              if (block.src[i].indexOf('scripts/') === 0) {
                block.src[i] = block.src[i].replace('scripts/', '_debug/scripts/');
              }

              original += '<script ' + defer + async + 'src="' + block.src[i] + '"><\/script>' + '\n';
            }

            return '<!-- #if( !${debug} ) -->' + '\n' +
              '<script ' + defer + async + 'src="' + block.dest + '"><\/script>' + '\n' +
              '<!-- #else -->' + '\n' +
              original +
              '<!-- #end -->';
          },
          locale: function (block) {
            return '<script src="' + block.dest + '"></script>';
          }
        }
      }
    },
    velocityDebug: {
      dist: {
        options: {
          debug: 'dist/concat',
          prefix: 'concat'
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '**/*.vm',
          dest: 'dist'
        }]
      }
    },
    processTags: {
      dist: {
        options: {
          processors: {
            prefix: function (prefix) {
              return function (string) {
                string = string + '';
                if (string.indexOf(prefix) === 0 || string[0] === '$') {
                  return string;
                }
                if (string.match(/^([a-z]*:)?\/\//)) {
                  return string;
                }
                return prefix + string;
              };
            }
          }
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '**/*.{html,vm}',
          dest: 'dist'
        }]
      }
    },
    cdnify: {
      options: {
        cdn: require('wix-cdn-data')[options.cdnify]()
      },
      dist: {
        html: ['dist/**/*.vm']
      }
    }
  };
};