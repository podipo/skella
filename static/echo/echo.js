/*
This is example funcationality for the Skellago example APIs like Echo
*/
var example = example || {};
example.views = example.views || {};

/*
EchoView simply GETs to the Echo resource and displays the resulting (predictable) response.
*/
example.views.EchoView = Backbone.View.extend({
	className: 'echo-view',
	initialize: function(options){
		_.bindAll(this, 'handleSend', 'handleGetSuccess', 'handleGetError');
		this.options = options;

		// Echo is an automatically generated Backbone.Model from the Skella back end
		this.echo = new window.schema.api.Echo();

		this.$el.append($.el.h3("Echo"));

		// This creates a Bootstrap styled element containing an input element
		this.inputGroup = skella.views.generateInputFormGroup('text', 'echo-input', 'echo-input', null, 'Hello World');
		this.$el.append(this.inputGroup);

		// Find and save the actual input element for later use
		this.input = $(this.inputGroup).find('input');
		$(this.input).val('Hello, World');

		// If the user hits enter, GET the echo
		$(this.input).keyup(function(event){
			if(event.keyCode == 13){
				this.handleSend();
			}
		}.bind(this));

		this.results = $.a(this.el, $.el.div({'class':'echo-results'}));
	},
	handleSend: function(){
		var val = $(this.input).val();
		if(val.trim().length == 0) {
			return;
		}
		this.echo.rawGet({'text':val}, this.handleGetSuccess, this.handleGetError);
	},
	handleGetSuccess: function(resultData){
		var timestamp = new moment(resultData.time);
		$(this.results).prepend($.el.p(
			resultData.text + ' - ' + timestamp.format(skella.TimestampFormat)
		));
	},
	handleGetError: function(){
		console.log("Error", arguments);
	}
})
