/* This is where the site-wide special sauce lives. */
var skella = skella || {};
skella.views = {};

$(document).ready(function(){
	window.schema.on(skella.events.SchemaPopulated, skella.views.schemaPopulated);
})

skella.views.schemaPopulated = function(){
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
	if(window.schema && window.schema.user){
		// React to changes to the user
		window.schema.on(skella.events.LoggedIn, skella.views.updateAccountNav);
		window.schema.on(skella.events.LoggedOut, skella.views.updateAccountNav);
		window.schema.user.on('change:first-name', skella.views.updateAccountNav);
		window.schema.user.on('change:last-name', skella.views.updateAccountNav);
		window.schema.user.on('change:email', skella.views.updateAccountNav);
	}
	if(window.schema){
		window.schema.on(skella.events.LoggedIn, skella.views.updateAccountNav);
	}
}

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
		_.bindAll(this);
		this.$el.addClass('collection-view');
		this.itemViews = [];
		this.itemList = $.el.ul();

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
		this.itemViews[this.itemViews.length] = new this.options.itemView({'model':item, 'parentView':this});
		if(this.options.itemClasses){
			this.itemViews[this.itemViews.length - 1].$el.addClass(this.options.itemClasses);
		}
		this.itemList.appendChild(this.itemViews[this.itemViews.length - 1].render().el);
	},
	remove: function(idea){
		console.log('TODO remove', arguments);
	}
})

skella.views.LoginView = Backbone.View.extend({
	className: 'login-view form-horizontal',
	tagName: 'form',
	initialize: function(options){
		_.bindAll(this, 'handleSubmit', 'handleLoginSuccess', 'handleLoginFailure', 'hideError', 'showError');
		this.options = options;
		this.$el.attr({
			'role':'form',
		});
		this.emailFormGroup = $.a(this.el, skella.views.generateInputFormGroup(
			'text', 
			'email', 'email', 
			'Email', 'email'
		));

		this.passwordFormGroup = $.a(this.el, skella.views.generateInputFormGroup(
			'password',
			'password', 'password', 
			'Password', 'password'
		));

		this.submitButton = $.el.button({
			'type':'submit',
			'class':'btn btn-primary'
		}, this.options.submitText || 'Submit');
		this.submitGroup = $.a(this.el, $.el.div({'class':'form-group submit-form-group'}, $.el.div({'class':'submit-wrapper'}, this.submitButton)));

		this.$el.submit(this.handleSubmit);
	},
	hideError: function(){
		this.$el.find('.error').remove();
	},
	showError: function(message){
		this.hideError();
		this.$el.prepend($.el.p({'class':'error'}, message));
	},
	handleSubmit: function(event){
		event.preventDefault();
		var email = $(this.emailFormGroup).find('input').val();
		var password = $(this.passwordFormGroup).find('input').val();
		if(email == "" || password == "") {
			this.showError('Please enter an email and password.');
			return;
		}
		skella.api.login(email, password, this.handleLoginSuccess, this.handleLoginFailure); 
	},
	handleLoginSuccess: function(){
		if(skella.urlParams.next) {
			document.location.href = skella.urlParams.next;
		} else {
			document.location.href = "/";
		}
	},
	handleLoginFailure: function(){
		this.showError('Email or password do not match.');
	}
});

skella.views.ModelSavingView = Backbone.View.extend({
	className:'model-saving-view',
	tagName: 'span',
	initialize: function(options){
		_.bindAll(this, 'startSpinning', 'stopSpinning');
		this.options = options;
		this.spinner = $.a(this.$el, $.el.i({'class':'glyphicon glyphicon-save'}));
		$(this.spinner).hide();
		this.options.model.on('request', this.startSpinning);
		this.options.model.on('sync', this.stopSpinning);
		this.options.model.on('error', this.stopSpinning);
	},
	startSpinning: function(){
		$(this.spinner).show();
	},
	stopSpinning: function(){
		$(this.spinner).hide();
	}
})

