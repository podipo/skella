module.exports = function (grunt) {
	var lessFiles = [{
						'expand': true,
						'cwd': 'templates',
						'src': ['**/*.less', '!**/_*.less', '!bootstrap.less', '!variables.less'],
						'dest': 'dist/compiled-css/',
						'ext': '.css'
					}];

	grunt.initConfig({
		'clean': {
			'src': ['dist']
		},
		'less': {
			'options': {
				'compress': true,
				'yuicompress': true,
				'optimization': 2,
				'sourceMap': true,
				'outputSourceFiles':true,
			},
			'site': {
				'options': {
					'sourceMapFilename': 'dist/compiled.css.map',
					'sourceMapURL': '/compiled.css.map'
				},
				'files':{
					'dist/compiled.css': 'templates/site.less'
				}
			}
		},
		'bower': {
			'options': {
				'targetDir': './dist/lib',
				'layout': 'byComponent'
			},
			'install': {}
		},
		'watch': {
			'options': { 'spawn': false, 'interrupt':false, 'atBegin':true },
			'all': {
				'files': [
					'templates/**/*', 
					'static/**/*'
				],
				'tasks': ['less', 'mustache_render', 'copy']
			},
			'less': {
				'files': [
					'templates/**/*.less'
				],
				'tasks': ['less']
			}
		},
		'browserSync': {
			'dev': {
				'bsFiles': {
					'src' : 'dist/compiled.css'
				},
				'options': {
					'watchTask': true,
					'open': false,
					'online': false,
					'notify': false,
					'port': 8000,
					'server': {
						'baseDir': 'dist',
						'index': 'index.html'
					}
				}
			}
		},
		'nodestatic': {
			'options': {
				'port': 8000,
				'base': 'dist'
			},
			'dev-server': {
				'options': {
					'port': 8000,
				}
			},
			'test-server': {
				'options': {
					'port': 9000,
				}
			}
		},
		'mustache_render': {
			'all': {
				'options':{
					'directory': 'templates/modules/'
				},
				'files': [{
					'expand': true,
					'cwd': 'templates/',
					'src': '**/*.html',
					'data': 'templates/context.json',
					'dest': 'dist/'
				}]
			}
		},
		'copy': {
			'main': {
				'files': [
					{
						'expand': true,
						'cwd': 'static/', 
						'src': ['**'], 
						'dest': 'dist/'
					},
					{
						'expand': true,
						'cwd': 'bower_components/jquery/dist', 
						'src': ['**'], 
						'dest': 'dist/lib/jquery/'
					}
				]
			}
		},
		'uglify': {
			'options': {
				'mangle': false,
				'sourceMap': true
			},
			'all': {
				'files': {
					'dist/built.js': [
						'dist/lib/jquery/jquery.js', 
						'dist/lib/underscore/underscore.js', 
						'dist/lib/laconic/laconic.js', 
						'dist/lib/bootstrap/bootstrap.js', 
						'dist/lib/backbone/backbone.js', 
						'dist/site.js'
					]
				}
			}
		},
		'qunit': {
			'all': {
				'options': {
					'urls': [
						'http://localhost:9000/tests/'
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-nodestatic');
	grunt.loadNpmTasks('grunt-mustache-render');

	grunt.registerTask('default', ['bower:install', 'less', 'mustache_render', 'copy']);
	grunt.registerTask('dev', ['browserSync:dev', 'watch:all']);
	grunt.registerTask('dev-less', ['browserSync:dev', 'watch:less']);
	grunt.registerTask('test', ['nodestatic:test-server', 'qunit:all']);

};
