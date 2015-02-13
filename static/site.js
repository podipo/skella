/* This is where the site-wide special sauce lives. */
var skella = skella || {};
skella.views = skella.views || {};
skella.events = skella.events || {};

skella.events.FetcherComplete = 'fetcher-complete';

// Date and time formats used with moment.js
skella.DateFormat = 'MMM D, YYYY';
skella.MonthFormat = 'MMM, YYYY';
skella.TimestampFormat = 'MM/D/YY HH:mm';


$(document).ready(function(){
	// If and when the Skella back end has set up the schema, call schemaPopulated
	if(window.schema){
		window.schema.on(skella.events.SchemaPopulated, skella.views.schemaPopulated);
	}
})

/*
schemaPopulated is called after the Skella back end wrapper has been set up
*/
skella.views.schemaPopulated = function(){

	// Extend the User Backbone.Model with a handy name function
	window.schema.api.User.prototype.displayName = function(){
		if(this.get('first-name')){
			var result = this.get('first-name');
			if(this.get('last-name')){
				result += ' ' + this.get('last-name');
			}
			return result;
		}
		return this.get('email');
	}

	skella.views.updateAccountNav();
	window.schema.on(skella.events.LoggedIn, skella.views.updateAccountNav);
	window.schema.on(skella.events.LoggedOut, skella.views.updateAccountNav);

	// React to changes to the authenticated user
	if(window.schema.user){
		window.schema.user.on('change:first-name', skella.views.updateAccountNav);
		window.schema.user.on('change:last-name', skella.views.updateAccountNav);
		window.schema.user.on('change:email', skella.views.updateAccountNav);
	}
}

/*
updateAccountNav modifies the lefthand menu of the top nav based on whether the user is logged in
*/
skella.views.updateAccountNav = function(){
	var value = "";
	var topNav = $('#top-nav-collapse');
	var userNav = topNav.find('.account-nav');
	var usernameEl = userNav.find('.username');
	var authedDropdown = topNav.find('.dropdown-authed');
	var anonymousDropdown = topNav.find('.dropdown-anonymous');
	if(skella.api.loggedIn() && window.schema.user) {
		usernameEl.text(window.schema.user.displayName());
		userNav.show();
		authedDropdown.show();
		anonymousDropdown.hide();
	} else {
		userNav.hide();
		usernameEl.text("");
		authedDropdown.hide();
		anonymousDropdown.show();

	}
}

/*
A helper function which appends child to parent and returns child.
Enables code like: `var button = $.a(this.el, $.el.button());`
*/
$.a = function(parent, child){
	$(parent).append(child);
	return child;
}

skella.urlParams = {}; // This will be populated with the parameters in the document.location;

// Copied from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
(window.onpopstate = function () {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);
	skella.urlParams = {};
	while (match = search.exec(query)){
	   skella.urlParams[decode(match[1])] = decode(match[2]);
	}
})();

/*
	Fetches all of the Models or Collections and waits until they're all finished and triggers a fetchComplete on itself
	Create like so: new skella.Fetcher(ModelOrCollection, ModelOrCollection, ...)
	Copied from https://github.com/TrevorFSmith/phlogiston/blob/master/phlogiston/static/phlogiston/phlogiston.js
*/
skella.Fetcher = function() {
	this.fetchables = []; // A 2D array of [Model/Collection, isFetched]

	var setTrue = function() {
		this[1] = true;
	};

	var triggerOnComplete = function() {
		if (this.completed()) {
			this.trigger(skella.events.FetcherComplete, this);
		}
	};

	for (var i = 0; i < arguments.length; i++) {
		var info = this.fetchables[i] = [arguments[i], false];
		arguments[i].once('sync', _.bind(setTrue, info));
		arguments[i].once('sync', _.bind(triggerOnComplete, this));
	}
	this.initialize.apply(this, arguments);
};
_.extend(skella.Fetcher.prototype, Backbone.Events, {
	initialize: function() { /* override as needed */ },
	fetch: function() {
		for (var i = 0; i < this.fetchables.length; i++) {
			this.fetchables[i][0].fetch();
		}
	},
	completed: function() {
		for (var i = 0; i < this.fetchables.length; i++) {
			if (this.fetchables[i][1] === false) {
				return false;
			}
		}
		return true;
	}
});


