# Skella Front End

<div style="text-align: center;">
	<img width="150" style="float: left; margin: 0 20px 2px 0;"  src="http://podipo.github.io/skella/images/Skella.png" /> 
</div>

The [Skella](http://github.com/podipo/skella/) front end is a web project skeleton. It is intended to be a good starting place for new projects or example code for people who want to stop using Notepad and FTP to build web sites.

Skella uses the Node ecosystem of Javascript libraries to generate the static files that make up the front end of dynamic web sites.  You can use the Skella front end by itself to make dynamic sites, even without a separate back end.  Should you need a back end, you might try the [Skella back end](https://github.com/podipo/skellago/), which is carefully designed to nicely compliment the Skella front end.


That said, you can serve the output of skella from any front end process like [nginx](http://nginx.org/) and you can easily integrate skella with back end web stacks like [Django](https://www.djangoproject.com/), [Negroni](https://github.com/codegangsta/negroni), [Flask](http://flask.pocoo.org/), or one of the Node engines.


One of the main features of skella is the Living Style Library which contains examples of the styles and components in the system.

<br style="clear: both;" >

# Technologies

[npm](https://www.npmjs.org/) installs the development tools like [LESS](http://lesscss.org/) and [mustache](https://github.com/janl/mustache.js).

[Bower](http://bower.io/) installs the production libraries like [Bootstrap](http://getbootstrap.com/) and [Backbone](http://backbonejs.org/).

[Grunt](http://gruntjs.com/) ties it all together.

# Installation

First, install [Node](http://nodejs.org/).

Then use npm to fetch dependencies:

	sudo npm install -g bower
	sudo npm install -g grunt-cli

	# From the skella root dir
	npm install


# Development

There are three directories which you will use during development:

- static: files like images and JS files that are deployed unchanged
- template: source files like LESS and mustache templates
- dist: the directory where the static and compiled files end up

Note: Don't edit anything in /dist as it will be overwritten.  Instead, edit the files in /templates or /static.

The context data for the mustache templates lives in /templates/context.json.

To update Bootstrap variables, edit /templates/variables.less. To enable or disable Bootstrap components, edit /templates/bootstrap.less.

To run the Bower install, compile the mustache templates and LESS files, copy static files into /dist, and then concatenate and make sourcemaps run this:

	grunt 

To start an HTTPd on [localhost:8000](http://localhost:8000/) and then automatically recompile mustache templates and LESS files if they change, run this:

	grunt dev

The [HTTPd we use](http://www.browsersync.io/) is a little smart and it will notice if new CSS shows up in /dist/compiled.css and then automatically inject it into your browser.  So, don't be surprised when you don't need to hit reload to see CSS tweaks.

If you're just changing LESS files and you don't want to wait for the rest of the compilation tools then run this:

	grunt dev-less

# Testing

Skella uses QUnit for testing.

If you're running `grunt dev` then you can point your browser at [localhost:8000/tests/](http://localhost:8000/tests/). 

If you want to run the tests in [phantomjs](http://phantomjs.org/) then run this:

	grunt test

To add tests, edit /static/tests/tests.js.

# License

This project is an effort of [Podipo](http://podipo.com/) but depends on a HUGE ecosystem of open source code.  So, what kind of people would we be if we kept Skella all to ourselves?

This project is licensed under the [MIT open source license](http://opensource.org/licenses/MIT).

See the included [LICENSE](https://github.com/podipo/skella/blob/master/LICENSE) for details.
