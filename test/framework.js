var bigwheel = require( '../' ),
	testSection = require( './section' );

// var fw = bigwheel();
// 
// fw.add( '/', testSection( 'info', '#00CAFE', fw, '/about' ) );
// fw.add( '/about', testSection( 'about', '#CAFE00', fw, '/contact' ) );
// fw.add( '/contact', testSection( 'contact', '#CA00FE', fw, '/' ) );

module.exports = bigwheel( {

	'/': testSection( 'info', '#00CAFE', '/about' ),
	'/about': testSection( 'about', '#CAFE00', '/contact' ),
	'/contact': testSection( 'contact', '#CA00FE', '/' )
}).init();