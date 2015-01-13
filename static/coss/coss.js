var coss = coss || {};
coss.api = coss.api || {};
coss.views = coss.views || {};

coss.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

coss.Router = Backbone.Router.extend({
	routes: {
		"":"home"
	},
	initialize: function(){
		this.route(/^(.[0-9]?)-(.[0-9]?)$/, "day");
	},
	home: function(){
		window.daysFlipView.showDay(new Date().getMonth() + 1, new Date().getDate());
	},
	day: function(month, date){
		window.daysFlipView.showDay(parseInt(month), parseInt(date));
	}
});
window.router = new coss.Router();

coss.api.Saint = Backbone.Model.extend({
	initialize: function(){
		_.bindAll(this, 'getSaintDayName', 'getDate', 'getDateDisplay', 'getUrl', 'getFullUrl');
	},
	getSaintDayName: function(){
		return 'Saint ' + this.get('name') + ' Day';
	},
	getDate: function(){
		return coss.constructDate(this.get('month'), this.get('date'));
	},
	getDateDisplay: function(){
		return coss.monthNames[this.get('month') - 1] + ' ' + this.get('date');
	},
	getUrl: function(){
		return '#' + this.get('month') + '-' + this.get('date');
	},
	getFullUrl: function(){
		return document.location.protocol + '//' + document.location.host + document.location.pathname + this.getUrl();
	}
});

coss.api.Saints = Backbone.Collection.extend({
	model:coss.api.Saint,
	url:'/coss/coss-data.js',

	// By default, sort the Saints by date
	comparator: function(saint) {
		return saint.getDate().getTime(); 
	},

	findByDate: function(month, date){
		// Return the *index* of the saint in the collection with a date matching or the closest to the month/date passed in.
		var targetDate = coss.constructDate(month, date);
		for(var i =0; i < this.length; i++){
			var saintDate = this.at(i).getDate();
			if(saintDate.getTime() == targetDate.getTime()){ // if targetDate is a saint's day, use that
				return i;
			} else if(saintDate < targetDate){ // if this day is in the past and the next day is in the future, use that
				if(i < this.length - 1 && this.at(i + 1).getDate() > targetDate){
					return i + 1;
				}
			}
		}
		return 0;
	},
	logSaints: function(){
		for(var i=0; i < this.length; i++){
			var saint = this.at(i);
			console.log(saint.get('name'), saint.get('month') + '/' + saint.get('date'));
		}
	}
});

coss.views.DaysFlipView = Backbone.View.extend({
	className: 'days-flip-view',
	events: {
		'click #left-day-arrow':'flipLeft',
		'click #right-day-arrow':'flipRight'
	},
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'navToDay', 'showDay', 'handleReset', 'flipLeft', 'flipRight', 'flip', 'render');
		this.saintIndex = 0;
		this.navDate = null;
		this.options.saints.on('sync', this.handleReset);
	},
	navToDay: function(month, date){
		document.location.href = '#' + month + '-' + date;
	},
	showDay: function(month, date){
		if(this.options.saints.length == 0){
			// Save the navDate for when the reset is triggered
			this.navDate = [month, date];
			return;
		}

		// Ok, we have saints and a nav date, let's go there
		this.saintIndex = this.options.saints.findByDate(month, date);
		var saint = this.options.saints.at(this.saintIndex);
		if(saint.get('month') != month || saint.get('date') != date){
			this.navToDay(saint.get('month'), saint.get('date'));
			return;
		}
		this.render();
	},
	handleReset: function(){
		// find the next saint
		if(this.navDate){
			this.showDay(this.navDate[0], this.navDate[1]);
			this.navDate = null;
		} else {
			this.showDay(new Date().getMonth() + 1, new Date().getDate());
		}
	},
	flipLeft: function(){ return this.flip(-1); },
	flipRight: function(){ return this.flip(1); },
	flip: function(delta){
		var targetIndex = this.saintIndex + delta;
		if(targetIndex < 0){
			targetIndex = this.options.saints.length - 1;
		} else if(targetIndex >= this.options.saints.length){
			targetIndex = 0;
		}
		var saint = this.options.saints.at(targetIndex);
		this.navToDay(saint.get('month'), saint.get('date'));
		return false;
	},
	render: function(){
		this.$el.empty();
		if(this.options.saints.length == 0){
			return this;
		}

		var leftAnchor = $('<a id="left-day-arrow" class="day-arrow" href=".">&laquo;</a>');
		this.$el.append(leftAnchor);
		var rightAnchor = $('<a id="right-day-arrow" class="day-arrow" href=".">&raquo;</a>');
		this.$el.append(rightAnchor);

		var saint = this.options.saints.at(this.saintIndex);
		this.$el.append($.el.h2(saint.getDateDisplay()));
		var dayDetailView = new coss.views.DayDetailView({model:saint});
		this.$el.append(dayDetailView.render().el);
		return this;
	}
})

