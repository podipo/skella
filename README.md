# Skella: a front end foundation

## Note: We are still setting this up so it's interesting but not yet useful.

NPM installs our front end development tools like LESS and mustache templates.

Bower installs the front end libraries like Bootstrap and Backbone.

Grunt ties it all together.

# Installation

	npm install -g bower
	npm install -g grunt-cli

	# From the skella root dir
	npm install


# Development

	# Run Bower install, compile the mustache templates and LESS files, and copy static all into /dist
	grunt 

	# Start an HTTPd on port 8000 and then automatically recompile mustache templates and LESS files if they change
	grunt dev

Don't edit anything in /dist as it will be overwritten.  Instead, edit the files in /templates or /static.

To update Bootstrap variables edit `/templates/variables.less`  and to enable or disable Bootstrap components edit `/templates/bootstrap.less`.


# License

This project is licensed under the [MIT open source license](http://opensource.org/licenses/MIT).

See the included [LICENSE](https://github.com/podipo/skella/blob/master/LICENSE) for details.
