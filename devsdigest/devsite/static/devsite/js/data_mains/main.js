requirejs.config({
    baseUrl: 'static/devsite/js/lib',
    paths: {
        scripts: '../scripts' // (key, value) corresponds to (module name, module path)
    }
});

requirejs(['scripts/terminal']);
