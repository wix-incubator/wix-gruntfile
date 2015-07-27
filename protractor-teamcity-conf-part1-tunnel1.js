/* global process, exports, jasmine */
'use strict';

var config = require('./protractor-teamcity-conf').config;
var arrays = require('./protractor-teamcity-conf').arrays;


config.multiCapabilities = arrays.cap1;

exports.config = config;
