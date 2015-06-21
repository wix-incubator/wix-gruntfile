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

  return {
    options: {
      nospawn: true
    },
    haml: {
      files: ['app/{views,modules}/**/*.haml'],
      tasks: ['newer:haml', 'newer:ngtemplates:single', 'triggerLivereload', 'karma:unit:run']
    },
    svgFont: {
      files: ['app/images/svg-font-icons/*.*'],
      tasks: ['webfont', 'compass:server', 'autoprefixerIfEnabled', 'triggerLivereload']
    },
    html: {
      files: ['app/{views,modules}/**/*.html'],
      tasks: ['newer:ngtemplates:single', 'triggerLivereload', 'karma:unit:run']
    },
    replace: {
      files: ['app/**/*.vm'],
      tasks: ['replace:dist', 'styleInlineServeIfEnabled', 'newer:copy:vm', 'triggerLivereload']
    },
    replaceConf: {
      files: ['replace.conf.js', 'replace.private.conf.js'],
      tasks: ['replace:dist', 'newer:copy:vm', 'triggerLivereload'],
      options: {reload: true}
    },
    locale: {
      files: ['app/scripts/**/locale/**/*.*'],
      tasks: ['newer:jsonAngularTranslate', 'jsstyleIfEnabled', 'triggerLivereload', 'karma:unit:run']
    },
    experiments: {
      files: ['app/petri-experiments/*.json'],
      tasks: ['newer:petriExperiments', 'triggerLivereload']
    },
    test: {
      files: [
        'app/{scripts,modules}/**/*.js',
        'test/**/*.js',
        'karma.conf.js',
        '!test/spec/e2e/**/*.js',
        '!test/e2e/**/*.js'
      ],
      tasks: ['jsstyleIfEnabled', 'triggerLivereload', 'karma:unit:run']
    },
    ts: {
      files: ['{test,app/scripts,app/modules}/**/*.ts'],
      tasks: ['jsstyleIfEnabled', 'tsWithHack:copy', 'triggerLivereload', 'karma:unit:run'],
      options: {
        event: ['changed', 'added']
      }
    },
    tsDelete: {
      files: ['{test,app/scripts,app/modules}/**/*.ts'],
      tasks: ['clean:ts', 'tsWithHack:copy', 'triggerLivereload', 'karma:unit:run'],
      options: {
        event: ['deleted']
      }
    },
    es6: {
      files: ['{test,app/scripts,app/modules}/**/*.es6'],
      tasks: ['jsstyleIfEnabled', 'traceur', 'triggerLivereload', 'karma:unit:run']
    },
    compass: {
      files: ['app/{styles,modules}/**/*.{scss,sass}'],
      tasks: ['scssstyleIfEnabled', 'compass:server', 'autoprefixerIfEnabled', 'replace', 'styleInlineServeIfEnabled', 'newer:copy:vm', 'triggerLivereload']
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
};
