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
