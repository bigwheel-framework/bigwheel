var test = require( 'tape' );
var bigwheel = require( './..' );

setTimeout( function() {}, 1000 );

test( 'testing framework', function( t ) {

  t.plan( 6 );

  if( global.location ) {

    global.location.hash = '';
  }

  var framework = bigwheel( function( done ) {

    done( {

      routes: {

        '/': {

          init: function( req, done ) {

            t.equal( req.route, '/', '"/" init received "/"' );

            done();
          },

          aniIn: function( req, done ) {

            t.equal( req.route, '/', '"/" aniIn received "/"' );

            done();

            framework.go( '/about' );
          },

          aniOut: function( req, done ) {

            t.equal( req.route, '/about', '"/" aniOut received "/about"' );

            done();
          },

          destroy: function( req, done ) {

            t.pass( '"/" destroy' );

            done();
          }
        },

        '/about': function() {

          return {

            init: function( req, done ) {

              t.equal( req.route, '/about', '"/about" init received "/about"' );

              done();
            },

            aniIn: function( req, done ) {

              t.equal( req.route, '/about', '"/about" aniIn received "/about"' );

              done();
            }
          };
        }
      }
    });
  });

  framework.init();
});
