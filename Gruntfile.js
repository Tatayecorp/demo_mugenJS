module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            options: {
                configFile: 'eslint.json'
            },
            files: [
                'Gruntfile.js',
                'src/*.js'
            ]
        },
        browserify: {
            dist: {
                files: {
                    'dist/roundonejs_mugen_renderer.js': [
                        'src/player.js',
                        'src/resource.js',
                        'src/app.js'
                    ]
                }
            },
            options: {
                transform: [
                    ['babelify', {presets: 'es2015'}],
                    ['uglifyify']
                ],
                alias: {
                    'player': './src/player.js',
                    'resource': './src/resource.js',
                    'app': './src/app.js'
                }
            }
        }
    });

    // Load dependencies.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');

    // Default task(s).
    grunt.registerTask('test', ['eslint']);
    grunt.registerTask('default', ['eslint', 'browserify']);
};
