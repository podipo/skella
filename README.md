# Skella: a front end foundation

This is a basic web project skeleton that uses the Node ecosystem of Javascript libraries to generate the static files that make up the front end of dynamic web sites.  You can serve the output of skella from any front end process like [nginx](http://nginx.org/) and you can easily integrate skella with back end web stacks like [Django](https://www.djangoproject.com/), [Negroni](https://github.com/codegangsta/negroni), [Flask](http://flask.pocoo.org/), or one of the Node engines.

One of the main features of skella is the Living Style Library (still somewhat TBD) which contains examples of the styles and components in the system.

# Technologies

[NPM](https://www.npmjs.org/) installs the development tools like [LESS](http://lesscss.org/) and [mustache](https://github.com/janl/mustache.js).

[Bower](http://bower.io/) installs the production libraries like [Bootstrap](http://getbootstrap.com/) and [Backbone](http://backbonejs.org/).

[Grunt](http://gruntjs.com/) ties it all together.

# Installation

	sudo npm install -g bower
	sudo npm install -g grunt-cli

	# From the skella root dir
	npm install


# Development

There are three directories which you will use during development:

- static: files like images and JS files that are deployed unchanged
- template: source files like LESS and mustache templates
- dist: the directory where the static and compiled files end up

To run Bower install, compile the mustache templates and LESS files, and copy static files into /dist, run this:

	grunt 

To start an HTTPd on port 8000 and then automatically recompile mustache templates and LESS files if they change, run this:

	grunt dev

Note: Don't edit anything in /dist as it will be overwritten.  Instead, edit the files in /templates or /static.

The context data for the mustache templates lives in /templates/context.json.

To update Bootstrap variables, edit /templates/variables.less. To enable or disable Bootstrap components, edit /templates/bootstrap.less.


# License

This project is licensed under the [MIT open source license](http://opensource.org/licenses/MIT).

See the included [LICENSE](https://github.com/podipo/skella/blob/master/LICENSE) for details.
