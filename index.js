// settings
// postHash
// autoResize
// onRoute
// routes start with / you can define a 404

var vm = require( 'bw-vm' ),
	viewmediator = require( 'bw-viewmediator' ),
	router = require( 'bw-router' ),
	on = require( 'dom-event' );

function bigwheel( settingsFunc ) {

	if( !( this instanceof bigwheel ) )
		return new bigwheel( settingsFunc );

	this.settingsFunc = settingsFunc;

	this.init();
};

bigwheel.prototype = {

	init: function() {

		var onSettingComplete = function( settings ) {

			var s = this.s = settings;

			if( s === undefined )
				throw new Error( 'Your settings function must return a settings Object' );

			if( s.routes === undefined )
				throw new Error( 'Your settings object must define routes' );

			s.autoResize = s.autoResize === undefined ? true : s.autoResize;

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
			
			this.router.init();
		}.bind( this );


		var promise = this.settingsFunc( onSettingComplete );

		if( promise && promise.then )
			promise.then( onSettingComplete );
	},

	add: function( route, section ) {

		this.router.add( route, section );

		return this;
	},

	go: function( to ) {

		this.router.go( to );
	},

	show: function( content, data ) {

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
	},

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