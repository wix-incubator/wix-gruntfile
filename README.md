### wix-gruntfile

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

