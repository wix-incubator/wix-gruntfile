'use strict';
module.exports = function () {
  return {
    replace: {
      dts: {
        src: ['dist/types.d.ts', 'dist/test/lib/**/*.d.ts'],
        overwrite: true,
        replacements: [{
          from: /^\/\/\/+\s(<reference path=).*$/mg,
          to: ''
        }, {
          from: /^\s*$/mg,
          to: ''
        }]
      }
    },
    concat: {
      dts: {
        src: ['.tmp/scripts/**/*.d.ts'],
        dest: 'dist/types.d.ts'
      }
    }
  };
};
