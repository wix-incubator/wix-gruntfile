'use strict';

module.exports = function (grunt, options) {
  return {
    options: {
      livereload: options.livereload,
      nospawn: true
    },
    haml: {
      files: ['app/{views,modules}/**/*.haml'],
      tasks: ['haml', 'karma:unit:run']
    },
    svgFont: {
      files: ['app/images/svg-font-icons/*.*'],
      tasks: ['webfont', 'compass:server', 'autoprefixer']
    },
    html: {
      files: ['app/{views,modules}/**/*.html'],
      tasks: ['karma:unit:run']
    },
    replace: {
      files: ['app/**/*.vm'],
      tasks: ['replace:dist', 'copy:vm']
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
      tasks: ['ts', 'jsstyleIfEnabled', 'karma:unit:run']
    },
    es6: {
      files: ['{test,app/scripts,app/modules}/**/*.es6'],
      tasks: ['traceur', 'jsstyleIfEnabled', 'karma:unit:run']
    },
    compass: {
      files: ['app/{styles,modules}/**/*.{scss,sass}'],
      tasks: ['scssstyleIfEnabled', 'compass:server', 'autoprefixer']
    },
    styles: {
      files: ['app/{styles,modules}/**/*.css'],
      tasks: ['newer:copy:styles', 'autoprefixer']
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
