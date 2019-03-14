requirejs.config({
    baseUrl: 'static/devsite/js/lib',
    paths: {
        scripts: '../scripts' // (key, value) corresponds to (module name, module path)
    }
});

requirejs(['scripts/base']); // loads and thus executes terminal.js
