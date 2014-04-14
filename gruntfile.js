'use strict';

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'public/styles/stylesheets/styles.css': 'public/styles/sass/styles.scss'
        }
      }
    },


    jshint: {
      all: {
        src: ['gruntfile.js', 'server.js', 'app/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: true
        }
      }
    },


    nodemon: {
      dev: {
        cwd: __dirname,
        script: 'server.js',
        options: {
          ignore: ['node_modules/**'],
          env: {
            PORT: 3000
          },
          callback: function(nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            nodemon.on('config:update', function() {
              setTimeout(function() {
                require('open')('http://localhost:3000');
              }, 1000);
            });

            nodemon.on('restart', function() {
              setTimeout(function() {
                console.log('restarting...');
              }, 1000);
            });
          }
        }
      }
    },

    watch: {
      css: {
        files: ['public/styles/css/styles.css', 'public/styles/sass/styles.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      jade: {
        files: ['app/views/**'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      js: {
        files: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
        tasks: ['jshint'],
        options: {
          spawn: false,
          livereload: true
        }
      },
      server: {
        files: ['server.js', 'app/**/*.js', 'config/*.js'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },


    concurrent: {
      dev: {
        tasks: ['watch', 'jshint', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },


    mochaTest: {
      options: {
        reporter: 'spec',
        require: 'server.js'
      },
      src: ['test/mocha/**/*.js']
    },


    env: {
      test: {
        NODE_ENV: 'test'
      }
    }
  });
  
  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['sass', 'concurrent']);

  //Test task.
  grunt.registerTask('test', ['env:test', 'mochaTest']);
};