/*
	options:
		collection: a Backbone.Collection
		itemView: the Backbone.View which will be used to present an item in the list
		title (optional): if present, add an H1 to the top of this list
		filter (optional): a boolean function which is passed an item from the collection and returns true if the item should be displayed
		mustBeSet (optional): an array of field names which must be present in an item in order for it to be displayed
		itemClasses (optional): a string which will be used for new items.$el.addClass
*/
skella.views.AbstractCollectionView = Backbone.View.extend({
	tagName: 'section',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'reset', 'add', 'remove');
		this.$el.addClass('collection-view');
		this.itemViews = [];
		this.itemList = $.el.div({'class':'item-list'});

		if(this.options.title){
			this.$el.append($.el.h1(this.options.title));
		}
		this.$el.append(this.itemList);
		this.reset();
		this.collection.on('add', this.add);
		this.collection.on('remove', this.remove);
		this.collection.on('reset', this.reset);
	},
	reset: function(){
		for(var i=0; i < this.itemList.length; i++){
			this.itemList[i].remove();
		}
		$(this.itemList).empty()
		for(var i=0; i < this.collection.length; i++){
			this.add(this.collection.at(i));
		}
	},
	add: function(item){
		if(this.options.filter){
			var filterName = this.options.filter[0];
			var filterTargetValue = this.options.filter[1];
			var val = item.get(filterName, null);
			if(val != filterTargetValue) return;
		}
		if(this.options.mustBeSet){
			for(var i=0; i < this.options.mustBeSet.length; i++){
				var val = item.get(this.options.mustBeSet[i], null);
				if(val == null || val == '') return;
			}
		}
		this.itemViews[this.itemViews.length] = new this.options.itemView({'model':item, 'parentView':this, 'parent':this.collection});
		if(this.options.itemClasses){
			this.itemViews[this.itemViews.length - 1].$el.addClass(this.options.itemClasses);
		}
		this.itemList.appendChild(this.itemViews[this.itemViews.length - 1].render().el);
	},
	remove: function(item){
		console.log('TODO remove', arguments);
	}
});

skella.views.ImageEditorView = Backbone.View.extend({
	className:'image-editor-view',
	initialize: function(options){
		_.bindAll(this, 'handleInputChanged', 'handleImageUploaded', 'handleUploadError', 'handleImageLoaded', 'handleImageError');
		this.options = options;

		if(!this.options.model) throw 'This view requires a model option';
		if(!this.options.model.sendForm) throw 'This view requires a model with the sendForm function';

		this.imageView = $.a(this.el, $.el.div({'class':'image-div'}));

		this.image = new Image();
		this.imageView.appendChild(this.image);
		this.image.onload = this.handleImageLoaded;
		this.image.onerror = this.handleImageError;
		this.image.src = this.options.model.url();

		this.form = $.a(this.$el, $.el.form());
		this.fileInput = $.a(this.form, $.el.input({'type':'file', 'name':'image'}));
		$(this.fileInput).change(this.handleInputChanged);
	},
	handleInputChanged: function(){
		var formData = new FormData();
		formData.append('image', this.fileInput.files[0]);
		this.model.sendForm('PUT', formData, this.handleImageUploaded, this.handleUploadError);
	},
	handleImageUploaded: function(){
		this.image.src = this.model.url() + '?t=' + new Date().getTime();
	},
	handleUploadError: function(){
		console.log("Image upload error");
	},
	handleImageError: function(){
		$(this.image).hide();
	},
	handleImageLoaded: function(){
		$(this.image).show();
	}
});

/*
A little view used on pages that require the Skella back end but when the schema isn't available
*/
skella.views.NoSchemaView = Backbone.View.extend({
	className: 'no-schema-view',
	initialize: function(options){
		this.options = options;
		this.$el.append($.el.h3('No Backend Found'));
		this.$el.append($.el.p('The API server was not detected.'));
		this.$el.append($.el.p('Is the ', $.el.a({'href':'https://github.com/podipo/skellago/'}, 'Skella back end'), ' running?'));
	}
});

/*
generateConfirmationModel uses generateModal with the default Ok and Cancel buttons of a confirmation modal
*/
skella.views.generateConfirmationModal = function(title, contentEl, callback){
	return skella.views.generateModal(title, contentEl, [
		{
			'text':'Cancel',
			'callback': callback
		},
		{
			'text':'Ok',
			'callback': callback
		}
	]);
}

/*
generateModal returns an element configured as a bootstrap modal
buttons is an array of maps describing buttons like:
	{
		'text': <string to be displayed in button>,
		'callback': <function called like callback(buttonText)>
	}
*/
skella.views.generateModal = function(title, contentEl, buttons){
	var modal = $.el.div({'class': 'modal fade'});
	var modalDialog = $.a(modal, $.el.div({'class':'modal-dialog'}));
	var modalContent = $.a(modalDialog, $.el.div({'class':'modal-content'}));	
	var modalHeader = $.a(modalContent, $.el.div({'class':'modal-header'}));
	
	var closeButton = $.a(modalHeader, $.el.button({
		'type':'button',
		'class':'close',
		'data-dismiss':'modal',
		'aria-label':'Close'
	}));
	var closeSpan = $.a(closeButton, $.el.span({'aria-hidden':'true'}));
	$(closeSpan).html('&times');

	if(title){
		modalHeader.appendChild($.el.h4({'class':'modal-title'}, title));
	}

	var modalBody = $.a(modalContent, $.el.div({'class':'modal-body'}, contentEl));

	var modalFooter = $.a(modalContent, $.el.div({'class':'modal-footer'}));

	for(var i=0; i < buttons.length; i++){
		var button = $.a(modalFooter, $.el.button({
			'type':'button',
			'class':'btn btn-default'
		}, buttons[i].text));
		$(button).click(function(){
			if(this.callback){
				this.callback(this.text);
			}
		}.bind(buttons[i]));
	}

	return modal;
}

