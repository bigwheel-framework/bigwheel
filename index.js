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

		// setup the router
		this.router = settings.router || router(settings.routes);
		this.router.on('route', this.show.bind(this));

		// Re-dispatch routes
		this.router.on('route',this.emit.bind(this,'route'));
		this.router.on('sub_create',this.emit.bind(this,'sub_create'));
		this.router.on('sub_destroy',this.emit.bind(this,'sub_destroy'));

		// handle adding and removing sub routers to the global
		// object for easier retrieval
		this.subFrameworks = {};

		// setup the view manager
		this.vm = vm(this.s);

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



bigwheel.prototype.sub = function(name, routes) {

	var subFrameworks = this.subFrameworks;
	var sub;
	var settings;

	// if there's a subframework with this same name just return it
	if(subFrameworks[ name ]) {

		sub = subFrameworks[ name ];
	// otherwise if we have routes then create a new one
	} else if(routes) {

		// if there is already a subframework with this name just return it
		settings = {
			routes: routes
		};

		settings.router = this.router.sub(routes);

		sub = new bigwheel(function() {
			return settings;
		});

		// if a name was passed save it for later reference
		if(name) {
			subFrameworks[ name ] = sub;

			// if a sub router gets destroyed we should check if its
			// for this sub framework and destroy it
			this.router.on('sub_destroy', function(info) {

				if(info.router === settings.router) {
					subFrameworks[ name ].destroy();
					delete subFrameworks[ name ];
				}				
			});
		}

		sub.init();
	}

	return sub;
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
bigwheel.prototype.go = function(to) {

	this.router.go(to);

	return this;
};

/**
 * Destroys bighweel
 */
bigwheel.prototype.destroy = function() {

	this.router.removeAllListeners('sub_destroy');
	this.router.removeAllListeners('sub_create');
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

	this.vm.resize(w, h);
};

bigwheel.prototype.show = function(info) {
	var section = info.section;
	var req = info.route || {};
	req.previous = this.previousRoute;
	
	// this is the original router callback passed in
	if(this.onRouteCallBack)
		this.onRouteCallBack(section, req);


	// check if section is an array or function or object
	if(Array.isArray(section)) {

		var sections = [];

		for(var i = 0, len = section.length; i < len; i++) {

			if(typeof section[ i ] == 'object') {

				sections[ i ] = section[ i ];
			} else if(typeof section[ i ] == 'function') {

				sections[ i ] = new section[ i ]();
			}	
		}

		this.doShow(viewmediator.apply(undefined, sections), req);
	} else if(typeof section == 'object') {

		this.doShow(section, req);
	} else if(typeof section == 'function') {

		this.doShow(new section(), req);
	}

	this.previousRoute = info.route;

};

bigwheel.prototype.doShow = function(section, req) {

	this.vm.show(section, req);
};

bigwheel.prototype.onResize = function() {

	this.resize(global.innerWidth, global.innerHeight);
};

module.exports = bigwheel;