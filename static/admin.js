var skella = skella || {};
skella.views = skella.views || {};
skella.events = skella.events || {};

skella.events.AdminItemSelected = 'admin-item-selected';

/*
CollectionAdminView shows a collection of items on the left and allows editing of an item on the right.
Options:
	collection:	a Backbone.Collection
	itemTitle: 	the model field to use in the list of items
	itemView (optional): the Backbone.View which should be used to display items on the left
						 the itemView should trigger skella.events.AdminItemSelected when clicked
*/
skella.views.CollectionAdminView = Backbone.View.extend({
	className: 'collection-admin-view row',
	initialize: function(options){
		_.bindAll(this, 'addItem', 'handleItemSelected', 'removeItem', 'handleSync', 'clearItems', 'saveRequested', 'deleteRequested');
		this.options = options;
		if(typeof this.options.collection == 'undefined') throw 'This view requires a collection option';
		if(typeof this.options.itemTitle == 'undefined') throw 'This view requires an itemTitle option';
		if(typeof this.options.itemView == 'undefined') {
			this.itemView = skella.views.AdminItemView;
		} else {
			this.itemView = this.options.itemView;
		}

		// The view containing the list of items
		this.itemsView = $.el.div({'class':'items-view list-group'});
		this.$el.append(this.itemsView);

		// The views of individual items
		this.itemViews = [];

		// The view containing the item being administered
		this.focusView = $.el.div({'class':'focus-view'});
		this.$el.append(this.focusView);
		this.currentFocusItemView = null;
		this.savingView = null;

		// The view containing the item being administered
		this.controlsView = $.el.div({'class':'controls-view'});
		this.$el.append(this.controlsView);

		this.saveButton = $.el.button({'class':'btn btn-primary'},'Save');
		this.controlsView.appendChild(this.saveButton);
		$(this.saveButton).click(this.saveRequested);

		this.deleteButton = $.el.button({'class':'btn btn-warning'},'Delete');
		this.controlsView.appendChild(this.deleteButton);
		$(this.saveButton).click(this.deleteRequested);

		this.collection.on('sync', this.handleSync);
	},
	saveRequested: function(){
		if(this.currentFocusItemView == null) return;
		this.savingView.startSpinning();
		this.currentFocusItemView.model.save({
			'success':this.handleSaveSuccess,
			'error':this.handleSaveError
		})
	},
	handleSaveSuccess: function(){
		this.savingView.stopSpinning();
	},
	handleSaveError: function(){
		this.savingView.stopSpinning();
	},
	deleteRequested: function(){
		if(this.currentFocusItemView == null) return;
	},
	handleSync: function(){
		this.clearItems();
		for(var i=0; i < this.options.collection.length; i++){
			this.addItem(this.options.collection.at(i));
		}
		if(this.itemViews.length > 0){
			this.handleItemSelected(this.itemViews[0]);
		}
	},
	addItem: function(model){
		var view = new this.itemView({
			'model':model,
			'itemTitle': this.options.itemTitle
		});
		view.$el.addClass('list-group-item');
		view.on(skella.events.AdminItemSelected, this.handleItemSelected);
		this.itemViews[this.itemViews.length] = view;
		this.itemsView.appendChild(view.el);
	},
	handleItemSelected: function(itemView){
		$(this.itemsView).find('.list-group-item').removeClass('active');
		itemView.$el.addClass('active');
		if(this.currentFocusItemView != null){
			this.currentFocusItemView.remove();
			this.currentFocusItemView = null;
		}
		this.currentFocusItemView = new skella.views.AdminFocusItemView({
			'model':itemView.model,
			'itemTitle': this.options.itemTitle
		});
		this.focusView.appendChild(this.currentFocusItemView.el);

		this.savingView = new skella.views.ModelSavingView({
			'model':itemView.model
		});
		this.controlsView.appendChild(this.savingView.el);
	},
	removeItem: function(model){
		console.log("TODO: remove item");
	},
	clearItems: function(){
		for(var i=0; i < this.itemViews.length; i++){
			this.itemViews[i].remove();
		}
		this.itemViews = [];
	}
});

