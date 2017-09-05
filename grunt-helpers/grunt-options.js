'use strict';

var extend = require('util')._extend;

module.exports = function (grunt, options) {
  options = extend({
    version : '0.0.0',
    cdnify : 'http',
    protocol : 'http',
    staging : 'pizza',
    subdomain : 'www',
    port : 9000,
    livereload : 35729,
    translationsModule : 'wixAppTranslations',
    unitTestFiles : [],
    karmaTestFiles : null,
    karmaConf : null,
    appFirst : true,
    page : '',
    protractor : false,
    proxies : {},
    beforeProxies : {},
    bowerComponent : false,
    useModulesStructure : false,
    svgFontName : null,
    autoprefixer : true,
    inline : false,
    enableAngularMigration : false,
    useNodeSass : false,
    suppressVerifyNpmScripts : false,
    babelEnabled: false
  }, options);


  if (options.version.split('.')[0] > 0) {
    options.cdnify = 'vm';
  }

  if (!options.preloadModule) {
    options.preloadModule = options.translationsModule || 'wixAppPreload';
  }

  if (options.karmaConf) {
    options.karmaConf({
      set : function (karmaConf) {
        options.karmaConf = {
          files : karmaConf.files.filter(function (value) {
            return typeof value !== 'string' || value.indexOf('bower_component') !== -1;
          }),
          proxies : karmaConf.proxies
        };
      }
    });
  } else {
    options.karmaConf = {files : options.unitTestFiles};
  }

  return options;
};
