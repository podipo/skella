var skella = skella || {};
skella.views = skella.views || {};

// Extend the API with functionality specific to the example APIs
$(document).ready(function(){
	if(!window.schema) return;

	window.schema.on(skella.events.SchemaPopulated, function(){

		// Entry is unusual in that it takes either its id or its slug in its url.
		// So, we need to customize the Backbone.Model.url function to be a little smart.
		window.schema.api.Entry.prototype.url = function(){
			if(this.isNew()){
				if(this.collection){
					return this.collection.url();
				}
				if(typeof this.get('log-id') == 'undefined'){
					throw 'Unable to generate a URL without a collection or a log-id';
				}
				return new window.schema.api.LogEntries({'id':this.get('log-id')}).url();
			}
			return skella.schema.generateURL(this.schema.path, this.attributes);
		}
	});
});

skella.views.LogAdminChooser = Backbone.View.extend({
	className: 'log-admin-chooser',
	initialize: function(options){
		this.options = options;
	}
});

/*
LogRouter routes everything from /example/log/... to a list of logs, an individual log, or a log entry
*/
skella.views.LogRouter = Backbone.Router.extend({
	routes: {
		"": "logs",
		":logId/:id": "entry",
		":id": "log"
	},
	initialize: function(options){
		_.bindAll(this, 'logs', 'log', 'handleLogFetch', 'handleLogFetchError', 'handleEntryFetch', 'entry');
		this.options = options;
		if(typeof this.options.el == 'undefined') throw 'No el argument';
		if(typeof this.options.logs == 'undefined') throw 'No logs argument';
		this.el = this.options.el;
		this.$el = $(this.options.el);

		this.logsView = null;
		this.logModels = {}; // a map of <id> to schema.api.Log
		this.entryModels = {}; // a map of <log-id> to a map of <entry-id> to schema.api.Entry
	},
	showError: function(message){
		this.$el.prepend($.el.div('Error: ' + message));
	},
	logs: function() {
		if(!this.logsView){
			this.logsView = new skella.views.AbstractCollectionView({
				'collection': window.logs,
				'itemView': skella.views.LogItemView
			});
		}
		this.$el.empty();
		this.$el.append(this.logsView.el);
	},
	addEditLogLink: function(id) {
		this.$el.prepend($.el.a({
			'class':'edit-link',
			'href':'/log/admin/#' + id
		}, $.el.span({'class':'glyphicon glyphicon-edit'})));
	},
	log: function(id) {
		this.$el.empty();
		if(typeof this.logModels[id] == 'undefined'){
			this.logModels[id] = new window.schema.api.Log({'id':id});
			this.logModels[id].fetch({
				'success':this.handleLogFetch,
				'error': this.handleLogFetchError
			});
		} else {
			if(window.schema.isStaff()){
				this.addEditLogLink(id);
			}
			this.$el.append(this.logModels[id].view.el);
		}
	},
	handleLogFetch: function(model){
		if(window.schema.isStaff()){
			this.addEditLogLink(model.id);
		}
		var id = model.get('id');
		var view = new skella.views.LogView({
			'model':model
		});
		this.logModels[id].view = view;
		this.$el.append(view.el);
	},
	handleLogFetchError: function(){
		this.showError('I could not fetch that log');
	},
	entry: function(logId, id) {
		this.$el.empty();
		if(typeof this.entryModels[logId] == 'undefined'){
			this.entryModels[logId] = {};
		}
		if(typeof this.entryModels[logId][id] == 'undefined'){
			this.entryModels[logId][id] = new window.schema.api.Entry({'id':id});
			this.entryModels[logId][id].fetch({
				'success':this.handleEntryFetch,
				'error':function(){ console.log("TODO: handle this error", arguments); }

			})
		} else {
			this.$el.append(this.entryModels[logId][id].view.el);
		}
	},
	handleEntryFetch: function(model){
		model.view = new skella.views.EntryView({
			'model':model
		})
		this.$el.empty();
		this.$el.append(model.view.el);
	}
});

skella.views.EntryItemView = Backbone.View.extend({
	className: 'entry-item-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h4($.el.a(
			{'href':'#' + this.options.parent.options.id + '/' + this.model.get('id')},
			this.model.get('subject')
		)));
		this.$el.append($.el.div({'class':'content'}, this.model.get('content')));
	}
});

skella.views.EntryView = Backbone.View.extend({
	className: 'entry-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h2(this.model.get('subject')));
		this.$el.append($.el.div({'class':'content'}, this.model.get('content')));
	}
});

skella.views.LogView = Backbone.View.extend({
	className: 'log-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h3(this.model.get('name')));
		this.$el.append($.el.h4(this.model.get('tagline')));
		this.entries = new window.schema.api.LogEntries({'id':this.model.get('id')});
		this.entriesView = new skella.views.AbstractCollectionView({
			'collection':this.entries,
			'itemView':skella.views.EntryItemView
		});
		this.$el.append(this.entriesView.el);
		this.entries.fetch({
			'error':function(){
				console.log("TODO handle this error", arguments);
			}
		});
	}
});

skella.views.LogItemView = Backbone.View.extend({
	className: 'log-item-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h3($.el.a(
			{'href':'#' + this.model.get('id')}, 
			this.model.get('name'))
		));
		this.$el.append($.el.h4(this.model.get('tagline')));
	}
});