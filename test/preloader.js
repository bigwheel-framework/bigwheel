module.exports = preloader;

function preloader( onComplete ) {

	this.preloadComplete = onComplete;
}

preloader.prototype = {

	init: function( onComplete ) {

		console.log( 'started simulating preload' );
		setTimeout( this.preloadComplete, 3000 );

		onComplete();
	},

	aniIn: function( onComplete ) {

		console.log( 'preloader ani in' );
		onComplete();
	},

	aniOut: function( onComplete ) {

		console.log( 'preloader ani out' );
		onComplete();
	}
};