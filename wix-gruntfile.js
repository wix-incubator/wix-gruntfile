'use strict';

module.exports = function (grunt, options) {
  options = require('./grunt-helpers/grunt-options')(grunt, options);
  require('./grunt-helpers/grunt-overrides-npm')(grunt, options);
  require('./grunt-helpers/grunt-overrides-pom')(grunt, options);
  require('./grunt-helpers/grunt-load')(grunt, options);
  require('./grunt-helpers/grunt-init-config')(grunt, options);
  require('./grunt-helpers/grunt-extensions.js')(grunt, options);
  require('./grunt-helpers/grunt-register')(grunt, options);
  require('./grunt-helpers/grunt-migrations.js')(grunt, options);
  require('./grunt-helpers/grunt-friendly-log.js')(grunt, options);
};
