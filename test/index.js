var test = require('tape');
var bigwheel = require('./..');

setTimeout(function() {}, 1000);

test('testing single routes', function( t) {

  t.plan(6);

  reset();

  var framework = bigwheel(function(done) {

    done( {

      routes: {
        
        '/': {

          init: function(req, done) {

            t.equal(req.route, '/', '"/" init received "/"');

            done();
          },

          animateIn: function(req, done) {

            t.equal(req.route, '/', '"/" animateIn received "/"');

            done();

            framework.go('/about');
          },

          animateOut: function(req, done) {

            t.equal(req.route, '/about', '"/" animateOut received "/about"');

            done();
          },

          destroy: function(req, done) {

            t.pass('"/" destroy');

            done();
          }
        },

        '/about': function() {

          return {

            init: function(req, done) {

              t.equal(req.route, '/about', '"/about" init received "/about"');

              done();
            },

            animateIn: function(req, done) {

              t.equal(req.route, '/about', '"/about" animateIn received "/about"');              
              done();

              framework.destroy();
              t.end();
            }
          };
        }
      }
    });
  });

  framework.init();
});

test('testing sub frameworks', function(t) {
  reset();

  t.plan(9);

  var gallery = function() {
    return {
      init: function(req,done) {
        t.equal(req.route,'/gallery','/gallery init received /gallery');
        req.framework.go('/gallery/type');
        done();
      },
      destroy: function(req,done) {
        t.equal(req.route,'/end','/gallery destroy received /end');
        done();
      }
    }
  };

  var galleryType = function() {
    return {
      init: function(req,done) {
        t.equal(req.route,'/gallery/:type','/gallery/:type init received /gallery/:type');
        req.framework.go('/gallery/type/1');
        done();
      },
      destroy: function(req,done) {
        t.equal(req.route,'/end','/gallery/:type destroy received /end');
        done();
      }
    }
  };

  var count = 0;
  var galleryTypeImage = function() {
    return {
      init: function(req,done) {
        count++;
        t.equal(req.route,'/gallery/:type/:image','/gallery/:type/:image init received /gallery/:type/:image');
        if (count<2) {
          req.framework.go('/gallery/type/2');
        } else {
          req.framework.go('/end');
        }
        done();
      },
      destroy: function(req,done) {
        if (count<2) {
          t.equal(req.route,'/gallery/:type/:image','/gallery/:type/:image destroy received /gallery/:type/:image');
        } else {
          t.equal(req.route,'/end','/gallery/:type/:image destroy received /end');
        }
        done();
      }
    }
  };

  var end = function() {
    return {
      init: function(req,done) {
        t.equal(req.route,'/end','/end init received /end');
        done();
      },
      animateIn: function(req,done) {
        done();
        setTimeout(function() {
          t.end();
          req.framework.destroy();
        },100);
      },
      destroy: function(req,done) {
        done();
      }
    }
  };

  bigwheel(function(done) {
    done({
      routes: {
        '/': '/gallery',
        '/end': end,
        '/gallery': {section: gallery, routes: {
          '/:type': {section: galleryType, duplicate: true, routes: {
            '/:image': {section: galleryTypeImage, duplicate: true}
          }}
        }}
      }
    })
  }).init();
});

function reset() {
  if(global.location) {
    global.location.hash = '';
  }
  if (global.history && global.history.pushState) {
    global.history.pushState({},'','/');
  }
}
