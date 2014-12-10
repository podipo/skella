/* This is where the site-wide special sauce lives. */
var skella = skella || {};
skella.views = {};

/*
	A helper function which appends child to parent and returns child.
	Enables code like: `var button = $.a(this.el, $.el.button());`
*/
$.a = function(parent, child){
	$(parent).append(child);
	return child;
}

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
			'text',
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
		document.location.href = "/";
	},
	handleLoginFailure: function(){
		this.showError('Email or password do not match.');
	}
});

skella.views.generateCheckbox = function(name, id, label){
	var formGroup = $.el.div({'class':'form-group checkbox-form-group'});
	var checkboxDiv = $.el.div({'class':'checkbox'});
	checkboxDiv.appendChild($.el.label({'for':name}, $.el.input({'type':'checkbox'}), label));
	formGroup.appendChild($.el.div({'class':'checkbox-wrapper'}, checkboxDiv));
	return formGroup;
}

skella.views.generateInputFormGroup = function(inputType, name, id, label, placeholder){
	var formGroup = $.el.div({'class':'form-group input-form-group'});
	formGroup.appendChild($.el.label({
		'for':name,
		'class':'control-label'
	}, label));
	var input = $.el.input({
		'id':id,
		'type':inputType,
		'class':'form-control',
		'placeholder':placeholder
	});
	formGroup.appendChild($.el.div({'class':'input-wrapper'}, input));
	return formGroup;
}