/*
ModelSavingView provides visual feedback as a model is saved, including when there is an error
*/
skella.views.ModelSavingView = Backbone.View.extend({
	className:'model-saving-view',
	tagName: 'span',
	initialize: function(options){
		_.bindAll(this, 'startSpinning', 'stopSpinning');
		this.options = options;
		this.spinner = $.a(this.$el, $.el.i({'class':'glyphicon glyphicon-ok'}));
		$(this.spinner).hide();

		this.error = $.a(this.$el, $.el.i({'class':'error-icon glyphicon glyphicon-ban-circle'}));
		$(this.error).hide();

		this.options.model.on('request', this.startSpinning);
		this.options.model.on('sync', this.stopSpinning);
		this.options.model.on('error', this.stopSpinning);
	},
	startSpinning: function(){
		$(this.spinner).show();
	},
	stopSpinning: function(success){ // if success is false, show a red error animation
		if(success){
			$(this.spinner).hide(1000);
			return;
		}
		$(this.spinner).hide();
		$(this.error).show();
		$(this.error).hide(2000);
	}
})

/*
autosave watches the model for changes and then calls save after `wait` milliseconds.
This used when you have someone editing a model and want to save after they stop for a bit.
*/
skella.views.autosave = function(model, wait, startCallback, successCallback, errorCallback) {
	var previousAttributes = _.clone(model.attributes);
	delete previousAttributes['updated'];
	var changeHandler = _.throttle(function(){
		var newAttributes = _.clone(model.attributes);
		delete newAttributes['updated'];
		if(_.isEqual(previousAttributes, newAttributes)){
			return;
		}
		previousAttributes = newAttributes;
		var options = {};
		if(successCallback) options['success'] = successCallback;
		if(errorCallback) options['error'] = errorCallback;
		if(startCallback) startCallback();
		model.save(null, options);
	}, wait, {'leading':false});
	model.on('change', changeHandler);
}

// Show the current value of the field in the input, then use user input to update the model
skella.views.bindTextInput = function(fieldName, model, input){
	var $input = $(input);
	if($input.hasClass('form-control-static')){
		$input.text(model.get(fieldName) || "");
	} else {
		$input.val(model.get(fieldName) || "");
	}
	$input.keyup(function(event){
		if($input.val() != model.get(fieldName)){
			model.set(fieldName, $input.val());
		}
	});
}

/*
bindModelDisplay displays in an element, el, the value of a model's field, even as it changes
emptyText is shown if the field is empty
*/
skella.views.bindModelDisplay = function(fieldName, model, el, emptyText){
	var $el = $(el);
	$el.text(model.get(fieldName) || emptyText);
	model.on('change:' + fieldName, function(model, newValue){
		$el.text(newValue || emptyText);
	});
}

/*
generateCheckbox creates a bootstrap style form-group for a checkbox element
*/
skella.views.generateCheckbox = function(name, id, label){
	var formGroup = $.el.div({'class':'form-group checkbox-form-group'});
	var checkboxDiv = $.el.div({'class':'checkbox'});
	checkboxDiv.appendChild($.el.label({'for':name}, $.el.input({'type':'checkbox'}), label));
	formGroup.appendChild($.el.div({'class':'checkbox-wrapper'}, checkboxDiv));
	return formGroup;
}

/*
Generate a form for use in a bootstrap style form.
Pass an inputType of "static" if it should just be a display field.
*/
skella.views.generateInputFormGroup = function(inputType, name, id, label, placeholder){
	var formGroup = $.el.div({'class':'form-group input-form-group'});
	if(label){
		formGroup.appendChild($.el.label({
			'for':name,
			'class':'control-label'
		}, label));
	}
	if(inputType == 'static'){
		var input = $.el.span({
			'id':id,
			'class':'form-control-static'
		});
	} else if(inputType == 'textarea'){
		var input = $.el.textarea({
			'id':id,
			'class':'form-control',
			'placeholder':placeholder
		});
	} else {
		var input = $.el.input({
			'id':id,
			'type':inputType,
			'class':'form-control',
			'placeholder':placeholder
		});
	}
	formGroup.appendChild($.el.div({'class':'input-wrapper'}, input));
	return formGroup;
}


