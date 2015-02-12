var skella = skella || {};
skella.views = skella.views || {};

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
		this.$el.append($.el.h2(this.options.endpoint.title));
		this.$el.append($.el.h3(this.options.endpoint.path));
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