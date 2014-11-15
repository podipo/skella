module.exports = function (grunt) {
	// This will hold all files and directories to clean with the 'clean' task
	var cleanFiles = ['static/compiled/', 'static/lib', 'static/**/*.html', 'static/**/*.mustache'];

	// This will hold all of the sass file data structures
	var lessFiles = [{
						'expand': true,
						'cwd': 'static',
						'src': ['**/*.less', '!**/_*.less', '!lib/**', '!bootstrap.less', '!variables.less'],
						'dest': 'static/compiled/',
						'ext': '.css'
					}];

	grunt.initConfig({
		'clean': {
			'src': cleanFiles
		},
		'less': {
			'development': {
				'options': {
					'compress': true,
					'yuicompress': true,
					'optimization': 2
				},
				'files':lessFiles
			}
		},
		'bower': {
			'options': {
				'targetDir': './static/lib',
				'layout': 'byComponent'
			},
			'install': {}
		},
		'watch': {
			'scripts': {
				'options': { 'spawn': false, 'interrupt':false, 'atBegin':true },
				'files': ['**/*.less', 'templates/**/*.html', 'templates/**/*.mustache', 'templates/context.json'],
				'tasks': ['less', 'mustache_render']
			},
		},
		'nodestatic': {
			'server': {
				'options': {
					'port': 8000,
					'base': 'static'
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
					'dest': 'static/'
				}]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodestatic');
	grunt.loadNpmTasks('grunt-mustache-render');

	grunt.registerTask('default', ['bower:install', 'less', 'mustache_render']);
	grunt.registerTask('dev', ['nodestatic', 'watch']);

};
