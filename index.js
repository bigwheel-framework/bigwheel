// settings
// postHash
// autoResize
// onRoute
// routes start with / you can define a 404

var vm = require( 'bw-vm' ),
	viewmediator = require( 'bw-viewmediator' ),
	router = require( 'bw-router' ),
	eventlistener = require( 'eventlistener' );

function bigwheel( settings ) {

	if( !( this instanceof bigwheel ) )
		return new bigwheel( settings );

	var s = this.s = settings || {};

	s.autoResize = s.autoResize === undefined ? true : s.autoResize;

	// setup the router
	this.onRouteCallBack = settings.onRoute;
	settings.onRoute = this.show.bind( this );
	this.router = router( settings );

	// setup the view manager
	this.vm = vm( this.s );

	if( s.autoResize )
		this.onResize();
};

bigwheel.prototype = {

	init: function() {

		this.router.init();

		return this;
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