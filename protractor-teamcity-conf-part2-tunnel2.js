/* global process, exports, jasmine */
'use strict';

var config = require('./protractor-teamcity-conf').config;
var arrays = require('./protractor-teamcity-conf').arrays;

for (var i = 0 ; i < arrays.cap2.length ; i++) {
    var browser = arrays.cap2[i];
    browser['tunnel-identifier'] = process.env.BUILD_NUMBER + '2';
}

config.multiCapabilities = arrays.cap2;

exports.config = config;
