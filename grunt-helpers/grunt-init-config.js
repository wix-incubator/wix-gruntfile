'use strict';
var extend = require('util')._extend;

module.exports = function (grunt, options) {
	var convertTsConfig = require('../grunt-sections/convert-tsconfig')(grunt);
	grunt.initConfig({
		yeoman:                 require('../grunt-sections/flow')(grunt, options).yeoman,
		clean:                  extend(require('../grunt-sections/flow')(grunt, options).clean, convertTsConfig.clean),

		jshint:                 require('../grunt-sections/codestyle')(grunt, options).jshint,
		tslint:                 require('../grunt-sections/codestyle')(grunt, options).tslint,
		jscs:                   require('../grunt-sections/codestyle')(grunt, options).jscs,
		scsslint:               require('../grunt-sections/codestyle')(grunt, options).scsslint,

		autoprefixer:           require('../grunt-sections/transform-css')(grunt, options).autoprefixer,
		compass:                require('../grunt-sections/transform-css')(grunt, options).compass,
		sass:                   require('../grunt-sections/transform-css')(grunt, options).sass,
		traceur:                require('../grunt-sections/transform-js')(grunt, options).traceur,
		ts:                     require('../grunt-sections/transform-js')(grunt, options).typescript,
		replace:                extend(require('../grunt-sections/transform-html')(grunt, options).replace,
																		extend(require('../grunt-sections/export-dts')(grunt, options).replace, convertTsConfig.replace)),
		haml:                   require('../grunt-sections/transform-html')(grunt, options).haml,
		velocity:               require('../grunt-sections/transform-html')(grunt, options).velocity,

		petriExperiments:       require('../grunt-sections/generators')(grunt, options).petriExperiments,
		manifestPackager:       require('../grunt-sections/generators')(grunt, options).manifestPackager,
		jsonAngularTranslate:   require('../grunt-sections/generators')(grunt, options).translations,
		webfontIfEnabled:       require('../grunt-sections/generators')(grunt, options).webfontIfEnabled,
		webfont:                require('../grunt-sections/generators')(grunt, options).webfont,

		watch:                  require('../grunt-sections/watch')(grunt, options),
		connect:                require('../grunt-sections/connect')(grunt, options),

		imagemin:               require('../grunt-sections/minify')(grunt, options).imagemin,
		svgmin:                 require('../grunt-sections/minify')(grunt, options).svgmin,
		ngAnnotate:             require('../grunt-sections/minify')(grunt, options).ngAnnotate,
		uglify:                 require('../grunt-sections/minify')(grunt, options).uglify,
		cssmin:                 require('../grunt-sections/minify')(grunt, options).cssmin,

		useminPrepare:          require('../grunt-sections/build-html')(grunt, options).useminPrepare,
		usemin:                 require('../grunt-sections/build-html')(grunt, options).usemin,
		velocityDebug:          require('../grunt-sections/build-html')(grunt, options).velocityDebug,
		processTags:            require('../grunt-sections/build-html')(grunt, options).processTags,
		cdnify:                 require('../grunt-sections/build-html')(grunt, options).cdnify,
		ngtemplates:            require('../grunt-sections/build-html')(grunt, options).ngtemplates,
		extractStyles:          require('../grunt-sections/build-html')(grunt, options).extractStyles,
		inline:                 require('../grunt-sections/build-html')(grunt, options).inline,

		release:                require('../grunt-sections/flow')(grunt, options).release,
		copy:                   extend(require('../grunt-sections/flow')(grunt, options).copy, convertTsConfig.copy),

		karma:                  require('../grunt-sections/test-runners')(grunt, options).karma,
		protractor:             require('../grunt-sections/test-runners')(grunt, options).protractor,
		concat:                 extend(require('../grunt-sections/export-dts')(grunt, options).concat, convertTsConfig.concat),
		remapIstanbul:          require('../grunt-sections/remap')(grunt, options).remapIstanbul
	});
};