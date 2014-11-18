$(document).ready(function(){

	QUnit.test( "Login View", function( assert ) {
		var loginView = new skella.views.LoginView({});
		assert.ok(typeof loginView !== 'undefined', "LoginView instanciated");
	});	

});
