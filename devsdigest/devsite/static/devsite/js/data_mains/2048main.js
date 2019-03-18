requirejs.config({
    shim: {
      underscore: {
        exports: '_'
      }
    },
    baseUrl: 'static/devsite/js/lib',
    paths: {
        scripts: '../scripts', // (key, value) corresponds to (module name, module path)
        underscore: 'underscore_min'
    }
});

requirejs(['scripts/2048']); // var test = require("scripts/2048"); for testing on console
// Also require and requirejs are the same object, doesn't matter which one you use
