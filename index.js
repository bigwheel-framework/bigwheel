//TODO: separate out router just for future maintainability

// settings
// postHash
// autoResize
// routes start with / you can define a 404

var vm = require( 'bw-vm' ),
	viewmediator = require( 'bw-viewmediator' ), 
	eventlistener = require( 'eventlistener' ),
	routes = require( 'routes' );

function bigwheel( settings ) {

	if( !( this instanceof bigwheel ) )
		return new bigwheel( settings );

	var s = this.s = settings || {};

	s.postHash = s.postHash || '!';
	s.autoResize = s.autoResize === undefined ? true : s.autoResize;

	this.router = routes();
	this.vm = vm( this.s );

	if( s.autoResize )
		this.onResize();
};

bigwheel.prototype = {

	init: function() {

		var s = this.s,
			noop = function() {};

		// figure out a start section
		if( s[ '/' ] === undefined ) {

			// find the first path which would be a section
			for( var i in s ) {

				if( i[ 0 ] == '/' ) {

					s.start = i;

					break;
				}
			}
		} else {

			s.start = '/';
		}


		// now setup routes
		for( var i in s ) {

			if( i[ 0 ] == '/' ) {

				this.router.addRoute( i, noop );
			}
		}

		eventlistener.add( window, 'hashchange', this.onURL.bind( this ) );

		if( s.autoResize )
			eventlistener.add( window, 'resize', this.onResize.bind( this ) );

		// force a hash change to start things up
		this.onURL();

		return this;
	},

	add: function( route, section ) {

		var s = this.s;

		s[ route ] = section;

		return this;
	},

	go: function( to ) {

		if( to[ 0 ] != '/' )
			to = '/' + to;

		window.location.hash = this.s.postHash + to;
	},

	show: function( content, data ) {

		//check if content is an array or function or object
		
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

	doRoute: function( data ) {

		var s = this.s,
			section;

		if( data ) {

			section = s[ data.route ];
		}

		if( section ) {

			this.show( section, data );
		} else if( s[ '404' ] ) {

			this.show( s[ '404' ], data );
		}
	},

	onResize: function() {

		this.resize( window.innerWidth, window.innerHeight );
	},

	onURL: function() {

		var cRoute = '/';

		if( window.location.hash != '' ) {

			cRoute = window.location.hash.substr( 1 + this.s.postHash.length );
		}

		this.doRoute( this.router.match( cRoute ) );
	}
};

module.exports = bigwheel;