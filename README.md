# bigwheel

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

bigwheel is an unopinionated, minimalist framework which handles frontend application state. It can be used to organize your application into "sections"/pages which are brought in by routes. Animation is a first class citizen and is accounted for when managing application states. bigwheel does not conform to a specific render engine framework so a project which is based on the DOM, WebGL, Canvas2D, SVG, or even Console applications can be built using bigwheel.

## Full Documentation

[https://github.com/bigwheel-framework/documentation](https://github.com/bigwheel-framework/documentation)

## Usage

[![NPM](https://nodei.co/npm/bigwheel.png)](https://www.npmjs.com/package/bigwheel)

## Example
```javascript
var bigwheel = require('bigwheel');
var Tween = require('gsap');

// create our framework instance
var framework = bigwheel( function(done) {

  // the function passed to bigwheel should return
  // a setting object or alternately you can pass
  // the setting object to the callback defined as
  // done. This is nice if you need to do assynchronous
  // loading before content should be shown
  return {

    // define our routes
    // routes are associated to "sections"
    // sections are functions or objects
    routes: {
      '/': Section,
      '/about': Section,
      '/contact': Section
    }
  };
});

// this will start bigwheel and it will start resolving routes
framework.init();

// This is the definition for the sections which bigwheel will run
// sections can define init, resize, animateIn, animateOut, destroy functions
// these will methods will be called by bigwheel
function Section() {

  var el;
  
  return {

    // the init function creates the view and initializes it
    // after init finishes the view should not be visible
    init: function(req, done) {
      el = createEl(req);      
      el.onclick = function() {
        framework.go(getToSection(req));
      };
      done();
    },

    // the resize function will be called imediately after init
    // here you can apply "responsive" calculations on your view
    resize: function(width, height) {
      var fontSize = width / 500 * 30;
      el.style.fontSize = fontSize + 'px';
      el.style.top = Math.round(( height - fontSize ) * 0.5) + 'px';
    },

    // in animateIn you'll animate in your hidden content that
    // was created in init
    animateIn: function(req, done) {
      Tween.from(el, 1, {
        y: -100, 
        opacity: 0,
        ease: Back.easeOut, 
        onComplete: done
      });
    },

    // in animateOut you'll animate out your content that
    // was created in init
    animateOut: function(req, done) {
      Tween.to(el, 0.25, {
        y: 100, 
        opacity: 0, 
        ease: Back.easeIn, 
        onComplete: done
      });
    },

    // in destroy you'll clean up the content which was
    // created in init
    destroy: function(req, done) {
      el.parentNode.removeChild(el);
    }
  };
}

// this is just a utility function created for this example to create
// an element which will be added to the dom and initialized
function createEl(req) {
  var el = document.createElement('a');
  el.innerHTML = 'Click to go from "' + req.route + '" to "' + getToSection(req) + '"';
  el.style.position = 'absolute';
  el.style.cursor = 'pointer';
  return document.body.appendChild(el);
}

// this function acts as almost like a model for this example
// generally you'd either load your model from a server or
// have a static model object
function getToSection(req) {
  return {
    '/': '/about',
    '/about': '/contact',
    '/contact': '/'
  }[ req.route ];
}
```

## License

MIT, see [LICENSE.md](http://github.com/bigwheel-framework/bigwheel/blob/master/LICENSE) for details.
