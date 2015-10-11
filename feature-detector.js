'use strict';

var glob = require('glob');

function isFeaturePresent(pattern) {
  return glob.sync(process.cwd() + pattern).length !== 0;
}

module.exports = {
  isTypescriptEnabled: function () {
    return isFeaturePresent('/{app/scripts,app/modules,test}/**/*.ts');
  },
  isTslintEnabled: function () {
    return isFeaturePresent('/tslint.json');
  },
  isTraceurEnabled: function () {
    return isFeaturePresent('/{app/scripts,app/modules,test}/**/*.es6');
  },
  isHamlEnabled: function () {
    return isFeaturePresent('/app/{views,modules}/**/*.haml');
  },
  isScssStyleEnabled: function () {
    return isFeaturePresent('/.scss-lint.yml');
  },
  isJshintEnabled: function () {
    return isFeaturePresent('/.jshintrc');
  },
  isTestInAppFolderEnabled: function () {
    return isFeaturePresent('/app/test/**/*.js');
  },
  isJscsEnabled: function () {
    return isFeaturePresent('/.jscsrc');
  }
};