skella.views.UserImageEditorView = Backbone.View.extend({
	className:'user-image-editor-view',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'handleInputChanged', 'handleImageUploaded', 'handleUploadError', 'handleImageLoaded');
		this.imageView = $.a(this.el, $.el.div({'class':'user-image'}));

		this.userImage = new Image();
		this.imageView.appendChild(this.userImage);
		this.userImage.onload = this.imageLoaded;
		this.userImage.src = '/api/0.1.0/user/current/image';

		this.form = $.a(this.$el, $.el.form());
		this.fileInput = $.a(this.form, $.el.input({'type':'file', 'name':'image'}));
		$(this.fileInput).change(this.handleInputChanged);
	},
	handleInputChanged: function(){
		var formData = new FormData();
		formData.append('image', this.fileInput.files[0]);
		$.ajax({
			url: '/api/0.1.0/user/current/image',
			data: formData,
			headers :  {
				'Accept': skella.schema.acceptFormat + window.API_VERSION
			},
			cache: false,
			contentType: false,
			processData: false,
			type: 'PUT',
			success: this.handleImageUploaded,
			error: this.handleUploadError
		});
	},
	handleImageUploaded: function(){
		console.log("Image uploaded");
		this.userImage.src = '/api/0.1.0/user/current/image?t=' + new Date().getTime();
	},
	handleUploadError: function(){
		console.log("Image upload error");
	},
	handleImageLoaded: function(){
		console.log("Image loaded");
	}
});

skella.views.UserEditorView = Backbone.View.extend({
	className:'user-editor-view',
	initialize: function(options){
		this.options = options;
		if (!this.options.model) throw 'UserEditorView requires a model option';
		this.form = $.el.form({'class':'form-horizontal', 'role':'form'});
		this.$el.append(this.form);

		this.emailGroup = $.a(this.form, skella.views.generateInputFormGroup(
			"static", "email", "email", "email", "email"
		));
		skella.views.bindTextInput("email", this.options.model, $(this.emailGroup).find('.form-control-static'));

		this.firstNameGroup = $.a(this.form, skella.views.generateInputFormGroup(
			"text", "first-name", "first-name", "first name", "first name"
		));
		skella.views.bindTextInput("first-name", this.options.model, $(this.firstNameGroup).find('input'));

		this.lastNameGroup = $.a(this.form, skella.views.generateInputFormGroup(
			"text", "last-name", "last-name", "last name", "last name"
		));
		skella.views.bindTextInput("last-name", this.options.model, $(this.lastNameGroup).find('input'));

		this.modelSavingView = new skella.views.ModelSavingView({'model':this.options.model});
		this.form.appendChild(this.modelSavingView.el);

		skella.views.autosave(this.options.model, 1000, null, null, null);
	}
});

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
	formGroup.appendChild($.el.label({
		'for':name,
		'class':'control-label'
	}, label));
	if(inputType == 'static'){
		var input = $.el.span({
			'id':id,
			'class':'form-control-static'
		})
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

skella.views.APIDocView = Backbone.View.extend({
	className: 'api-doc-view',
	initialize: function(options){
		this.options = options;
		if(!this.options.schema) throw 'This view requires an options.schema';
		var endpoints = this.options.schema.get('endpoints');
		for(var i=0; i < endpoints.length; i++){
			this.$el.append(new skella.views.EndpointView({
				'endpoint':endpoints[i]
			}).el);
		}
	}
});

skella.views.EndpointView = Backbone.View.extend({
	className: 'endpoint-view',
	initialize: function(options){
		this.options = options;
		if(!this.options.endpoint) throw 'EndpointView requires an options.endpoint';
		this.$el.append($.el.h2(this.options.endpoint.path));
		this.$el.append($.el.h3(this.options.endpoint.title));
		this.$el.append($.el.div({'class':'description'}, this.options.endpoint.description));

		var propertyTable = $.a(this.el, $.el.table({'class':'property-table'}));
		propertyTable.appendChild($.el.tr(
			$.el.th('name'),
			$.el.th('type'),
			$.el.th('optional'),
			$.el.th('child type'),
			$.el.th('description')
		));
		for(var i=0; i < this.options.endpoint.properties.length; i++){
			var property = this.options.endpoint.properties[i];
			var propertyRow = $.a(propertyTable, $.el.tr());
			propertyRow.appendChild($.el.td(property['name']));
			propertyRow.appendChild($.el.td(property['data-type']));
			propertyRow.appendChild($.el.td(property['optional'] === true ? 'true':'false'));
			propertyRow.appendChild($.el.td(property['children-type']));
			propertyRow.appendChild($.el.td(property['description']));
		}
	}
})

