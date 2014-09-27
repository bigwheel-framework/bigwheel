module.exports = function( colour, toRoute ) {

	return {

		init: function( data, onComplete ) {

			if( !onComplete && typeof data == 'function' )
				onComplete = data;

			console.log( 'init', name );
			console.log( data );

			var el = this.el = document.createElement( 'div' );
			el.style.background = colour;
			el.style.position = 'absolute';
			el.style.left = this.el.style.top = '0px';
			el.style.display = 'none';
			el.innerHTML = data.route;
			document.body.appendChild( el );

			el.onclick = function() {

				require( './framework' ).go( toRoute );
			}

			onComplete();
		},

		resize: function( w, h ) {

			console.log( 'resize', name, w, h );
			this.el.style.width = w + 'px'; 
			this.el.style.height = h + 'px';
		},

		aniIn: function( onComplete ) {

			console.log( 'aniIn', name );
			this.el.style.display = 'block';

			onComplete();
		},

		aniOut: function( onComplete ) {

			console.log( 'aniOut', name );
			this.el.style.display = 'none';
			onComplete();
		},

		destroy: function() {

			console.log( 'destroy', name );
			document.body.removeChild( this.el );
		}
	};
}