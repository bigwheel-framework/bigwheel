/** @module bigwheel */

var vm = require( 'bw-vm' ),
	viewmediator = require( 'bw-viewmediator' ),
	router = require( 'bw-router' ),
	on = require( 'dom-event' );
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
 *
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
 * 	postHash: '#!', // this string is appended before the route. 
 * 					// by default it's value is '#!'
 * }
 * ```
 * 
 * @class bigwheel
 * @param  {Function} settingsFunc This settings function will be used to
 * initialize bigwheel.
 */
function bigwheel( settingsFunc ) {

	if( !( this instanceof bigwheel ) )
		return new bigwheel( settingsFunc );

	this.settingsFunc = settingsFunc;
};

bigwheel.prototype = {

	/**
	 * init must be called to start the framework. This was done to allow for
	 * a developer to have full control of when bigwheel starts doing it's thing.
	 */
	init: function() {

		var onSettingComplete = function( settings ) {

			var s = this.s = settings;

			if( s === undefined )
				throw new Error( 'Your settings function must return a settings Object' );

			if( s.routes === undefined )
				throw new Error( 'Your settings object must define routes' );

			s.autoResize = s.autoResize === undefined ? true : s.autoResize;
			s.duplicate = s.duplicate === undefined ? true : s.duplicate;

			// setup the router
			this.onRouteCallBack = settings.onRoute;
			settings.routes.onRoute = this.show.bind( this );
			this.router = router( settings.routes );

			// setup the view manager
			this.vm = vm( this.s );

			if( s.autoResize ) {

				on( window, 'resize', this.onResize.bind( this ) );

				this.onResize();
			}
			
			if( s.initSection )
				this.show( s.initSection.bind( undefined, this.router.init.bind( this.router ) ) );
			else
				this.router.init();
		}.bind( this );


		var rVal = this.settingsFunc( onSettingComplete );

		if( rVal && rVal.then )
			rVal.then( onSettingComplete );
		else if( rVal && rVal.routes )
			onSettingComplete( rVal );
	},

	/**
	 * go can be called to go to another section.
	 * 
	 * @param  {String} to This is the route you want to go to.
	 *
	 * @example
	 * ```javascript
	 * framework.go( '/landing' );
	 * ```
	 */
	go: function( to ) {

		this.router.go( to );
	},

	show: function( content, data ) {
		
		if (!this.s.duplicate && data && data.route==this.lastRoute) return;
		// this is the original router callback passed in
		if( this.onRouteCallBack )
			this.onRouteCallBack( content, data );


		// check if content is an array or function or object
		if( Array.isArray( content ) ) {

			var contents = [];

			for( var i = 0, len = content.length; i < len; i++ ) {

				if( typeof content[ i ] == 'object' ) 
					contents[ i ] = content[ i ];
				else if( typeof content[ i ] == 'function' )
					contents[ i ] = new content[ i ];
			}

			this.doShow( viewmediator.apply( undefined, contents ), data );
		} else if( typeof content == 'object' ) {

			this.doShow( content, data );
		} else if( typeof content == 'function' ) {

			this.doShow( new content, data );
		}

		this.lastRoute = (data) ? data.route : undefined;
	},

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
	resize: function( w, h ) {

		this.vm.resize( w, h );
	},

	doShow: function( content, data ) {

		this.vm.show( content, data );
	},

	onResize: function() {

		this.resize( window.innerWidth, window.innerHeight );
	}
};

module.exports = bigwheel;