coss.views.PicView = Backbone.View.extend({
	className: 'pic-view',
	initialize: function(options){
		this.options = options;
		_.bindAll(this, 'render');
	},
	render: function(){
		this.$el.empty();
		this.$el.append($.el.img({'src':this.options.image[0]}));
		this.$el.append($.el.a({'href':this.options.image[1], 'target':'_blank'}, 'source'));
		return this;
	}
})

coss.views.DayDetailView = Backbone.View.extend({
	className: 'day-detail-view',
	initialize: function(){
		_.bindAll(this, 'render');
	},
	render: function(){
		this.$el.empty();
		this.$el.append($.el.h1(this.model.getSaintDayName()));

		var deets = $.el.div({'class':'day-detail-deets'});
		this.$el.append(deets);

		var themes = this.model.get('themes');
		var themeList = $.a(deets, $.el.ul());
		themeList.appendChild($.el.h3('Themes'));
		for(var i=0; i < themes.length; i++){
			themeList.appendChild($.el.li(themes[i]));
		}

		var patronage = this.model.get('patronage');
		var patronageList = $.a(deets, $.el.ul());
		patronageList.appendChild($.el.h3('Patronage'));
		for(var i=0; i < patronage.length; i++){
			patronageList.appendChild($.el.li(patronage[i]));
		}

		var bodyDiv = $('<div>' + this.model.get('body') + '</div>');
		if(this.model.get('image')){
			bodyDiv.prepend(new coss.views.PicView({'image':this.model.get('image')}).render().el);
		}

		this.$el.append($.el.div({'class':'day-detail-body'}, bodyDiv[0]));

		// Now link to All The Things... (G+, Twitter, FB)
		var shortMessage = "Celebrate " + this.model.getSaintDayName() + " on the Calendar of Science Saints: " + this.model.getFullUrl();
		var hashTags = this.model.get('hashtags');
		for(var i=0; i < hashTags.length; i++){
			shortMessage += " #" + hashTags[i];
		}

		// The icons came from http://icondock.com/free/vector-social-media-icons
		var socialIcons = $.el.div({'class':'social-buttons'});
		this.$el.append(socialIcons);
		var gPlusIcon = $.a(socialIcons, $.el.a({'class':'social-button', 'id':'google-plus-button'}, $.el.img({'src':'/coss/social-media-icons/24px/google-plus.png'})));
		gPlusIcon.setAttribute('href', 'https://plus.google.com/share?url=' + encodeURIComponent(this.model.getFullUrl()));
		var twitterIcon = $.a(socialIcons, $.el.a({'class':'social-button', 'id':'twitter-button'}, $.el.img({'src':'/coss/social-media-icons/24px/twitter.png'})));
		twitterIcon.setAttribute('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shortMessage));
		var facebookIcon = $.a(socialIcons, $.el.a({'class':'social-button', 'id':'facebook-button'}, $.el.img({'src':'/coss/social-media-icons/24px/facebook.png'})));
		facebookIcon.setAttribute('href', 'http://www.facebook.com/sharer.php?s=100&p[url]=' + encodeURIComponent(this.model.getFullUrl()) + '&p[title]=' + encodeURIComponent(this.model.getSaintDayName()) + '&p[summary]=' + encodeURIComponent(shortMessage));
		var deliciousIcon = $.a(socialIcons, $.el.a({'class':'social-button', 'id':'delicious-button'}, $.el.img({'src':'/coss/social-media-icons/24px/delicious.png'})));
		deliciousIcon.setAttribute('href', 'http://del.icio.us/post?url=' + encodeURIComponent(this.model.getFullUrl()) + '&title=' + encodeURIComponent(this.model.getSaintDayName()));
		var emailIcon = $.a(socialIcons, $.el.a({'class':'social-button', 'id':'email-button'}, $.el.img({'src':'/coss/social-media-icons/24px/email.png'})));
		emailIcon.setAttribute('href', 'mailto:?subject=' + encodeURIComponent(this.model.getSaintDayName()) + '&body=' + encodeURIComponent(shortMessage));
		$(socialIcons).find('a').attr('target', '_blank');

		return this;
	}
})

coss.constructDate = function(month, day){
	var d = new Date();
	d.setDate(1); // So that when we set the month it doesn't roll over if today is the 31st
	d.setMonth(parseInt(month) - 1);
	d.setDate(parseInt(day));
	d.setHours(12);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d;	
}

coss.formatDate = function(month, day){
	return coss.constructDate(month, day).toLocaleDateString();
}