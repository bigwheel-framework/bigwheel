var promise = require( 'promise' ),
	bigwheel = require( '../' ),
	testSection = require( './section' );

// module.exports = bigwheel( function() {

// 	return new promise( function( onOk, onErr ) {

// 		onOk( {

// 			'/': testSection( '#00CAFE', '/about' ),

// 			'/about': [ testSection( 'rgba( 255, 0, 0, 0.5 )', '/contact' ), 
// 						testSection( 'rgba( 0, 0, 255, 0.5 )', '/contact' ) ],

// 			'/contact': testSection( '#CA00FE', '/' ),
// 			'404': testSection( '#CA0000', '/' )
// 		});
// 	});

// }).init();


module.exports = bigwheel( function( cb ) {

	cb( {

		'/': testSection( '#00CAFE', '/about' ),

		'/about': [ testSection( 'rgba( 255, 0, 0, 0.5 )', '/contact' ), 
					testSection( 'rgba( 0, 0, 255, 0.5 )', '/contact' ) ],

		'/contact': testSection( '#CA00FE', '/' ),
		'404': testSection( '#CA0000', '/' )
	});
}).init();