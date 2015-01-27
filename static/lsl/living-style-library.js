var lsl = lsl || {};
lsl.views = lsl.views || {};

/*
The bootstrap breakpoints.  If you change the breakpoints in variables.less then change them here.
*/
lsl.sizes = [
	{'min':320, 'max':767, 'name':'xs', 'class':'btn-lsl-xs'},
	{'min':768, 'max':991, 'name':'sm', 'class':'btn-lsl-sm'},
	{'min':992, 'max':1199, 'name':'md', 'class':'btn-lsl-md'},
	{'min':1200, 'max':1000000000, 'name':'lg', 'class':'btn-lsl-lg'}
];

lsl.views.LivingStyleLibraryView = function(options){
	_.bindAll(this, 'createSectionButtonGroup', 'createIFrameControls', 'showSection', 'setDisplayWidth', 'handleMouseDown', 'handleMouseUp', 'handleMouseMove');
	this.options = options || {};
	this.el = document.createElement('div');
	this.el.setAttribute('class','living-style-library-view');

	this.mouseIsDown = false;

	this.navCol = document.createElement('div')
	this.navCol.setAttribute('class', 'nav-col');
	this.el.appendChild(this.navCol);

	this.sectionButtonGroup = this.createSectionButtonGroup();
	this.navCol.appendChild(this.sectionButtonGroup);

	this.contentCol = document.createElement('div');
	this.contentCol.setAttribute('class', 'content-col');
	this.el.appendChild(this.contentCol);

	// The iFrameLid handles mouse moved events to manually resize the iframe
	this.iFrameLid = document.createElement('div');
	this.iFrameLid.setAttribute('class', 'iframe-lid');
	this.contentCol.appendChild(this.iFrameLid);

	this.iFrameControls = document.createElement('div');
	this.iFrameControls.setAttribute('class', 'iframe-controls');
	this.iFrameControls.appendChild(this.createIFrameControls());
	this.contentCol.appendChild(this.iFrameControls);

	// The iFrameWrapper is what initially handles mouse down and then shows the iFrameLid
	this.iFrameWrapper = document.createElement('div');
	this.iFrameWrapper.setAttribute('class', 'iframe-wrapper');
	this.contentCol.appendChild(this.iFrameWrapper);
	this.iFrameWrapper.onmousedown = this.handleMouseDown;
	this.iFrameWrapper.onmouseup = this.handleMouseUp;
	this.iFrameLid.onmouseup = this.handleMouseUp;
	this.iFrameLid.onmouseleave = this.handleMouseUp;
	this.iFrameLid.onmousemove = this.handleMouseMove;

	this.styleIFrame = document.createElement('iframe');
	this.styleIFrame.setAttribute('class', 'living-style-library-iframe');
	this.styleIFrame.setAttribute('src', '/lsl/living-style-library.html');
	this.styleIFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
	this.iFrameWrapper.appendChild(this.styleIFrame);

	return this;
}
lsl.views.LivingStyleLibraryView.prototype.handleMouseDown = function(event){
	event.preventDefault();
	this.mouseIsDown = true;
	this.origClientX = event.clientX;
	this.leftDrag = this.origClientX < this.iFrameWrapper.offsetWidth / 2;
	this.origViewportWidth = this.styleIFrame.offsetWidth;
	$(this.iFrameLid).show();
};
lsl.views.LivingStyleLibraryView.prototype.handleMouseUp = function(event){
	event.preventDefault();
	this.mouseIsDown = false;
	this.origClientX = null;
	this.leftDrag = null;
	this.origViewportWidth = null;
	$(this.iFrameLid).hide();
};
lsl.views.LivingStyleLibraryView.prototype.handleMouseMove = function(event){
	if(!this.mouseIsDown) return;
	event.preventDefault();
	if(this.leftDrag){
		var sign = -2;
	} else {
		var sign = 2;
	}
	var newViewportWidth = Math.max(lsl.sizes[0].min, this.origViewportWidth + sign * (event.clientX - this.origClientX));
	this.setDisplayWidth(newViewportWidth, false);
};
lsl.views.LivingStyleLibraryView.prototype.createIFrameControls = function(){
	var controlDiv = document.createElement('div');
	controlDiv.setAttribute('class', 'resize-button-groups');

	var createButton = function(title, width, fuzz, btnClass){
		var button = document.createElement('button');
		button.setAttribute('type', 'button');
		button.setAttribute('class', 'btn btn-lsl ' + btnClass);
		button.textContent = title;

		button.onclick = function(event){
			this.view.setDisplayWidth(this.width, fuzz);
		}.bind({'view':this, 'width':width});		
		return button;
	}.bind(this);

	for(var i=0; i < lsl.sizes.length; i++){
		var group = document.createElement('div');
		group.setAttribute('class', 'btn-group');
		group.appendChild(createButton(lsl.sizes[i].name + '-min', lsl.sizes[i].min, false, lsl.sizes[i].class));
		group.appendChild(createButton(lsl.sizes[i].name, lsl.sizes[i].min, true, lsl.sizes[i].class));
		group.appendChild(createButton(lsl.sizes[i].name + '-max', lsl.sizes[i].max, false, lsl.sizes[i].class));
		controlDiv.appendChild(group);
	}
	return controlDiv;
};
lsl.views.LivingStyleLibraryView.prototype.createSectionButtonGroup = function(){
	var group = document.createElement('div');
	group.setAttribute('class', 'btn-group-vertical');
	var createButton = function(title, fragment){
		var button = document.createElement('button');
		button.setAttribute('class', 'btn btn-default');
		button.setAttribute('type', 'button');
		button.textContent = title;
		button.onclick = function(){
			this.view.showSection(this.fragment);
		}.bind({'view':this, 'fragment':fragment});
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
};
lsl.views.LivingStyleLibraryView.prototype.showSection = function(fragment){
	this.styleIFrame.contentWindow.postMessage({
		'action':'showAnchor',
		'fragment':fragment
	}, '*')
};
lsl.views.LivingStyleLibraryView.prototype.setDisplayWidth = function(width, fuzz){
	var newWidth = width;
	if(fuzz){
		newWidth = width + Math.floor(Math.random() * 150)
	}
	this.styleIFrame.style.width = newWidth + 'px';
};

lsl.views.FrameWidthIndicator = function(options){
	_.bindAll(this, 'handleWindowResize');
	this.options = options || {};
	this.el = document.createElement('div');
	this.el.setAttribute('class', 'frame-width-indicator');
	$(window).resize(this.handleWindowResize);	
	return this;
}
lsl.views.FrameWidthIndicator.prototype.handleWindowResize = function(){
	var windowWidth = window.innerWidth;
	for(var i=0; i < lsl.sizes.length; i++){
		if(windowWidth >= lsl.sizes[i].min && windowWidth <= lsl.sizes[i].max){
			lsl.addClass(this.el, lsl.sizes[i].name);
			this.el.textContent = lsl.sizes[i].name + ' ' + windowWidth + 'px';
		} else {
			lsl.removeClass(this.el, lsl.sizes[i].name);
		}
	}

}


lsl.removeClass = function(el, clazz){
	el.setAttribute('class', _.without(el.getAttribute('class').split(' '), clazz).join(' '));
}

lsl.addClass = function(el, clazz) {
	var classes = el.getAttribute('class').split(' ');
	classes[classes.length] = clazz;
	el.setAttribute('class', _.uniq(classes).join(' '));
}

/*
	Copyright 2015 Podipo LLC, All Rights Reserved
	See https://github.com/podipo/skella/blob/master/LICENSE for licensing information.
*/