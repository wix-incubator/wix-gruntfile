'use strict';

module.exports = function (grunt, options) {
  return {
    options: {
      livereload: options.livereload,
      nospawn: true
    },
    haml: {
      files: ['app/{views,modules}/**/*.haml'],
      tasks: ['newer:haml', 'newer:ngtemplates:single', 'karma:unit:run']
    },
    svgFont: {
      files: ['app/images/svg-font-icons/*.*'],
      tasks: ['webfont', 'compass:server', 'autoprefixerIfEnabled']
    },
    html: {
      files: ['app/{views,modules}/**/*.html'],
      tasks: ['newer:ngtemplates:single', 'karma:unit:run']
    },
    replace: {
      files: ['app/**/*.vm'],
      tasks: ['replace:dist', 'styleInlineServeIfEnabled', 'copy:vm']
    },
    replaceConf: {
      files: ['replace.conf.js', 'replace.private.conf.js'],
      tasks: ['replace:dist', 'copy:vm'],
      options: {reload: true}
    },
    locale: {
      files: ['app/scripts/**/locale/**/*.*'],
      tasks: ['jsonAngularTranslate', 'jsstyleIfEnabled', 'karma:unit:run']
    },
    experiments: {
      files: ['app/petri-experiments/*.json'],
      tasks: ['petriExperiments']
    },
    test: {
      files: [
        'app/{scripts,modules}/**/*.js',
        'test/**/*.js',
        'karma.conf.js',
        '!test/spec/e2e/**/*.js',
        '!test/e2e/**/*.js'
      ],
      tasks: ['jsstyleIfEnabled', 'karma:unit:run']
    },
    ts: {
      files: ['{test,app/scripts,app/modules}/**/*.ts'],
      tasks: ['jsstyleIfEnabled', 'tsWithHack:copy', 'karma:unit:run'],
      options: {
        event: ['changed', 'added']
      }
    },
    tsDelete: {
      files: ['{test,app/scripts,app/modules}/**/*.ts'],
      tasks: ['clean:ts', 'tsWithHack:copy', 'karma:unit:run'],
      options: {
        event: ['deleted']
      }
    },
    es6: {
      files: ['{test,app/scripts,app/modules}/**/*.es6'],
      tasks: ['jsstyleIfEnabled', 'traceur', 'karma:unit:run']
    },
    compass: {
      files: ['app/{styles,modules}/**/*.{scss,sass}'],
      tasks: ['scssstyleIfEnabled', 'compass:server', 'autoprefixerIfEnabled', 'replace', 'styleInlineServeIfEnabled', 'copy:vm']
    },
    styles: {
      files: ['app/{styles,modules}/**/*.css'],
      tasks: ['newer:copy:styles', 'styleInlineServeIfEnabled', 'autoprefixerIfEnabled']
    },
    gruntfile: {
      files: ['Gruntfile.js']
    },
    livereload: {
      files: [
        'app/**/*.html',
        'app/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
      ]
    }
  };
};
