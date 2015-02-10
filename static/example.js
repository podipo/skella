/*
This is example funcationality for the Skellago example APIs like Echo
*/
var example = example || {};
example.views = example.views || {};

// Extend the API with functionality specific to the example APIs
$(document).ready(function(){
	if(!window.schema) return;

	window.schema.on(skella.events.SchemaPopulated, function(){

		// Entry is unusual in that it takes either its id or its slug in its url.
		// So, we need to customize the Backbone.Model.url function to be a little smart.
		window.schema.api.Entry.prototype.url = function(){
			if(typeof this.get('id') != 'undefined' && this.get('id') !== null){
				return skella.schema.generateURL(this.schema.path, this.attributes);
			}
			// Temporarily set the id to slug and then generate the URL
			this.set('id', this.get('slug'));
			var result = skella.schema.generateURL(this.schema.path, this.attributes);
			this.set('id', null);
			return result;
		}

	});
});



/*
EchoView simply GETs to the Echo resource and displays the resulting (predictable) response.
*/
example.views.EchoView = Backbone.View.extend({
	className: 'echo-view',
	initialize: function(options){
		_.bindAll(this, 'handleSendButton', 'handleGetSuccess', 'handleGetError');
		this.options = options;
		this.echo = new window.schema.api.Echo();

		this.$el.append($.el.h3("Echo"));
		this.input = $.a(this.el, $.el.input({'value':'Hello, world!'}));
		this.sendButton = $.a(this.el, $.el.button('Send'));
		$(this.sendButton).click(this.handleSendButton);

		this.results = $.a(this.el, $.el.div({'class':'echo-results'}));

	},
	handleSendButton: function(){
		var val = $(this.input).val();
		if(val.trim().length == 0) {
			return;
		}
		this.echo.rawGet({'text':val}, this.handleGetSuccess, this.handleGetError);
	},
	handleGetSuccess: function(resultData){
		var timestamp = new moment(resultData.time);
		this.results.appendChild($.el.p(
			resultData.text + ' - ' + timestamp.format(skella.TimestampFormat)
		));
	},
	handleGetError: function(){
		console.log("Error", arguments);
	}
})

/*
LogRouter routes everything from /example/log/... to a list of logs, an individual log, or a log entry
*/
example.views.LogRouter = Backbone.Router.extend({
	routes: {
		"": "logs",
		":logSlug/:slug": "entry",
		":slug": "log"
	},
	initialize: function(options){
		_.bindAll(this, 'logs', 'log', 'handleLogFetch', 'handleEntryFetch', 'entry');
		this.options = options;
		if(typeof this.options.el == 'undefined') throw 'No el argument';
		if(typeof this.options.logs == 'undefined') throw 'No logs argument';
		this.el = this.options.el;
		this.$el = $(this.options.el);

		this.logsView = null;
		this.logModels = {}; // a map of <slug> to schema.api.Log
		this.entryModels = {}; // a map of <log-slug> to a map of <entry-slug> to schema.api.Entry
	},
	logs: function() {
		if(!this.logsView){
			this.logsView = new skella.views.AbstractCollectionView({
				'title': 'Logs',
				'collection': window.logs,
				'itemView': example.views.LogItemView
			});
		}
		this.$el.empty();
		this.$el.append(this.logsView.el);
	},
	log: function(slug) {
		this.$el.empty();
		if(typeof this.logModels[slug] == 'undefined'){
			this.logModels[slug] = new window.schema.api.Log({'slug':slug});
			this.logModels[slug].fetch({
				'success':this.handleLogFetch,
				'error':function(){ console.log("TODO: handle this error", arguments); }
			});
		} else {
			this.$el.append(this.logModels[slug].view.el);
		}
	},
	handleLogFetch: function(model){
		var slug = model.get('slug');
		var view = new example.views.LogView({
			'model':model
		});
		this.logModels[slug].view = view;
		this.$el.empty();
		this.$el.append(view.el);
	},
	entry: function(logSlug, entrySlug) {
		this.$el.empty();
		if(typeof this.entryModels[logSlug] == 'undefined'){
			this.entryModels[logSlug] = {};
		}
		if(typeof this.entryModels[logSlug][entrySlug] == 'undefined'){
			this.entryModels[logSlug][entrySlug] = new window.schema.api.Entry({'slug':entrySlug});
			this.entryModels[logSlug][entrySlug].fetch({
				'success':this.handleEntryFetch,
				'error':function(){ console.log("TODO: handle this error", arguments); }

			})
		} else {
			this.$el.append(this.entryModels[logSlug][entrySlug].view.el);
		}
	},
	handleEntryFetch: function(model){
		model.view = new example.views.EntryView({
			'model':model
		})
		this.$el.empty();
		this.$el.append(model.view.el);
	}
});

example.views.EntryItemView = Backbone.View.extend({
	className: 'entry-item-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h4($.el.a(
			{'href':'#' + this.options.parent.options.slug + '/' + this.model.get('slug')},
			this.model.get('subject')
		)));
		this.$el.append($.el.div({'class':'content'}, this.model.get('content')));
	}
});

example.views.EntryView = Backbone.View.extend({
	className: 'entry-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h2(this.model.get('subject')));
		this.$el.append($.el.div({'class':'content'}, this.model.get('content')));
	}
});

example.views.LogView = Backbone.View.extend({
	className: 'log-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h3(this.model.get('name')));
		this.$el.append($.el.h4(this.model.get('tagline')));
		this.entries = new window.schema.api.LogEntries({'slug':this.model.get('slug')});
		this.entriesView = new skella.views.AbstractCollectionView({
			'collection':this.entries,
			'itemView':example.views.EntryItemView
		});
		this.$el.append(this.entriesView.el);
		this.entries.fetch({
			'error':function(){
				console.log("TODO handle this error", arguments);
			}
		});
	}
});

example.views.LogItemView = Backbone.View.extend({
	className: 'log-item-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h3($.el.a(
			{'href':'#' + this.model.get('slug')}, 
			this.model.get('name'))
		));
		this.$el.append($.el.h4(this.model.get('tagline')));
	}
});


