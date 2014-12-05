module.exports = preloader;

function preloader( onComplete ) {

	this.preloadComplete = onComplete;
}

preloader.prototype = {

	init: function( req, onComplete ) {

		console.log( 'started simulating preload' );
		setTimeout( this.preloadComplete, 3000 );

		onComplete();
	},

	aniIn: function( req, onComplete ) {

		console.log( 'preloader ani in' );
		onComplete();
	},

	aniOut: function( req, onComplete ) {

		console.log( 'preloader ani out' );
		onComplete();
	}
};