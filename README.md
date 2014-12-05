<a name="module_bigwheel"></a>
#bigwheel
<a name="module_bigwheel..bigwheel"></a>
##class: bigwheel~bigwheel
**Members**

* [class: bigwheel~bigwheel](#module_bigwheel..bigwheel)
  * [new bigwheel~bigwheel(settingsFunc)](#new_module_bigwheel..bigwheel)
  * [bigwheel.init()](#module_bigwheel..bigwheel#init)
  * [bigwheel.go(to)](#module_bigwheel..bigwheel#go)
  * [bigwheel.resize(w, h)](#module_bigwheel..bigwheel#resize)

<a name="new_module_bigwheel..bigwheel"></a>
###new bigwheel~bigwheel(settingsFunc)
When instantiating bigwheel you must pass in a setup function.

In this function you may do any preparation that must be done for your
application such as creating a global Canvas element or something else.

The setup function must either return a settings object for bigwheel or
this function must receive a callback which you will call with the settings
object. Furthermore you can pass back a promise from this settings function
which will receive the settings object.

The following documents what can be passed in the settings object:
```javascript
{
	///// REQUIRED /////

	// routes defines all the routes for your website it can also define a 
	// 404 section which will be opened if the route is incorrect
 routes: {

		'/': someSection,
		'/someOther': someOtherSection,
		'404': sectionFourOhFour
 },
 
 ///// OPTIONAL /////
 initSection: preSection, // this could be a section that is run always
 						 // before routes are even evaluated. This is
 						 // usefulf for site preloaders or landing pages
 						 // such as age verification (something the user
 						 // must see)

	autoResize: true, // by default this value is true. When this value is
					  // true a resize listener is added to the window
					  // whenever the window changes size it's width and
					  // height is passed to all instantiated sections
	postHash: '#!', // this string is appended before the route. 
					// by default it's value is '#!'
	duplicate: true, // by default this value is true. When this value is
					  // true, you will be able to go to the same route
					  // multiple times in a row, useful for routes 
					  // that contain wild cards
}
```

**Params**

- settingsFunc `function` - This settings function will be used to
initialize bigwheel.  

**Scope**: inner class of [bigwheel](#module_bigwheel)  
<a name="module_bigwheel..bigwheel#init"></a>
###bigwheel.init()
init must be called to start the framework. This was done to allow for
a developer to have full control of when bigwheel starts doing it's thing.

<a name="module_bigwheel..bigwheel#go"></a>
###bigwheel.go(to)
go can be called to go to another section.

**Params**

- to `String` - This is the route you want to go to.  

**Example**  
```javascript
framework.go( '/landing' );
```

<a name="module_bigwheel..bigwheel#resize"></a>
###bigwheel.resize(w, h)
Resize can be called at any time. The values passed in for
width and height will be passed to the currently instantiated
sections.

If `autoResize` was not passed in or it was true then resize
will automatically be called when the window of the browser
resizes.

**Params**

- w `Number` - width value you'd like to pass to the sections  
- h `Number` - height value you'd like to pass to the sections  

