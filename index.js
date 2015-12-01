/** @module bigwheel */

var vm = require('bw-vm');
var viewmediator = require('bw-viewmediator');
var router = require('bw-router');
var on = require('dom-event');
var EventEmitter = require('events').EventEmitter;

/**
 * When instantiating bigwheel you must pass in a setup function.
 *
 * In this function you may do any preparation that must be done for your
 * application such as creating a global Canvas element or something else.
 *
 * The setup function must either return a settings object for bigwheel or
 * this function must receive a callback which you will call with the settings
 * object. Furthermore you can pass back a promise from this settings function
 * which will receive the settings object.
 *
 * The following documents what can be passed in the settings object:
 * ```javascript
 * {
 * 	///// REQUIRED /////
 *
 * 	// routes defines all the routes for your website it can also define a 
 * 	// 404 section which will be opened if the route is incorrect
 *  routes: {
 *  	postHash: '#!', // this string is appended before the route. 
 *  	                // by default it's value is '#!'
 * 		'/': someSection,
 * 		'/someOther': someOtherSection,
 * 		'404': sectionFourOhFour
 *  },
 *  
 *  ///// OPTIONAL /////
 *  initSection: preSection, // this could be a section that is run always
 *  						 // before routes are even evaluated. This is
 *  						 // usefulf for site preloaders or landing pages
 *  						 // such as age verification (something the user
 *  						 // must see)
 * 
 * 	autoResize: true, // by default this value is true. When this value is
 * 					  // true a resize listener is added to the window
 * 					  // whenever the window changes size it's width and
 * 					  // height is passed to all instantiated sections
 * }
 * ```
 * 
 * @class bigwheel
 * @param  {Function} settingsFunc This settings function will be used to
 * initialize bigwheel.
 */
function bigwheel(settingsFunc) {

	if(!(this instanceof bigwheel))
		return new bigwheel(settingsFunc);

	this.settingsFunc = settingsFunc;
	EventEmitter.call(this);

}

bigwheel.prototype = Object.create(EventEmitter.prototype);

/**
 * init must be called to start the framework. This was done to allow for
 * a developer to have full control of when bigwheel starts doing it's thing.
 */
bigwheel.prototype.init = function() {

	var onSettingComplete = function(settings) {

		var s = this.s = settings;

		if(s === undefined)
			throw new Error('Your settings function must return a settings Object');

		if(s.routes === undefined)
			throw new Error('Your settings object must define routes');

		s.autoResize = s.autoResize === undefined ? true : s.autoResize;

		this.previousRoute = undefined;

		this.depth = [];
		this.vms = [];
		this.routes = {};
		this.parseRoutes(settings.routes);

		// setup the router
		this.router = router(this.routes);
		this.router.on('route', this.show.bind(this));

		// Re-dispatch routes
		this.router.on('route',this.emit.bind(this,'route'));

		// check if 
		if(s.autoResize && global.innerWidth !== undefined && global.innerHeight !== undefined) {

			on(global, 'resize', this.onResize.bind(this));

			this.onResize();
		}
		
		// handle if there is an init section this should be shown even before
		// the router resolves
		if(s.initSection)
			this.show({section: s.initSection.bind(undefined, this.router.init.bind(this.router))});
		else
			this.router.init();
	}.bind(this);


	var rVal = this.settingsFunc(onSettingComplete);

	// check if promises are used instead
	// it might be good to remove this since theres no
	// need for promises in this case
	if(rVal && rVal.then)
		rVal.then(onSettingComplete);
	// check if just an object was returned which has .routes
	else if(rVal && rVal.routes)
		onSettingComplete(rVal);

	return this;
};

bigwheel.prototype.parseRoutes = function(routes,prefix) {
	var depth = (prefix || '').split('/').length;
	if (this.vms.length<depth) this.vms.push(vm(this.s));
	prefix = prefix || "";
	for (var key in routes) {
		if (key.charAt(0)==='/') {
			if (prefix) routes[key].parent = prefix;
			this.routes[prefix+key] = routes[key];
			if (routes[key].routes) {
				this.parseRoutes(routes[key].routes,prefix+key);
				delete routes[key].routes;
			}
		} else {
			this.routes[key] = routes[key];
		}
	}
};

/**
 * go can be called to go to another section.
 * 
 * @param  {String} to This is the route you want to go to.
 *
 * @example
 * ```javascript
 * framework.go('/landing');
 * ```
 */
bigwheel.prototype.go = function(to,options) {

	this.router.go(to,options);

	return this;
};

/**
 * Destroys bighweel
 */
bigwheel.prototype.destroy = function() {

	this.router.removeAllListeners('route');
	this.router.destroy();

};

/**
 * Resize can be called at any time. The values passed in for
 * width and height will be passed to the currently instantiated
 * sections.
 *
 * If `autoResize` was not passed in or it was true then resize
 * will automatically be called when the window of the browser
 * resizes.
 * 
 * @param  {Number} w width value you'd like to pass to the sections
 * @param  {Number} h height value you'd like to pass to the sections
 */
bigwheel.prototype.resize = function(w, h) {
	for (var i=0; i<this.vms.length; i++) {
		this.vms[i].resize(w,h);
	}
};

bigwheel.prototype.show = function(info) {
	var section = info.section;
	var req = info.route || {};
	req.previous = this.previousRoute;
	req.framework = this;

	if (req.route) {
		var depth = [this.rebuildRoute(req.route,info.path)];
		var views = [section.section || section];
		while (section.parent) {
			depth.unshift(this.rebuildRoute(section.parent,info.path));
			section = this.routes[section.parent];
			views.unshift(section.section || section);
		}

		var prevDepth = this.depth;
		this.depth = depth;
		var total = Math.max(prevDepth.length,depth.length);
		for (var i=0; i<total; i++) {
			if (i>depth.length-1) {
				this.vms[i].clear(req);
			} else if (prevDepth[i]!=depth[i]) {
				this.vms[i].show(this.parseSection(views[i]),req);
			}
		}
	} else {
		this.vms[0].show(this.parseSection(section.section || section),req);
	}
	
	this.previousRoute = info.route;
};

bigwheel.prototype.rebuildRoute = function(route,path) {
	var path = path.split('/')
	path.length = route.split('/').length;
	return path.join('/');
};

bigwheel.prototype.parseSection = function(section) {
	if (Array.isArray(section)) {
		for (var i=0; i<section.length; i++) {
			if (typeof section[i] == 'function') section[i] = new section[i]();
		}
		return viewmediator.apply(undefined,section);
	} else if (typeof section == 'function') {
		return new section();
	} else {
		return section;
	}
};

bigwheel.prototype.onResize = function() {

	this.resize(global.innerWidth, global.innerHeight);
};

module.exports = bigwheel;