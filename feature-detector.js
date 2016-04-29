'use strict';

var glob = require('glob');

function isFeaturePresent(pattern) {
  return function () {
    return glob.sync(process.cwd() + pattern).length !== 0;
  };
}

module.exports = {
  isTypescriptEnabled:      isFeaturePresent('/{app/scripts,app/modules,test}/**/*.ts'),
  isTSConfigEnabled:        isFeaturePresent('/app/tsconfig.json'),
  isEslintEnabled:          isFeaturePresent('/.eslintrc'),
  isTslintEnabled:          isFeaturePresent('/tslint.json'),
  isTraceurEnabled:         isFeaturePresent('/{app/scripts,app/modules,test}/**/*.es6'),
  isHamlEnabled:            isFeaturePresent('/app/{views,modules}/**/*.haml'),
  isScssStyleEnabled:       isFeaturePresent('/.scss-lint.yml'),
  isJshintEnabled:          isFeaturePresent('/.jshintrc'),
  isTestInAppFolderEnabled: isFeaturePresent('/app/test/**/*.{js,ts}'),
  isJscsEnabled:            isFeaturePresent('/.jscsrc'),
  isVelocityEnabled:        isFeaturePresent('/velocity.data.js')
};
