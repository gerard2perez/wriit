module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dev: {
				options: {
					browserifyOptions: {
						debug: true
					},
					transform: [
						["babelify"],
						//["uglifyify"]
					]
				},
				files: {
					"dist/wriit.js": ["src/*.js"]
				}
			},
			dist: {
				options: {
					transform: [
                  ["babelify", {
							compact: false,
							modules: "amd",
							moduleIds: true,
							sourceMap: true
                  }]
               ]
				},
				files: {
					"dist/wriit.js": ["src/*.js"]
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/*.js'],
			options: {
				"validthis": true,
				"esnext": true,
				globals: {
					jQuery: true
				}
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint','browserify:dev']
		},
		clean: {
			build: ["tmp"],
			release: ["dist"]
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks("grunt-browserify");
	//grunt.registerTask('build', ['clean:build', 'browserify:dev']);
	//grunt.registerTask('prod', ['clean:release', 'babel:prod']);
	grunt.registerTask('dev', ['jshint','clean:release','browserify:dev', 'watch']);
};