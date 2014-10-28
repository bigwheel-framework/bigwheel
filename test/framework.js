var promise = require( 'promise' ),
	bigwheel = require( '../' ),
	testSection = require( './section' );

module.exports = bigwheel( function( onComplete ) {

	// do something fancy here if you'd like

	onComplete( {

		initSection: require( './preloader' ),

		routes: {

			'/': testSection( '#00CAFE', '/about' ),

			'/about': [ testSection( 'rgba( 255, 0, 0, 0.5 )', '/contact' ), 
						testSection( 'rgba( 0, 0, 255, 0.5 )', '/contact' ) ],

			'/contact': testSection( '#CA00FE', '/' ),
			'404': testSection( '#CA0000', '/' )
		}
	});
});