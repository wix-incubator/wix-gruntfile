'use strict';

module.exports = function (grunt, options) {
  if (options.enableAngularMigration) {
    require('../grunt-sections/angular-migration')(grunt, options).addMigration();
  }
};
