var lsl = lsl || {};
lsl.views = lsl.views || {};

// The bootstrap breakpoints.  If you change the breakpoints in variables.less then change them here.
// < 768  xs
// < 992  sm
// < 1199 md
//   1200 lg


lsl.sizes = [
	{'min':320, 'max':767, 'name':'xs', 'class':'btn-lsl-xs'},
	{'min':768, 'max':991, 'name':'sm', 'class':'btn-lsl-sm'},
	{'min':992, 'max':1199, 'name':'md', 'class':'btn-lsl-md'},
	{'min':1200, 'max':1000000000, 'name':'lg', 'class':'btn-lsl-lg'}
];


/*
	The main view shown on /staff/lsl/
*/
lsl.views.LivingStyleLibraryView = Backbone.View.extend({
	className: 'living-style-library-view row',
	initialize: function(){
		_.bindAll(this, 'createSectionButtonGroup', 'createIframeControls', 'showSection', 'setDisplayWidth', 'handleMouseDown', 'handleMouseUp', 'handleMouseMove');
		this.mouseIsDown = false;

		this.navCol = $.el.div({'class': 'nav-col'});
		this.$el.append(this.navCol);

		this.sectionButtonGroup = this.createSectionButtonGroup();
		this.navCol.appendChild(this.sectionButtonGroup);

		this.contentCol = $.el.div({'class':'content-col'});
		this.$el.append(this.contentCol);

		// The iFrameLid handles mouse moved events to manually resize the iframe
		this.iFrameLid = $.el.div({'class':'iframe-lid'});
		this.contentCol.appendChild(this.iFrameLid);

		this.iframeControls = $.el.div({'class':'iframe-controls'}, this.createIframeControls());
		this.contentCol.appendChild(this.iframeControls);

		// The iFrameWrapper is what initially handle mouse down and then shows the iFrameLid
		this.iFrameWrapper = $.el.div({'class':'iframe-wrapper'});
		this.contentCol.appendChild(this.iFrameWrapper);
		$(this.iFrameWrapper).mousedown(this.handleMouseDown);
		$(this.iFrameWrapper).mouseup(this.handleMouseUp);
		$(this.iFrameLid).mouseup(this.handleMouseUp);
		$(this.iFrameLid).mouseleave(this.handleMouseUp);
		$(this.iFrameLid).mousemove(this.handleMouseMove);

		this.styleIFrame = $.el.iframe({
			'class': 'living-style-library-iframe',
			'src':'/lsl/living-style-library.html',
			'sandbox': 'allow-same-origin allow-scripts'
		});
		this.iFrameWrapper.appendChild(this.styleIFrame);
	},
	handleMouseDown: function(event){
		event.preventDefault();
		this.mouseIsDown = true;
		this.origClientX = event.clientX;
		this.leftDrag = this.origClientX < ($(this.iFrameWrapper).width() / 2);
		this.origViewportWidth = $(this.styleIFrame).width();
		$(this.iFrameLid).show();
	},
	handleMouseUp: function(event){
		event.preventDefault();
		this.mouseIsDown = false;
		this.origClientX = null;
		this.leftDrag = null;
		this.origViewportWidth = null;
		$(this.iFrameLid).hide();
	},
	handleMouseMove: function(event){
		if(!this.mouseIsDown) return;
		event.preventDefault();
		if(this.leftDrag){
			var sign = -2;
		} else {
			var sign = 2;
		}
		var newViewportWidth = Math.max(lsl.sizes[0].min, this.origViewportWidth + sign * (event.clientX - this.origClientX));
		this.setDisplayWidth(newViewportWidth, false, false);
	},
	createIframeControls: function(){
		var controlDiv = new $.el.div({'class':'resize-button-groups'});
		var createButton = function(title, width, fuzz, btnClass){
			var button = $.el.button({
				'type':'button',
				'class':'btn btn-lsl ' + btnClass
			}, title);
			$(button).click(function(event){
				this.view.setDisplayWidth(this.width, fuzz, true);
			}.bind({'view':this, 'width':width}));
			return button;
		}.bind(this);
		for(var i=0; i < lsl.sizes.length; i++){
			var group = new $.el.div({'class':'btn-group'});
			group.appendChild(createButton(lsl.sizes[i].name + '-min', lsl.sizes[i].min, false, lsl.sizes[i].class));
			group.appendChild(createButton(lsl.sizes[i].name, lsl.sizes[i].min, true, lsl.sizes[i].class));
			group.appendChild(createButton(lsl.sizes[i].name + '-max', lsl.sizes[i].max, false, lsl.sizes[i].class));
			controlDiv.appendChild(group);
		}
		return controlDiv;
	},
	createSectionButtonGroup: function(){
		var group = new $.el.div({'class':'btn-group-vertical'});
		var createButton = function(title, fragment){
			var button = $.el.button({
				'type':'button',
				'class':'btn btn-default'
			}, title);
			$(button).click(function(){
				this.view.showSection(this.fragment);
			}.bind({'view':this, 'fragment':fragment}));
			return button;
		}.bind(this);

		group.appendChild(createButton('Introduction', '#introduction-view'));
		group.appendChild(createButton('Colors', '#colors-view'));
		group.appendChild(createButton('Typography', '#type-hierarchy-view'));
		group.appendChild(createButton('Inline elements', '#inline-elements-view'));
		group.appendChild(createButton('Buttons', '#buttons-view'));
		group.appendChild(createButton('Grid', '#grid-view'));
		group.appendChild(createButton('Navigation', '#navigation-view'));
		group.appendChild(createButton('Dialogs', '#dialog-view'));
		group.appendChild(createButton('Forms', '#forms-view'));

		return group;
	},
	showSection: function(fragment){
		this.styleIFrame.contentWindow.postMessage({
			'action':'showAnchor',
			'fragment':fragment
		}, '*')
	},
	setDisplayWidth: function(width, fuzz, animate){
		var newWidth = width;
		if(fuzz){
			newWidth = width + Math.floor(Math.random() * 150)
		}
		if(animate){
			$(this.styleIFrame).animate({
				'width':newWidth + 'px'
			});
		} else {
			$(this.styleIFrame).css({
				'width': newWidth + 'px'
			});
		}
	}
});

lsl.views.FrameWidthIndicator = Backbone.View.extend({
	className: 'frame-width-indicator',
	initialize: function(options){
		_.bindAll(this, 'handleWindowResize');
		this.options = options;
		$(window).resize(this.handleWindowResize);
	},
	handleWindowResize: function(e){
		var windowWidth = window.innerWidth;
		for(var i=0; i < lsl.sizes.length; i++){
			if(windowWidth >= lsl.sizes[i].min && windowWidth <= lsl.sizes[i].max){
				this.$el.addClass(lsl.sizes[i].name);
				this.$el.text(lsl.sizes[i].name + ' ' + windowWidth + 'px');
			} else {
				this.$el.removeClass(lsl.sizes[i].name);
			}
		}
	}
});

/*
	Copyright 2014 Podipo LLC, All Rights Reserved
	See https://github.com/podipo/skella/blob/master/LICENSE for licensing information.
*/
