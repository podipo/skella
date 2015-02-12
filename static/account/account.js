var skella = skella || {};
skella.views = skella.views || {};

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

skella.views.UserImageEditorView = Backbone.View.extend({
	className:'user-image-editor-view',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'handleInputChanged', 'handleImageUploaded', 'handleUploadError', 'handleImageLoaded', 'handleImageError');
		this.imageView = $.a(this.el, $.el.div({'class':'user-image'}));

		this.userImage = new Image();
		this.imageView.appendChild(this.userImage);
		this.userImage.onload = this.handleImageLoaded;
		this.userImage.onerror = this.handleImageError;
		this.userImage.src = '/api/' + window.API_VERSION + '/user/current/image';

		this.form = $.a(this.$el, $.el.form());
		this.fileInput = $.a(this.form, $.el.input({'type':'file', 'name':'image'}));
		$(this.fileInput).change(this.handleInputChanged);
	},
	handleInputChanged: function(){
		var formData = new FormData();
		formData.append('image', this.fileInput.files[0]);
		$.ajax({
			url: '/api/' + window.API_VERSION + '/user/current/image',
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
		this.userImage.src = '/api/0.1.0/user/current/image?t=' + new Date().getTime();
	},
	handleUploadError: function(){
		console.log("Image upload error");
	},
	handleImageError: function(){
		$(this.userImage).hide();
	},
	handleImageLoaded: function(){
		$(this.userImage).show();
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
