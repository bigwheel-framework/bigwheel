var bigwheel = require( '../' ),
	testSection = require( './section' );

// var fw = bigwheel();
// 
// fw.add( '/', testSection( 'info', '#00CAFE', fw, '/about' ) );
// fw.add( '/about', testSection( 'about', '#CAFE00', fw, '/contact' ) );
// fw.add( '/contact', testSection( 'contact', '#CA00FE', fw, '/' ) );

module.exports = bigwheel( {

	'/': testSection( 'info', '#00CAFE', '/about' ),

	'/about': [ testSection( 'about 1', 'rgba( 255, 0, 0, 0.5 )', '/contact' ), 
				testSection( '<br />about 2', 'rgba( 0, 0, 255, 0.5 )', '/contact' ) ],

	'/contact': testSection( 'contact', '#CA00FE', '/' ),
	'404': testSection( '404', '#CA0000', '/' )
}).init();