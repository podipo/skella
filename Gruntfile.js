module.exports = function (grunt) {
	// This will hold all files and directories to clean with the 'clean' task
	var cleanFiles = ['static/compiled/', 'static/lib'];

	// This will hold all of the sass file data structures
	var lessFiles = [{
						'expand': true,
						'cwd': 'static',
						'src': ['**/*.less', '!**/_*.less', '!lib/bootstrap/**', '!bootstrap.less', '!variables.less'],
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
		bower: {
			'options': {
				'targetDir': './static/lib',
				'layout': 'byComponent'
			},
			'install': {
				//just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
			}
		},
		'watch': {
			'scripts': {
				'options': { 'spawn': false, 'interrupt':false, 'atBegin':true },
				'files': ['**/*.less'],
				'tasks': ['less']
			},
		}
 	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['bower:install', 'less']);

};
