# Skella: a front end foundation

This is a basic web project skeleton that uses the Node ecosystem of Javascript libraries to generate the static files that make up the front end of a dynamic web sites.  You should be able to serve the output of skella from any front end process like [nginx](http://nginx.org/) and to integrate skella with back end web stacks like [Django](https://www.djangoproject.com/), [Negroni](https://github.com/codegangsta/negroni), [Flask](http://flask.pocoo.org/), one of the Node engines.

One of the main features of skella is the Living Style Library (still somewhat TBD) which contains examples of all styles and components in the system.

# Technologies

[NPM](https://www.npmjs.org/) installs our front end development tools like [LESS](http://lesscss.org/) and [mustache](https://github.com/janl/mustache.js).

[Bower](http://bower.io/) installs the front end libraries like [Bootstrap](http://getbootstrap.com/) and [Backbone](http://backbonejs.org/).

[Grunt](http://gruntjs.com/) ties it all together.

# Installation

	npm install -g bower
	npm install -g grunt-cli

	# From the skella root dir
	npm install


# Development

There are three directories which you will use during development:

- static: all of the files that are deployed unchanged like images or Javascript files
- template: all of the source files like LESS and mustache templates
- dist: the destination where the static and compiled files end up

	
To run Bower install, compile the mustache templates and LESS files, and copy static all into /dist, run this:

	grunt 

To start an HTTPd on port 8000 and then automatically recompile mustache templates and LESS files if they change, run this:

	grunt dev

Note: Don't edit anything in /dist as it will be overwritten.  Instead, edit the files in /templates or /static.

To update Bootstrap variables edit /templates/variables.less and to enable or disable Bootstrap components edit /templates/bootstrap.less.


# License

This project is licensed under the [MIT open source license](http://opensource.org/licenses/MIT).

See the included [LICENSE](https://github.com/podipo/skella/blob/master/LICENSE) for details.
