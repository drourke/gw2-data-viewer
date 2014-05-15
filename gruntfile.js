'use strict';

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: {
          'public/styles/css/styles.css': 'public/styles/sass/styles.scss'
        }
      }
    },
    jshint: {
      all: {
        src: ['gruntfile.js', 'server.js', 'app/**/*.js'],
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
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall'],
        options: {
          livereload: true
        }
      },
      css: {
        files: 'public/styles/sass/*.scss',
        tasks: ['sass'],
        options: {
          livereload: true
        }
      },
      jade: {
        files: ['app/views/**'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['gruntfile.js', 'server.js', 'app/**/*.js', 'public/js/**', 'test/**/*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      server: {
        files: ['server.js', 'app/**/*.js', 'config/*.js'],
        options: {
          livereload: true
        }
      }
    },
    concurrent: {
      dev: {
        tasks: [
          'watch', 
          'jshint', 
          'nodemon',
          'sass'
        ],
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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-install');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['concurrent']);

  //Test task.
  grunt.registerTask('test', ['env:test', 'mochaTest']);
};