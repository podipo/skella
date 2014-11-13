# Skella: a front end foundation

## Note: We are still setting this us, so it's interesting but not yet useful.

NPM installs our front end development tools.

Bower installs the front end libraries like Bootstrap and jQuery.

Grunt ties it all together.

# Installation

	npm install -g bower
	npm install -g grunt-cli

	# From the skella root dir
	npm install

# Development

	# Run Bower install and compile the LESS files
	grunt 

	# Fire up a simple HTTPd to serve up the static dir at http://localhost:8000/
	cd static
	python -m SimpleHTTPServer 8000

	# Ask Grunt to automatically recompile LESS files when they change
	grunt watch

Don't edit anything in bower_components as they will be overwritten by Bower.  To update Bootstrap variables edit `/static/variables.less`  and to enable or disable Bootstrap components edit `/static/bootstrap.less`.