# wix-gruntfile

Customizable Gruntfile built to work with wix-angular projects

## Installation

No installation needed in case you scaffold using `yo wix-angular`

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
    karmaConf: require('./karma.conf.js')
  });

  // keep reading for instructions on how to add custom stuff to your grunt
};
```

## Run project

`grunt serve` will watch your files and automatically compile, lint, unit test and display in browser

While `grunt serve` is running, debug unit tests at http://localhost:8880/ and debug end to end test at http://localhost:9000/runner.html

When working on coverage improvements run `grunt serve:coverage` (unit tests are difficult to debug in this mode) or alternatively run `grunt test` to run all unit tests one time with coverage.

## Run e2e tests

Launch e2e test by running `grunt test:e2e`. Make sure that `grunt serve` is running.

### Run e2e tests from IDE

You can run and debug protractor tests directly from your IDE (Intellij/Webstorm).

To set the configuration, follow the [instructions from protractor docs](https://github.com/angular/protractor/blob/master/docs/debugging.md#setting-up-webstorm-for-debugging).

### Build the project locally:

`grunt build` will run the complete build process including e2e tests (only on chrome)

`grunt serve:dist` will serve the `dist` folder so you can see the app after build (good for debugging minification issues) and you can run protractor tests against it with `grunt test:e2e`

### Build the project in CI:

`grunt build:ci` jshint warning will cause failure, karma teamcity reporter will be enabled

`grunt test:ci` run e2e tests on sauce labs (make sure you have a sauce labs tunnel running in the background)

## Configuration

Here is a list of available options:

```js
{
  port: 9000,                              //port used for local server
  livereload: 35729,                       //port used for livereload server
  preloadModule: 'myAppInternal',          //module name for preload html
  translationsModule: 'myAppTranslations', //module name for translation js
  svgFontName: 'my-app',                   //font name for svg icons
  karmaConf: require('./karma.conf.js'),   //inheriting your karma config
  protractor: true                         //should run e2e tests
  proxies: {}, //add more proxies to your connect server: `{'/_test/': 'http://www.wix.com/', ...}`
  beforeProxies: {}, //same as above, only it insert the proxy at the beginning of the list
  suppressVerifyNpmScripts: false, // if true, will suppress package.json scripts section modifications.
  useModulesStructure: false // if true, will assume project uses a modular file structure (see below for an elaboration)
}
```

Note: you can add your own connect plugins by passing function value in the proxy maps.

##Modular file structure
The basic configuration assumes you are using a traditional file structure, where all the controllers are stored in the "controllers" directory, services are in "services" directory and so on.
If you wish to use a modular file structure, storing each module's scripts, styles and views in the same folder, you can do so by passing 'useModulesStructure: true' to the configuration object.

A further explanation can be found [here](MODULES.md)

## Modifying existing config

Sometimes you will want to modify the configuration of a specific section in the external Gruntfile.

```js
//this is a recursive modification, meaning it overrides only properties that are not objects
grunt.modifyTask('task-name', {options: {someOptionObj: {someOptionProperty: 'someValue'}}});

//this does the same as the modification above, but obviously is can do a lot more
grunt.modifyTask('task-name', function (task) {
  task.options = task.options || {};
  task.someOptionObj = task.someOptionObj || {};
  task.someOptionObj.someOptionProperty = 'someValue';
  return task;
});
```

Or maybe even add your own configuration section to the build process

```js
grunt.loadNpmTasks('some-new-grunt-plugin');
grunt.config('some-new-grunt-plugin', {whatever: 'whatever'});
//insert your task after an existing task
grunt.hookTask('existing-task').push('some-new-grunt-plugin');
//or insert it before the existing task
grunt.hookTask('existing-task').unshift('some-new-grunt-plugin');
```

## Common overrides

Do not fail build in case jshint/jscs/scsslint is failing. This should be used only in rare cases when refactoring old code!
```js
grunt.hookTask('pre-build').unshift('ignore-code-style-checks');
```

Override the url that opens in the dashboard when you run `grunt serve`:
```js
grunt.modifyTask('yeoman', {local: 'http://localhost:9000/'});
```

Override the proxied url for _api calls:
```js
grunt.modifyTask('yeoman', {api: 'http://www.wix.com/_api/'});
```

Override the proxied url for _api calls in e2e tests:
```js
grunt.modifyTask('yeoman', {e2eTestServer: 'http://localhost:3333/'});
```

Override sauce labs configuration:
```js
process.env.SAUCE_USERNAME = 'shahata';
process.env.SAUCE_ACCESS_KEY = 'xxx';
process.env.SAUCE_BROWSERS = 'Chrome FF IE10 IE11';
```

Add private grunt file that overrides stuff you don't want to commit:
```js
try {
  require('./Gruntfile.private.js')(grunt); //override stuff locally
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw (err);
  }
}
```

## WixStyle inline
To enable the wixStyle inline feature, `inline` property of the Gruntfile options should be `true`.

Common use of the inline:
####index.vm
```html
<!-- process-tags prefix('${baseStaticUrl}') -->
<!-- build:css({.tmp,app}) styles/main.css -->
<!-- endbuild -->
<!-- end-process-tags -->
<link rel="stylesheet" href="styles/mixed-css-file-with-wix-params.css?__wixStyleInline=inline.css" />
```
**Notes:**

1. `wixStyleInline` task will add the `remain` file to the concat of the first **CSS** usemin block, The VM file should have at least one usemin css block, otherwise the remain file will not concatenated & minified.
2. The task will extract wix style params from `mixed-css-file-with-wix-params.css` and generate 2 files: `inline.css`(the file that will be inlined) and `mixed-css-file-with-wix-params.remain.css`(the file that will be minified & concatenated)
3. Wix style implements **fonts** as malformed CSS declaration (`{{Body-M}};`, without attribute). 
In order to keep POSTCSS parser intact, you should add a `font` attribute and semicolon before the wix style param, something like `font:;{{Body-M}};`- this is valid wix style param, and the parser will not break on it. 
The extractStyles task will eventually convert it to `{{Body-M}};`.
