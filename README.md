### wix-gruntfile

## Installation

`npm install --save-dev wix-gruntfile`

Create your own `Gruntfile.js` which uses `wix-gruntfile`:

```js
'use strict';

module.exports = function (grunt) {
  require('wix-gruntfile')(grunt, {
    staging: 'pizza',
    port: 9000,
    preloadModule: 'newsFeedCommon',
    translationsModule: 'wixNewsFeedTranslations',
    unitTestFiles: [
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'app/bower_components/es5-shim/es5-shim.js',
      ...
    ]
  });

  // optionally add custom configurations using:
  // grunt.loadNpmTasks(), grunt.config(), grunt.registerTask()

  // optionally hook into existing tasks using:
  // grunt.renameTask('existing', 'hooked');
  // grunt.registerTask('exisitng', ['new', 'hooked']);
};
```

## Run project

`grunt serve` will watch your files and automatically compile, lint, unit test and display in browser

While `grunt serve` is running, debug unit tests at http://localhost:8880/ and debug end to end test at http://localhost:9000/runner.html

When working on coverage improvements run `grunt serve:coverage` (unit tests are difficult to debug in this mode)

## Build the project locally (rarely needed):

`grunt build` will run the complete build process including e2e tests (only on chrome)

`grunt serve:dist` will serve the `dist` folder so you can see the app after build (good for debugging minification issues)

## Build the project in CI:

`grunt build:ci` jshint warning will cause failure, karma teamcity reporter will be enabled

`grunt test:ci` run e2e tests on sauce labs (make sure you have a sauce labs tunnel running in the background)

