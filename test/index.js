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

  var SUB_ID = 'test sub';

  var tests = [
    function(req, done) {
      t.equal(req.params.id, '1', 'went into section 1');

      process.nextTick( function() {
        sub.go('/2');
        done();
      });
    },

    function(req, done) {
      t.equal(req.params.id, '2', 'went into section 2');

      sub.go('/something/not/good');

      done();
    },

    function(req, done) {
      t.equal(req.route, '404', 'went into section 404');

      framework.go('/end');

      done();
    }
  ];


  var sectionGallery = function() {
    return {
      init: function(req, done) {
        sub = framework.sub(SUB_ID, {
          '/:id': { section: sectionSub, duplicate: true },
          '404': { section: sectionSub }
        });

        t.ok(sub, 'received a sub framework');
        t.equal(sub, framework.sub(SUB_ID), 'sub returned same sub framework with key');

        done();
      }
    };
  };

  var sectionSub = function() {

    return {

      init: function(req, done) {
        tests.shift()(req, done);
      }
    };
  };
  var framework;
  var sub;

  framework = bigwheel(function(done) {
    return {
      routes: {
        '/': '/gallery/1',
        '/gallery/:id': { section: sectionGallery },
        '/end': { init: function(req, done) {
          t.equal(framework.sub(SUB_ID), undefined, 'sub framework got destroyed');

          t.end();

          done();
        }}
      }
    };
  });

  framework.init();
});

function reset() {
  if(global.location) {
    global.location.hash = '';
  }
}
