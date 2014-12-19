

//-------------------------------
// Class OOP base
//-------------------------------

/*
 * @file
 * C.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 * Urban: THANKS TO LEAFLET FOR THIS CLASS!
 */


/**
 * @class C.Class 
 */
C.Class = function () {};

/**
 * Base method to extend an object
 * @static
 */
C.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		this.callInitHooks();
	};

	// jshint camelcase: false
	var parentProto = NewClass.__super__ = this.prototype;
	var proto = C.Util.create(parentProto);
	proto.constructor = NewClass;

	NewClass.prototype = proto;
	
	
	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		C.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		C.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) {
		props.options = C.Util.extend(C.Util.create(proto.options), props.options);
	}

	// mix given properties into the prototype
	C.extend(proto, props);

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parentProto.callInitHooks) {
			parentProto.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


/**
 * Method for adding properties to prototype
 * @static
 */
C.Class.include = function (props) {
	C.extend(this.prototype, props);
};

/**
 * Merge new default options to the Class
 * @static
 */
C.Class.mergeOptions = function (options) {
	C.extend(this.prototype.options, options);
};

/** 
 * Add a constructor hook
 * @static
 */
C.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};



    
