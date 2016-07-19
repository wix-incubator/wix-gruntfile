'use strict';

module.exports = function (grunt, options) {
  var changedFiles = [], lrserver;
  grunt.registerTask('livereloadServer', function () {
    lrserver = require('tiny-lr')({
      errorListener: function (err) {
        grunt.fatal('Failed to start livereload: ' + err);
      }
    });
    lrserver.listen(options.livereload);
    grunt.event.on('watch', function (status, filepath) {
      changedFiles.push(filepath);
    });
  });
  grunt.registerTask('triggerLivereload', function () {
    if (changedFiles.length) {
      lrserver.changed({body: {files: changedFiles}});
      changedFiles = [];
    }
  });

  var config = {
    options: {
      nospawn: true
    },
    haml: {
      files: ['app/{views,modules}/**/*.haml'],
      tasks: ['newer:haml', 'newer:ngtemplates:single', 'triggerLivereload', 'runKarma']
    },
    svgFont: {
      files: ['app/images/svg-font-icons/*.*'],
      tasks: ['webfont', 'compass:server', 'autoprefixerIfEnabled', 'triggerLivereload']
    },
    html: {
      files: ['app/{views,modules}/**/*.html'],
      tasks: ['newer:ngtemplates:single', 'triggerLivereload', 'runKarma']
    },
    replaceOrVelocity: {
      files: ['app/**/*.vm'],
      tasks: ['replaceOrVelocity', 'styleInlineServeIfEnabled', 'newer:copy:vm', 'triggerLivereload']
    },
    replaceOrVelocityConf: {
      files: ['replace.*.js', 'velocity.*.js'],
      tasks: ['replaceOrVelocity', 'newer:copy:vm', 'triggerLivereload'],
      options: {reload: true}
    },
    ejs: {
      files: ['app/**/*.ejs'],
      tasks: ['ejs', 'triggerLivereload']
    },
    locale: {
      files: ['app/scripts/**/locale/**/*.*'],
      tasks: ['newer:jsonAngularTranslate', 'jsstyleIfEnabled', 'triggerLivereload', 'runKarma']
    },
    experiments: {
      files: ['app/petri-experiments/*.json'],
      tasks: ['newer:petriExperiments', 'triggerLivereload']
    },
    test: {
      files: [
        'app/{scripts,modules,test}/**/*.js',
        'test/**/*.js',
        'karma.conf.js',
        '!test/spec/e2e/**/*.js',
        '!test/e2e/**/*.js'
      ],
      tasks: ['babelIfEnabled', 'jsstyleIfEnabled', 'triggerLivereload', 'runKarma']
    },
    ts: {
      files: ['{test,app/scripts,app/modules,app/test}/**/*.ts', 'app/tsconfig.json'],
      tasks: ['jsstyleIfEnabled', 'tsWithHack:copy', 'triggerLivereload', 'runKarma'],
      options: {
        event: ['changed', 'added']
      }
    },
    tsDelete: {
      files: ['{test,app/scripts,app/modules}/**/*.ts'],
      tasks: ['clean:ts', 'tsWithHack:copy', 'triggerLivereload', 'runKarma'],
      options: {
        event: ['deleted']
      }
    },
    compass: {
      files: ['app/{styles,modules}/**/*.{scss,sass}'],
      tasks: ['scssstyleIfEnabled', 'compass:server', 'autoprefixerIfEnabled', 'replaceOrVelocity', 'styleInlineServeIfEnabled', 'newer:copy:vm', 'triggerLivereload']
    },
    styles: {
      files: ['app/{styles,modules}/**/*.css'],
      tasks: ['newer:copy:styles', 'styleInlineServeIfEnabled', 'autoprefixerIfEnabled', 'triggerLivereload']
    },
    gruntfile: {
      files: ['Gruntfile.js'],
      tasks: ['triggerLivereload']
    },
    livereload: {
      files: [
        'app/**/*.html',
        'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
      ],
      tasks: ['triggerLivereload']
    }
  };

  if (options.useNodeSass) {
    config.sass = {
      files: ['app/{styles,modules}/**/*.{scss,sass}'],
      tasks: ['scssstyleIfEnabled', 'sass', 'autoprefixerIfEnabled', 'replaceOrVelocity', 'styleInlineServeIfEnabled', 'newer:copy:vm', 'triggerLivereload']
    };

    config.compass.files = ['app/{styles,modules}/**/*.compass.{scss,sass}'];

  }
  return config;
};
