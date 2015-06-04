'use strict';

var glob = require('glob');

function isFeaturePresent(pattern) {
  return glob.sync(process.cwd() + pattern).length !== 0;
}

module.exports = {
  isTypescriptEnabled: function () {
    return isFeaturePresent('/app/scripts/*.ts') || isFeaturePresent('/app/modules/*.ts');
  },
  isTslintEnabled: function () {
    return isFeaturePresent('/tslint.json');
  },
  isTraceurEnabled: function () {
    return isFeaturePresent('/app/scripts/*.es6') || isFeaturePresent('/app/modules/*.es6');
  },
  isHamlEnabled: function () {
    return isFeaturePresent('/app/views/**/*.haml');
  },
  isScssStyleEnabled: function () {
    return isFeaturePresent('/.scss-lint.yml');
  },
  isJshintEnabled: function () {
    return isFeaturePresent('/.jshintrc');
  },
  isJscsEnabled: function () {
    return isFeaturePresent('/.jscsrc');
  }
};
