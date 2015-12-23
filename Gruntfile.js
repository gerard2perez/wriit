module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dev: {
					options: {
						style: 'expanded'
					},
					files: { // Dictionary of files
						'dist/wriit.css': 'src/css/wriit.sass'
					}
				},
				prod: {
					options: {
						sourcemap:'none',
						style: 'compressed'
					},
					files: { // Dictionary of files
						'dist/wriit.css': 'src/css/wriit.sass'
					}
				}
		},
		browserify: {
			dev: {
				options: {
					browserifyOptions: {
						debug: true
					},
					transform: [["babelify", {
						compact: false,
						moduleIds: false,
						sourceMap: true,
						//						sourceMapRelative:"."
					}]]
				},
				files: {
					"dist/wriit.js": [
						"src/*.js",
						"src/modules/*.js",
						"src/modules/private/*.js",
						"src/tags/*.js",
						"src/attributes/*.js"
					]
				}
			},
			prod: {
				options: {
					transform: [
						["babelify", {
							compact: true,
							moduleIds: true,
							sourceMap: false,
						}]
					]
				},
				files: {
					"dist/wriit.js": [
						"src/*.js",
						"src/modules/*.js",
						"src/modules/private/*.js",
						"src/tags/*.js",
						"src/attributes/*.js"
					]
				}
			}
		},
		jshint: {
			files: [
				'Gruntfile.js',
				"src/*.js",
				"src/modules/*.js",
				"src/modules/private/*.js",
				"src/tags/*.js",
				"src/attributes/*.js",
				"src/utils/*.js",
				"!src/**/index.js"
			],
			options: {
				"validthis": true,
				"esnext": true,
				globals: {
					jQuery: true
				}
			}
		},
		watch: {
			files: ['<%= jshint.files %>', "src/css/wriit.sass", "live.html"],
			tasks: ['clean:live', 'execute', 'jshint', 'browserify:dev', 'sass:dev'],
			options: {
				livereload: {
					host: 'localhost',
					port: 62626
				}
			}
		},
		clean: {
			live: ["dist/wriit.*"],
			release: ["dist"]
		},
		execute: {
			target: {
				src: ['makeindexes.js']
			}
		},
		shell: {
			chrome: {
				command: 'open -a "Google Chrome" dist/live.html',
				options: {
					async: false
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						src: ['live.html'],
						dest: 'dist/',
						filter: 'isFile',
						flatten: true
					}
				]
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-execute");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-shell-spawn");
	grunt.registerTask('build-dev', ['execute', 'jshint', 'clean:release', 'copy', 'browserify:dev', 'sass:dev', ]);
	grunt.registerTask('build-prod', ['execute', 'jshint', 'clean:release', 'copy', 'browserify:prod', 'sass:prod', ]);
	grunt.registerTask('serve', ['execute', 'jshint', 'clean:release', 'copy', 'browserify:dev', 'sass:dev', 'shell:chrome', 'watch']);
};