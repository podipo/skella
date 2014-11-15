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
				'targetDir': './dist/lib',
				'layout': 'byComponent'
			},
			'install': {}
		},
		'watch': {
			'scripts': {
				'options': { 'spawn': false, 'interrupt':false, 'atBegin':true },
				'files': [
					'templates/**/*', 
					'static/**/*'
				],
				'tasks': ['less', 'mustache_render', 'copy']
			},
		},
		'nodestatic': {
			'server': {
				'options': {
					'port': 8000,
					'base': 'dist'
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
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodestatic');
	grunt.loadNpmTasks('grunt-mustache-render');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['bower:install', 'less', 'mustache_render', 'copy']);
	grunt.registerTask('dev', ['nodestatic', 'watch']);

};
