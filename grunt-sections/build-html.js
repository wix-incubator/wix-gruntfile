'use strict';

module.exports = function (grunt, options) {

  var cdnData;

  try {
    cdnData = require('wix-cdn-data')[options.cdnify]();
  } catch (e) {

  }

  function makeScriptTag(defer, async, crossOrigin, src) {
    return '<script ' + defer + async + 'src="' + src + '" ' + crossOrigin + '><\/script>';
  }

  function makeStyleTag(media, src) {
    return '<link rel="stylesheet" href="' + src + '"' + media + '>';
  }

  function makeOriginalOrBlock(original, block) {
    if (options.templateType === 'ejs') {
      return '' +
        '<% if( !debug ) { %>\n' +
        block + '\n' + 
        '<% } else { %>\n' + 
        original + 
        '\n<% } %>'
    } else {
      return '' +
        '<!-- #if( !${debug} ) -->\n' +
        block + '\n' +
        '<!-- #else -#if( false )#end->\n' +
        original +
        '<!-- #end -->';
    }
  }

  function originalTagsOnDebug(block, prefixes, fn) {
    var original = block.src.map(function (src) {
      var dst = prefixes.reduce(function (src, prefix) {
        return src.replace(new RegExp('^' + prefix + '/'), '_debug_' + prefix + '/');
      }, src);
      return fn(dst);
    }).join('\n');
    return makeOriginalOrBlock(original, fn(block.dest));
  }

  function originalScriptOnDebug(block) {
    var defer = block.defer ? 'defer ' : '';
    var async = block.async ? 'async ' : '';
    var crossOrigin = findCrossOriginAttribute(block);
    return originalTagsOnDebug(block, ['scripts', 'modules'], makeScriptTag.bind(undefined, defer, async, crossOrigin));
  }

  function originalCssOnDebug(block) {
    var media = block.media ? ' media="' + block.media + '"' : '';
    return originalTagsOnDebug(block, ['styles', 'modules'], makeStyleTag.bind(undefined, media));
  }

  function findCrossOriginAttribute(block) {
    var rgx = /<[\s\S]*crossorigin=["'](anonymous)["'][\s\S]*>/;
    var foundMatch = block.raw.some(function(entry) {
      return rgx.test(entry);
    });
    return foundMatch ? 'crossorigin="anonymous"' : '';
  }

  grunt.registerTask('styleInlineDistIfEnabled', function () {
    if (options.inline) {
      grunt.task.run(['copy:vmTmp', 'replace:wixStyleToBrackets', 'extractStyles:wixStyle', 'replace:wixStyleToCurlies', 'inline:wixStyle', 'copy:vmDist']);
    }
  });

  grunt.registerTask('styleInlineServeIfEnabled', function () {
    if (options.inline) {
      grunt.task.run(['replace:wixStyleToBrackets', 'extractStyles:wixStyle', 'replace:wixStyleToCurlies', 'copy:vm', 'inline:wixStyle']);
    }
  });

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
      },
      single: {
        options: {
          module: options.preloadModule,
          url: function (url) {
            return url.replace(/^(app\/|.tmp\/)/, '');
          },
          bootstrap: function (module, script) {
            var str = '';
            str += '\'use strict\';\n\n';
            str += 'try {\n';
            str += '  angular.module(\'' + module + '\');\n';
            str += '} catch (e) {\n';
            str += '  angular.module(\'' + module + '\', []);\n';
            str += '}\n\n';
            str += 'angular.module(\'' + module + '\').run([\'$templateCache\', function ($templateCache) {\n' + script + '}]);';
            return str;
          }
        },
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '{views,modules}/**/*.html',
          dest: '.tmp/',
          ext: '.html.js',
          extDot: 'last'
        }, {
          expand: true,
          cwd: 'app',
          src: '{views,modules}/**/*.html',
          dest: '.tmp/',
          ext: '.html.js',
          extDot: 'last'
        }]
      }
    },
    useminPrepare: {
      html: '{.tmp/manifests,app}/*.{html,vm,ejs}',
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
      html: ['dist/*.{html,vm,ejs}'],
      options: {
        assetsDirs: ['dist'],
        blockReplacements: {
          js: originalScriptOnDebug,
          css: originalCssOnDebug,
          locale: originalScriptOnDebug
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
                if (string.indexOf(prefix) === 0 || string[0] === '$' || string[0] === '<') {
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
          src: [
            '**/*.{html,vm,ejs}',
            '!bower_components/**/*'
          ],
          dest: 'dist'
        }]
      }
    },
    cdnify: {
      options: {
        cdn: cdnData
      },
      dist: {
        html: [
          'dist/**/*.{vm,ejs}',
          '!dist/bower_components/**/*'
        ]
      }
    },
    extractStyles: {
      wixStyle: {
        options: {
          pattern: /\[\[[^\]]+\]\]/,
          linkIdentifier: '?__wixStyleInline',
          remainSuffix: '.remain',
          extractedSuffix: '?__inline=true',
          usemin: true
        },
        files: [{
          expand: true,
          cwd: '.tmp/',
          dest: '.tmp/',
          src: '*.vm'
        }]
      }
    },
    inline: {
      wixStyle: {
        options: {
          exts: ['vm', 'html'],
          inlineTagAttributes: {
            style: 'wix-style'
          },
          cssmin: true
        },
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '*.{html,vm}',
          dest: '.tmp'
        }]
      }
    }
  };
};
