/* This is where the site-wide special sauce lives. */
console.log("Site js")
var skella = {};
skella.views = {};

/*
	A helper function which appends child to parent and returns child.
	Enables code like: `var button = $.a(this.el, $.el.button());`
*/
$.a = function(parent, child){
	$(parent).append(child);
	return child;
}

skella.views.LoginView = Backbone.View.extend({
	className: 'login-view form-horizontal',
	tagName: 'form',
	initialize: function(options){
		this.options = options;
		this.$el.attr({'role':'form'});
		this.usernameFormGroup = $.a(this.el, skella.views.generateInputFormGroup(
			'text', 
			'username', 'username', 
			'Username', 'username'
		));

		this.passwordFormGroup = $.a(this.el, skella.views.generateInputFormGroup(
			'text',
			'password', 'password', 
			'Password', 'password'
		));

		this.checkboxGroup = $.a(this.el, skella.views.generateCheckbox(
			'remember-me', 'remember-me', 'Remember me'
		));

		this.submitButton = $.el.button({
			'type':'submit',
			'class':'btn btn-primary'
		}, this.options.submitText || 'Submit');
		this.submitGroup = $.a(this.el, $.el.div({'class':'form-group submit-form-group'}, $.el.div({'class':'submit-wrapper'}, this.submitButton)));
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
