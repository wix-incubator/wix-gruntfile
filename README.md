# wix-gruntfile

Customizable Gruntfile built to work with wix-angular projects

## Installation

No installtion needed in case you scaffold using `yo wix-angular`

Otherwise - `npm install --save-dev wix-gruntfile`

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

### Run e2e tests

Open terminal and run `sudo webdriver-manager start` (move to background and leave running). This will start up the Selenium server.

Launch e2e test by `protractor protractor-conf.js`. Make sure that `grunt serve` is running.

### Build the project locally (rarely needed):

`grunt build` will run the complete build process including e2e tests (only on chrome)

`grunt serve:dist` will serve the `dist` folder so you can see the app after build (good for debugging minification issues)

### Build the project in CI:

`grunt build:ci` jshint warning will cause failure, karma teamcity reporter will be enabled

`grunt test:ci` run e2e tests on sauce labs (make sure you have a sauce labs tunnel running in the background)

## Configuration

Here is a list of available options:

```js
{
  protocol: 'http', //the protocol used for working locally (http/https)
  staging: 'pizza', //the staging environment used locally (local.pizza.wixpress.com)
                    //don't forget to add it to your hosts file
  port: 9000, //port used for local server
  livereload: 35729, //port used for livereload server (important for when running multiple grunts)
  translationsModule: 'wixAppTranslations', //module name used for translations
                                            //don't forget to add module dependency for this
  unitTestFiles: [],  //files you want to add to unit tests loader (in addition to your sources)
  karmaTestFiles: null, //roll your own unit test file list (wix-gruntfile will not add anything)
  page: '', //name of page to open: http://local.{staging}.wixpress.com:{port}/{page}
  protractor: true, //whether to use protractor or fallback to angular scenario
  proxies: {} //add more proxies to your connect server: `{'/_test/': 'http://www.wix.com/', ...}`
}
```
