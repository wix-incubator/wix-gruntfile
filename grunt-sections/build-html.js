'use strict';

module.exports = function (grunt, options) {
  function makeScriptTag(defer, async, src) {
    return '<script ' + defer + async + 'src="' + src + '"><\/script>';
  }

  function makeStyleTag(media, src) {
    return '<link rel="stylesheet" href="' + src + '"' + media + '>';
  }

  function makeOriginalOrBlock(original, block, additions) {
    return '' +
      '<!-- #if( !${debug} ) -->\n' +
      block + '\n' +
      '<!-- #else -#if( false )#end->\n' +
      original +
      '<!-- #end -->' +
      additions;
  }

  function originalTagsOnDebug(block, prefix, fn, additions) {
    var original = block.src.map(function (src) {
      return fn(src.replace(new RegExp('^' + prefix + '/'), '_debug_' + prefix + '/'));
    }).join('\n');
    return makeOriginalOrBlock(original, fn(block.dest), additions);
  }

  function originalScriptOnDebug(block) {
    var defer = block.defer ? 'defer ' : '';
    var async = block.async ? 'async ' : '';
    return originalTagsOnDebug(block, 'scripts', makeScriptTag.bind(undefined, defer, async), '');
  }

  function originalCssOnDebug(block) {
    var media = block.media ? ' media="' + block.media + '"' : '';
    return originalTagsOnDebug(block, 'styles', makeStyleTag.bind(undefined, media), '');
  }

  function originalMixedCssOnDebug(block) {
    var media = block.media ? ' media="' + block.media + '"' : '';
    var additions = getStyleTagsInBlock(block);
    return originalTagsOnDebug(block, 'styles', makeStyleTag.bind(undefined, media), additions);
  }

  function getStyleTagsInBlock(block) {
    var styleTags = '';
    var openTag = /<style[^>]*?>/g;
    var closeTag = /<\/style>/g;
    var isOpen = false;

    for (var i = 1; i < block.raw.length - 1; i++) {
      var line = block.raw[i];
      if (!isOpen && openTag.test(line)) {
        styleTags += "\n" + line;
        isOpen = true;
      }
      else if (isOpen) {
        styleTags += line;
      }
      else if (isOpen && closeTag.test(line)) {
        styleTags += line;
        isOpen = false;
      }
    }
    return styleTags;
  }

  grunt.registerTask('inlineDistIfEnabled', function () {
    if(options.inline) {
      grunt.task.run(['copy:vmTmp', 'extractStyles:wixStyle', 'inline:wixStyle', 'copy:vmDist']);
    }
  });

  grunt.registerTask('inlineServeIfEnabled', function () {
    if(options.inline) {
      grunt.task.run(['extractStyles:wixStyle', 'inline:wixStyle']);
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
            mixedCss: [{
              name: 'concat',
              createConfig: function (context, block) {
                var path = require('path');
                var cfg = {
                  files: []
                };

                var outfile = path.join(context.outDir, block.dest);

                // Depending whether or not we're the last of the step we're not going to output the same thing
                var files = {};
                files.dest = outfile;
                files.src = [];
                context.inFiles.forEach(function (f) {
                  var index;
                  if ((index = f.indexOf('?__extractStyles')) > -1) {
                    f = f.substr(0, index);
                    f = f.replace('.css', '_remain.css');
                  }
                  files.src.push(path.join(context.inDir, f));
                });
                cfg.files.push(files);
                context.outFiles = [block.dest];

                return cfg;
              }
            }, 'cssmin'],
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
          js: originalScriptOnDebug,
          css: originalCssOnDebug,
          mixedCss: originalMixedCssOnDebug,
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
    },
    extractStyles: {
      wixStyle: {
        options: {
          pattern: /\[\[[^\]]+\]\]/,
          preProcess: function (css) {
            // wix tpa params uses {{}}, this breaks the parsers. convert them to [[]].
            var ret = css.replace(/font: ?; ?{{([^}]+)}};/g, 'font: [[$1]];');
            ret = ret.replace(/{{([^}]+)}}/g, '[[$1]]');
            return ret;
          },
          postProcess: function (css) {
            // wix tpa params uses {{}}, convert back the [[]] to {{}}.
            var ret = css.replace(/font: \[\[([^\]]+)\]\];/g, '{{$1}};');
            ret = ret.replace(/\[\[([^\]}]+)\]\]/g, '{{$1}}');
            return ret;
          }
        },
        files: [{
          expand: true,
          cwd: '.tmp/',
          dest: '.tmp/',
          src: '*.{html,vm}'
        }]
      }
    },
    inline: {
      wixStyle: {
        options: {
          exts: ['vm', 'html'],
          inlineTagAttributes: {
            style: 'wix-style'
          }
        },
        files: [{
          expand: true,
          cwd: '.tmp',
          dest: '.tmp',
          src: '*.{html,vm}'
        }]
      }
    }
  };
};