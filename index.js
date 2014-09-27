//TODO: think of how to handle params from router

//settings
// routes start with / you can define a 404

var vm = require( 'bw-vm' ),
	routes = require( 'routes' );

function bigwheel( settings ) {

	if( !( this instanceof bigwheel ) )
		return new bigwheel( settings );

	this.s = settings || {};

	this.onURL = this.onURL.bind( this );

	this.router = routes();
	this.vm = vm( this.s );
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

		window.addEventListener( 'hashchange', this.onURL );

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

		window.location.hash = to;
	},

	show: function( content ) {

		//check if content is an array or function or object
		
		if( typeof content == 'object' ) {

			this.doShow( content );
		} else if( typeof content == 'function' ) {

			this.doShow( new content );
		} else if( Array.isArray( content ) ) {

			for( var i = 0, len = content.length; i < len; i++ ) {

				this.show( content[ i ] );
			}
		}
	},

	doShow: function( content ) {

		this.vm.show( content );
	},

	doRoute: function( data ) {

		var s = this.s,
			section;

		if( data ) {

			section = s[ data.route ];
		}

		if( section ) {

			this.show( section );
		} else if( s[ '404' ] ) {

			this.show( s[ '404' ] );
		}
	},

	onURL: function() {

		var cRoute = '/';

		if( window.location.hash != '' ) {

			cRoute = window.location.hash.substr( 1 );
		}

		this.doRoute( this.router.match( cRoute ) );
	}
};

module.exports = bigwheel;