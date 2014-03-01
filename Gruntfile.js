module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        evil: true,
        forin: true,
        indent: 2,
        jquery: true,
        node: true,
        quotmark: 'single',
        undef: true,
        unused: false,
        trailing: true,
        globals: {
          _: true
        }
      },
      lib: ['*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    watch: {
      files: ['*.js', 'test/*'],
      tasks: 'test'
    }
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  // Register tasks.
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('test', ['default', 'karma']);

};