/*
AdminFocusItemView is used to show an editor for an item in the CollectionAdminView
*/
skella.views.AdminFocusItemView = Backbone.View.extend({
	className: 'admin-focus-item-view',
	initialize: function(options){
		try{
			this.options = options;
			if(typeof this.options.model == 'undefined') throw 'This view requires a model option';
			if(typeof this.options.itemTitle == 'undefined') throw 'This view requires an itemTitle option';

			this.schema = this.model.__proto__.schema;
			for(var i=0; i < this.schema.properties.length; i++){
				var prop = this.schema.properties[i];
				if(prop.protected){
					continue;
				}
				var editView = skella.views.editViewForProperty(prop);
				this.$el.append($.el.div(
					$.el.label(prop.name),
					$.el.div({'class':'description'}, prop.description),
					new editView(_.extend(prop, {'model':this.model})).el
				));
			}

			for(var i=0; i < this.schema.properties.length; i++){
				var prop = this.schema.properties[i];
				if(!prop.protected){
					continue;
				}
				var editView = skella.views.editViewForProperty(prop);
				this.$el.append($.el.div(
					$.el.label(prop.name),
					$.el.div({'class':'description'}, prop.description),
					new editView(_.extend(prop, {'model':this.model})).el
				));
			}


		} catch(e) {
			console.log("Exception", e);
		}
	}
});

skella.views.editViewForProperty = function(property){
	if(property['protected']){
		return skella.views.AdminProtectedView
	}
	switch(property['data-type']){
		case 'int':
			return skella.views.AdminIntEditView;
		case 'file':
			return skella.views.AdminFileEditView;
		case 'timestamp':
			return skella.views.AdminTimestampEditView;
		case 'long-string':
			return skella.views.AdminLongStringEditView;
		default:
			return skella.views.AdminStringEditView;
	}
}

skella.views.AdminProtectedView = Backbone.View.extend({
	className: 'admin-protected-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		switch(options['data-type']){
			case 'timestamp':
				var tstamp = new moment(this.model.get(this.options.name));
				this.$el.append($.el.div(tstamp.format(skella.TimestampFormat)));
				break;
			default:
				this.$el.append($.el.div(this.model.get(this.options.name)));
		}
	}
});

skella.views.AdminIntEditView = Backbone.View.extend({
	className: 'admin-int-edit-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.input({
			'value':this.model.get(this.options.name)
		}));
	}
});

skella.views.AdminTimestampEditView = Backbone.View.extend({
	className: 'admin-timestamp-edit-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		var tstamp = new moment(this.model.get(this.options.name));
		this.inputGroup = $.a(this.$el, skella.views.generateInputFormGroup(
			"text", this.options.name, this.options.name, null, this.options.name
		));
		this.input = $(this.inputGroup).find('input');
		this.input.val(tstamp.format(skella.TimestampFormat));
	}
});

skella.views.AdminStringEditView = Backbone.View.extend({
	className: 'admin-string-edit-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		this.inputGroup = $.a(this.$el, skella.views.generateInputFormGroup(
			"text", this.options.name, this.options.name, null, this.options.name
		));
		skella.views.bindTextInput(this.options.name, this.model, $(this.inputGroup).find('input'));
	}
});

skella.views.AdminLongStringEditView = Backbone.View.extend({
	className: 'admin-long-string-edit-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		this.inputGroup = $.a(this.$el, skella.views.generateInputFormGroup(
			"textarea", this.options.name, this.options.name, null, this.options.name
		));
		skella.views.bindTextInput(this.options.name, this.model, $(this.inputGroup).find('textarea'));
	}	
})

skella.views.AdminFileEditView = Backbone.View.extend({
	className: 'admin-file-edit-view admin-edit-view',
	initialize: function(options){
		this.options = options;
		if(this.model.get(this.options.name)){
			this.$el.append($.el.div('current value: ' + this.model.get(this.options.name)));
		}
		var fileInput = $.el.input({
			'type':'file'
		});
		this.$el.append(fileInput);
	}	
})

/*
AdminItemView is the default item view used by the CollectionAdminView
*/
skella.views.AdminItemView = Backbone.View.extend({
	className: 'admin-item-view',
	initialize: function(options){
		this.options = options;
		if(typeof this.options.model == 'undefined') throw 'This view requires a model option';
		if(typeof this.options.itemTitle == 'undefined') throw 'This view requires an itemTitle option';
		this.$el.append($.el.div(this.model.get(this.options.itemTitle)));
		this.$el.click(function(){ this.trigger(skella.events.AdminItemSelected, this); }.bind(this));
	}
});

