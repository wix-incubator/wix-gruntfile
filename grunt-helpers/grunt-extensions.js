'use strict';

function isObject(v) {
	return v !== null && typeof v === 'object' && v.constructor !== Array;
}

function applyModifications(conf, partial) {
	for (var k in partial) {
		if (partial.hasOwnProperty(k)) {
			if (isObject(partial[k])) {
				conf[k] = conf[k] || {};
				applyModifications(conf[k], partial[k]);
			} else {
				conf[k] = partial[k];
			}
		}
	}
}

module.exports = function (grunt, options) {
	grunt.hookTask = function (name) {
		var hooked = name + '(hooked' + Math.floor(Math.random() * 10000) + ')';
		var arr = [hooked];
		grunt.renameTask(name, hooked);
		grunt.registerTask(name, arr);
		var hookedCfgPath = hooked.replace(/:/g, '.');
		var nameCfgPath = name.replace(/:/g, '.');
		grunt.config.set(hookedCfgPath, grunt.config.getRaw(nameCfgPath));
		return arr;
	};

	grunt.modifyTask = function (what, how) {
		var conf = grunt.config(what);
		if (typeof how === 'function') {
			conf = how.call(conf, conf) || conf;
		} else {
			applyModifications(conf, how);
		}
		grunt.config(what, conf);
	};
};