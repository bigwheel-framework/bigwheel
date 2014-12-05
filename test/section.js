module.exports = function( colour, toRoute ) {

	return {

		init: function( req, onComplete ) {

			console.log( 'init', name );
			console.log( req );

			var el = this.el = document.createElement( 'div' );
			el.style.background = colour;
			el.style.position = 'absolute';
			el.style.left = this.el.style.top = '0px';
			el.style.display = 'none';
			el.innerHTML = req.route;
			document.body.appendChild( el );

			el.onclick = function() {

				require( './framework' ).go( toRoute );
			};

			onComplete();
		},

		resize: function( w, h ) {

			console.log( 'resize', name, w, h );
			this.el.style.width = w + 'px'; 
			this.el.style.height = h + 'px';
		},

		aniIn: function( req, onComplete ) {

			console.log( 'aniIn', name );
			this.el.style.display = 'block';

			onComplete();
		},

		aniOut: function( req, onComplete ) {

			console.log( 'aniOut', name );
			this.el.style.display = 'none';
			onComplete();
		},

		destroy: function( req, onComplete ) {

			console.log( 'destroy', name );
			document.body.removeChild( this.el );
		}
	};
};