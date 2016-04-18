module.exports = function(grunt) {

  grunt.initConfig({
    concurrent: {
      debug_integration: ['node-inspector', 'open:debug','shell:integrate_debug'],
      options: {
        logConcurrentOutput: true
      }
    },
    'node-inspector': { dev: {} },
    jshint: {
      all: ['index.js', 'lib/**/*.js', 'test/**/**/*.js']
    },
    open: {
      debug: {
        path: 'http://127.0.0.1:8080/debug?port=5858',
        app: 'Google Chrome'
      }
    },
    shell: {
      integrate_debug : './node_modules/mocha/bin/mocha --debug-brk -A -u exports --recursive -t 25000 ./test/integration '
    },
    unit: ['export SP_USERNAME="foo"; export SP_PASSWORD="foo"; export SP_AUTH_TYPE="basic"; export SP_HOST="https://www.example.com"', './node_modules/mocha/bin/mocha -A -u exports --recursive -t 10000 ./test/unit'],
    integrate : ['./node_modules/mocha/bin/mocha -A -u exports --recursive -t 25000 ./test/integration ']
  });

  grunt.loadNpmTasks('grunt-fh-build');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-shell');
  grunt.registerTask('test', ['jshint', 'fh:unit']);
  grunt.registerTask('integration', ['fh:integrate']);
  grunt.registerTask('dist', ['test', 'fh:dist']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('debug_integration','concurrent:debug_integration');
};
