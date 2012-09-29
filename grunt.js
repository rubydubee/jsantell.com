module.exports = function(grunt) {
  
  grunt.initConfig({
    stylus: {
      compile : {
        files : {
          'public/css/layout.css' : 'public/styles/*.styl'
        }
      }
    },
    cssmin : {
      dist : {
        src: [
          'public/css/normalize.css',
          'public/css/layout.css',
          'public/css/font-awesome.css',
          'public/css/prettify.css'
        ],
        dest: 'public/css/site.css'
      }
    },
    min : {
      dist : {
        src : 'public/js/site.js',
        dest : 'public/js/site.min.js'
      }
    },
    concat: {
      dist: {
        src: [
          'public/js/jquery.js',
          'public/js/jquery.sharrre.js',
          'public/js/jquery.tweet.js',
          'public/js/jquery.ghRepo.js',
          'public/js/prettify.js',
          'public/js/ui.js'
        ],
        dest: 'public/js/site.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-css');

  grunt.registerTask('default', 'stylus cssmin concat min');

};
