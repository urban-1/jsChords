; // Prevent error when combining scripts!


if (typeof console === 'undefined'){
  var console = {
    log:function(){},
    warn:function(){},
    assert:function(){},
    error:function(){},
    info:function(){}
  }
};

/**
 * Chords Lib
 */
var C = {
    version: 'v0.1'
};

/**
 * Generic error handler for all AJAX errors. Logs the error message and 
 * status
 * 
 * @method
 * @param {Event} e
 * @static
 */
C.ajaxErr = function(e){
    if (e.statusText=="OK") return;
    console.log("AJAX ERROR:"+e.responseText+" status="+e.statusText);
    console.log(e);
};

/**
 * All base notes (no flats - major scale from C)
 * @member C
 * @var
 */
C.NOTES2  = ["C", "D", "E", "F", "G", "A", "B"];

/**
 * All notes (in semi-tones)
 * @member C
 * @var
 */
C.NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Notes with different naming...
 * @member C
 * @var
 */
C.NOTESIoanna = ["Do", "Do+", "Re", "Re+", "Mi", "Fa", "Fa+", "Sol", "Sol+", "La", "La+", "Si"];


// function lg(a){console.log(a)}
// Shortcut for console.log but may not work with IE!
lg = /*console.log =*/ Function.prototype.bind.call(console.log,console);


/**
 * Get a notes frequency
 * http://jonathan.bergknoff.com/journal/making-a-guitar-tuner-html5
 * 
 * @param {Number} referenceFreq
 * @param {Number} halfToneOffset
 * @return {Number} frequency
 * @method
 * @static
 */
C.getFreq = function(referenceFreq, halfToneOffset){
    return (referenceFreq * Math.pow(2, (halfToneOffset/12)))
};


C.getAllFreq = function(){
    var fs = [];
    
    for (i in C.Note.F) {
	if (i[1]=="b") continue;
	fs.push( {frequency: C.Note.F[i], name: i});
    };
    
    return fs;
};


//-------------------------------
// General Utilities
//-------------------------------

/**
 * Utilities class for chords. This is for general utils and should not depend on
 * any other class
 * 
 * @class C.Util
 */
C.Util = {
    /**
     * Extend an object with properties of one or more other objects
     * 
     * @param {Object} dest Object to be extended
     * @param {Object} classes/instances One or more other objects to extend from
     * @return {Object} Altered dest
     * @static
     */
    extend: function (dest) {
	var i, j, len, src;
	
	for (j = 1, len = arguments.length; j < len; j++) {
	    src = arguments[j];
	    for (i in src) {
		dest[i] = src[i];
	    }
	}
	return dest;
    },
    
    /**
     * Create an object from a given prototype
     * 
     * @return {Object}
     * @static
     */
    create: Object.create || (function () {
	function F() {}
	return function (proto) {
	    F.prototype = proto;
	    return new F();
	};
    })(),
    
    /**
     * Set options to an object, inheriting parent's options as well
     * 
     * @param {Object} obj
     * @param {Object} options
     * @return {Object} obj.options
     * @static
     */
    setOptions: function (obj, options) {
	if (!obj.hasOwnProperty('options')) {
		obj.options = obj.options ? C.Util.create(obj.options) : {};
	}
	for (var i in options) {
		obj.options[i] = options[i];
	}
	return obj.options;
    },
    
    
    /**
     * Check (and return true) if a propery of an object 
     * is null. Key is given in string format "xxx.yyy.zzz"
     * 
     * @param {Object} obj 
     * @param {String} key
     * @return {Boolean}
     * @static
     */
    objNull: function(obj, key){
	return (C.Util.objValue(obj,key,undefined)===undefined)
    },
    
    /**
     * Return the value of a propery of an object. If it is null, the
     * defVal will be returned. Key is given in string format "xxx.yyy.zzz"
     * 
     * @param {Object} obj 
     * @param {String} key
     * @param {Object} defVal
     * @return Property value or defVal
     * @static
     */
    objValue: function(obj, key, defVal){
	if (!obj) return defVal;
	var keys = key.split("."), value;
	for(var i = 0; i < keys.length; i++){
	    if(typeof obj[keys[i]] !== "undefined"){
		value = obj = obj[keys[i]];
	    }else{
		return defVal;
	    }
	}
	return value;
    },
    
    /**
     * Return true if an object is empty 
     * 
     * @param {Object} obj 
     * @return {Boolean}
     * @static
     */
    objIsEmpty: function(obj){
	for(var key in obj) {
	    if(obj.hasOwnProperty(key)) return false;
	}
	
	return true;
    },
    
    /**
     * Trim whitespace from both sides of a string
     * @param {String} str 
     * @return {String}
     * @static
     */
    trim: function (str) {
	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },
    
    /**
     * Split a string into words
     * 
     * @param {String} str 
     * @return {Array} of Strings...
     * @static
     */
    splitWords: function (str) {
	return C.Util.trim(str).split(/\s+/);
    },
    
    /**
     * Clone an object instead of pointing to it!
     * 
     * @param {Object/Array} o
     * @return {Object/Array}
     * @static
     */
    clone: function(o) {
	if(typeof(o) != 'object' || o == null) return o;
	
	var newO = new Object();
	if (Object.prototype.toString.call( o ) === '[object Array]' ) 
	    newO = new Array();
	
	for(var i in o) {
	    // Detect dom ones
	    
	    if (o["map"] == o[i]){
		newO[i] = o[i];
	    }else if (o[i].parentNode == undefined){
		newO[i] = C.Util.clone(o[i]);
	    }else{
		newO[i] = o[i].cloneNode(false);
	    }
	}
	return newO;
    },
    
    /**
     * Parse the URL query string and return it as object
     * @return {Object} 
     * @static
     */
    getQueryString: function() {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	
	for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	    // If first entry with this name
	    var p1 = decodeURIComponent(pair[1]);
	    if (typeof query_string[pair[0]] === "undefined") {
		if (pair[0]=="") continue;
		query_string[pair[0]] = p1;
		// If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
		var arr = [ query_string[pair[0]], p1];
		query_string[pair[0]] = arr;
		// If third or later entry with this name
	    } else {
		query_string[pair[0]].push(p1);
	    }
	} 
	return query_string;
    }

}


/**
 * Alias to C.Util.setOptions
 * @method setOptions
 * @member C
 * @static
 */
C.setOptions = C.Util.setOptions;
/**
 * Alias to C.Util.extend
 * @method extend
 * @member C
 * @static
 */
C.extend     = C.Util.extend;
 

/**
 * @class Array
 */

/**
 * Get max out of array
 * @return {Number}
 */
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

/**
 * Get min out of array
 * @return {Number}
 */
Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

/**
 * Find min graeater than gt
 * @return {Number}
 */
Array.prototype.mingt = function(gt){
    var min = 1000000000;
    for(var i=0;i<this.length;i++){
	if(this[i] < min && this[i] > gt)
	    min=this[i];
    }
    return min;
};

/**
 * Sort numerically
 * @return {Array}
 */
Array.prototype.sortn = function(){
    return this.sort(function(a,b){return a-b});
};

/**
 * Return true if item is found in the array
 * @return {Boolean}
 */
Array.prototype.hasItem = function(item){
    return (this.indexOf(item)!==-1);
};

/**
 * Return new array with duplicate values removed
 * @return {Array}
 */
Array.prototype.unique = function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
	for(var j=i+1; j<l; j++) {
	    // If this[i] is found later in the array
	    if (this[i] === this[j])
		j = ++i;
	}
	a.push(this[i]);
    }
    return a;
};

/**
 * Return new array with duplicate values removed and
 * values that are greater than gt
 * @return {Array}
 */
Array.prototype.uniquegt = function(gt) {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
	if (this[i]<=gt) continue;
	for(var j=i+1; j<l; j++) {
	    // If this[i] is found later in the array
	    if (this[i] === this[j])
		j = ++i;
	}
	a.push(this[i]);
    }
    return a;
};

/**
 * Find count of "what" in the array (uses ==, only 
 * primitives...)
 * @return {Number}
 */
Array.prototype.countWhat = function(what){
    var c = 0;
    for(var i=0;i<this.length;i++){
	if(this[i] === what)
	    c++;
    }
    return c;
};




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



    


/**
 * Basic Note class with some playable attributes (future)
 * @class C.Note
 * @extends C.Class
 */
C.Note = C.Class.extend({
    options: {
	note: "-",
	
	// Playable attributes
	type: 0,		// 0=normal, 1=optional, 2=blue?
	duration: 1,		// time duration (sec?)
	style: "",		// bend "b", vibrato "~"
	styleAttr: "",		// Style attribure: 1, 1/2, etc for bends,
	octaveOffset:0,		// Used for 9ths +
	playPos: -1	 	// Position on an instrument (comparison between instr cannot be done)
    },
    
    /**
     * Base init function, set the correct index 
     * 
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	this.idx = C.Note.noteIndex(this.options.note);
    },
    
    /**
     * Return string representation of this note.
     * 
     * @return {String}
     */
    toString: function(){
	return this.options.note;
    },
    
    /**
     * Change/set the note. Index will also be updated. 
     * No other option will change
     * 
     * @param {String} note
     * @return this
     */
    setNote: function(note){
	this.options.note = note;
	this.idx = C.Note.noteIndex(note);
	return this;
    },
    
    /**
     * Offest by off. Off is in half-tones, if step is given 
     * then it will off*step ie: step=2 (by tone)
     * 
     * @param {Number} off Offset steps
     * @param {Number} step The step size (default 1 - half-tone)
     * @return this
     */
    offset: function(off, step){
	if (this.options.note=="-") return this;
			
	var idx = C.Note.noteIndex(this.options.note);
	if (step!==undefined) off*=step;
	
	// Offset playPos by the FULL amount
	if (this.options.playPos!=-1)
	    this.options.playPos+=off;
	
	this.idx = (idx+off)%C.NOTES.length;
	this.options.note = C.NOTES[this.idx];
	
	return this;
    },
    
    /**
     * Offset by notes/steps on the C Major scale. Not used
     * at the moment...
     * 
     * @param {Number} off Offset steps
     * @return this
     */
    offsetNotes: function(off){
	if (off==0) return;
	var idx2 = C.NOTES2.indexOf(this.options.note);
	idx2 = (off + idx2)%C.NOTES2.length;
	
	this.idx = C.NOTES.indexOf(C.NOTES2[idx2]);
	this.options.note = C.NOTES[this.idx];
	
	return this
    },
    
    /**
     * Offest based on formula string ie: b3 or 2#
     * @chainable
     */
    offsetStr: function(f){
	
	var off = 0;
	if (f[0]=="b") {
	    f = parseInt(f[1]);
	    off=-1;
	}
	else if (f[0]=="#"){
	    f = parseInt(f[1]);
	    off=1;
	}
	
	this.offsetNotes(f-1);
	
	return this.offset(off);
	
    },
    
    /**
     * Get not index. If useOffset is true then 
     * the number of offset octaves will be added
     * too.
     * 
     * @param {Boolean} useOffset
     * @return {Number} Note offset
     */
    getIdx: function(useOffset) {
	var off = this.idx;
	if (useOffset && this.options.octaveOffset>0) 
	    off+=this.options.octaveOffset*C.NOTES.length;
	return off;
    },
    
    /**
     * Clone a Note. Avoid using deep copy C.Util.clone...
     * 
     * @return {C.Note}
     */
    clone: function(){
	var c = new C.Note({note: this.options.note});
	
	for (var o in this.options){
	    if (o=="note") continue;
	    c.options[o] = this.options[o];
	}
	
	return c;
    },
    
    /**
     * Return this note's F in a given octave
     */
    getFreq: function(octave) {
	
	if (octave===undefined) 
	    octave=0;
	
	var note=this.options.note+""+octave;
	
	return C.Note.F[note]
    }

});

/**
 * Get index for a given note name 
 * 
 * @param {String} note
 * @return {Number} Index
 * @static
 */
C.Note.noteIndex = function(note){
//     lg(note)
    if (note.length>1 && note[1]=="b") {
	note = note[0];
	var idx = C.NOTES.indexOf(note)-1;
	if (idx<0) idx = C.NOTES.length -idx;
	return idx;
    }
    
    return C.NOTES.indexOf(note);
};

/**
 * Get note name given an index
 * 
 * @param {Number} index
 * @return {String} Note name
 * @static
 */
C.Note.indexNote = function(idx){
    return C.NOTES[idx];
};

/**
 * Create a C.Note instance by a given index
 * 
 * @param {Number} idx
 * @return {C.Note}
 * @static
 */
C.Note.byIdx = function(idx){
    return new C.Note({note: C.NOTES[idx]});
};



/**
 * Constant "Concert A" frequency in Hz
 * 
 * @var
 * @static
 */
C.Note.CONCERTA = 440;


/**
 * Equal Temperament Tuning
 * Source: http://www.phy.mtu.edu/~suits/notefreqs.html
 * 
 * @static
 * @member C.Note
 * @var
 */
C.Note.F = {
    'C0': 16.35,
    'C#0': 17.32,
    'Db0': 17.32,
    'D0': 18.35,
    'D#0': 19.45,
    'Eb0': 19.45,
    'E0': 20.60,
    'F0': 21.83,
    'F#0': 23.12,
    'Gb0': 23.12,
    'G0': 24.50,
    'G#0': 25.96,
    'Ab0': 25.96,
    'A0': 27.50,
    'A#0': 29.14,
    'Bb0': 29.14,
    'B0': 30.87,
    'C1': 32.70,
    'C#1': 34.65,
    'Db1': 34.65,
    'D1': 36.71,
    'D#1': 38.89,
    'Eb1': 38.89,
    'E1': 41.20,
    'F1': 43.65,
    'F#1': 46.25,
    'Gb1': 46.25,
    'G1': 49.00,
    'G#1': 51.91,
    'Ab1': 51.91,
    'A1': 55.00,
    'A#1': 58.27,
    'Bb1': 58.27,
    'B1': 61.74,
    'C2': 65.41,
    'C#2': 69.30,
    'Db2': 69.30,
    'D2': 73.42,
    'D#2': 77.78,
    'Eb2': 77.78,
    'E2': 82.41,
    'F2': 87.31,
    'F#2': 92.50,
    'Gb2': 92.50,
    'G2': 98.00,
    'G#2': 103.83,
    'Ab2': 103.83,
    'A2': 110.00,
    'A#2': 116.54,
    'Bb2': 116.54,
    'B2': 123.47,
    'C3': 130.81,
    'C#3': 138.59,
    'Db3': 138.59,
    'D3': 146.83,
    'D#3': 155.56,
    'Eb3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3': 185.00,
    'Gb3': 185.00,
    'G3': 196.00,
    'G#3': 207.65,
    'Ab3': 207.65,
    'A3': 220.00,
    'A#3': 233.08,
    'Bb3': 233.08,
    'B3': 246.94,
    'C4': 261.63,
    'C#4': 277.18,
    'Db4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'Eb4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'Gb4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'Ab4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'Bb4': 466.16,
    'B4': 493.88,
    'C5': 523.25,
    'C#5': 554.37,
    'Db5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'Eb5': 622.25,
    'E5': 659.26,
    'F5': 698.46,
    'F#5': 739.99,
    'Gb5': 739.99,
    'G5': 783.99,
    'G#5': 830.61,
    'Ab5': 830.61,
    'A5': 880.00,
    'A#5': 932.33,
    'Bb5': 932.33,
    'B5': 987.77,
    'C6': 1046.50,
    'C#6': 1108.73,
    'Db6': 1108.73,
    'D6': 1174.66,
    'D#6': 1244.51,
    'Eb6': 1244.51,
    'E6': 1318.51,
    'F6': 1396.91,
    'F#6': 1479.98,
    'Gb6': 1479.98,
    'G6': 1567.98,
    'G#6': 1661.22,
    'Ab6': 1661.22,
    'A6': 1760.00,
    'A#6': 1864.66,
    'Bb6': 1864.66,
    'B6': 1975.53,
    'C7': 2093.00,
    'C#7': 2217.46,
    'Db7': 2217.46,
    'D7': 2349.32,
    'D#7': 2489.02,
    'Eb7': 2489.02,
    'E7': 2637.02,
    'F7': 2793.83,
    'F#7': 2959.96,
    'Gb7': 2959.96,
    'G7': 3135.96,
    'G#7': 3322.44,
    'Ab7': 3322.44,
    'A7': 3520.00,
    'A#7': 3729.31,
    'Bb7': 3729.31,
    'B7': 3951.07,
    'C8': 4186.01
}; 


/**
 * Basic Chord class
 * 
 * @class
 * @extends C.Class
 */
C.Chord = C.Class.extend({
    options: {
	root: "-",
	type: ""	// Empty for major, m, dim, dim7, 7, m7, etc
    },
    
    /**
     * Base init function
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
    },
    
    /**
     * Get string representation of the chord name
     * concatenating the root and the type (Am7).
     * 
     * @return {String}
     */
    toString: function(){
	return this.options.root+ this.getChordType().type
    },
    
    /**
     * Offset the root of the chord. If step is given 
     * then it will off*step ie: step=2 (by tone)
     * 
     * @param {Number} off Offset steps
     * @param {Number} step The step size (default 1 - half-tone)
     * @return this
     */
    offset: function(off, step){
	var idx = C.Note.noteIndex(this.options.root);
	if (step!==undefined) off*=step;
	var newIdx = (idx+off);
	this.options.root = C.NOTES[newIdx];
	
	return this;
    },
    
    /**
     * Set the chord type
     * 
     * @param {String} type
     * @return this
     */
    setType: function(type){
	this.options.type = type;
	return this;
    },
    
    /**
     * Set the chord root 
     * 
     * @param {String} root
     * @return this
     */
    setRoot: function(root){
	this.options.root = root;
	return this;
    },
    
    /**
     * Return a note index by offset-ing the root note of 
     * this chord on the major scale
     * 
     * @param {String} f
     * @return {Number}
     * @private
     */
    _formulaToIdx: function(f){
	return this._formulaToNote(f).getIdx();
	
    },
    
    /**
     * Return a note by offset-ing the root note of 
     * this chord on the major scale
     * 
     * @param {String} f
     * @return {C.Note}
     * @private
     */
    _formulaToNote: function(f){
	var scale = new C.Scale({root: this.options.root,name:"Major"})
	return scale.offset(f);
    },
    
    /**
     * Get the chord's formula as string
     * 
     * @return {String}
     */
    getFormula: function(){
	return this.getChordType().formula;
    },
    
    /**
     * Get chord type information (type/name/formula)
     * 
     * @return {Object}
     */
    getChordType: function(){
	return C.Chord.TYPES[this.getType()];
    },
    
    /** 
     * Get chord's root
     * @return {String}
     */
    getRoot: function(){
	return this.options.root;
    },
    
    /**
     * Get chord's type
     * @return {String}
     */
    getType: function(){
	return (this.options.type=="") ? "M" : this.options.type;
    },
    
    /**
     * Get full chord's name from C.Chord.TYPES
     * @return {String}
     */
    getFullName: function(){
	return this.getChordType().name;
    },
    
    /**
     * Get the notes included in this chord
     * @return {Array} of C.Note
     */
    getNotes: function(){
	var f = this.getFormula().split(" ");
	var notes = [];
	for (var i=0; i<f.length; i++) {
	    notes.push(this._formulaToNote(f[i]));
	}
	
	return notes;
    },
    
    /**
     * Get the notes included in this chord in Do,Re,La... format
     * @return {Array} of C.Note
     */
    getNotesIoanna: function(){
	var notes= this.getNotes();
	for (var i=0; i<notes.length; i++) {
	    notes[i] = C.NOTESIoanna[notes[i].getIdx()];
	}
	
	return notes;
    }
    
});


/**
 * Initialize a chord by the its full name...
 * @param {String} cname Chord name including type
 * @static
 */
C.Chord.byString = function(cname) {
    var cbase = cname[0];
    
    if (cbase!='A' && cbase!='B' && cbase!='C' && cbase!='D' && cbase!='E' && cbase!='F' && cbase!='G') {
	throw new Error('Wrong base/root: '+cbase);
    }
    
    var ctype = cname.substr(1);
    if (cname[1]=="#" || cname[1]=="b") {
	cbase = cname[0]+cname[1];
	ctype = cname.substr(2);
    }
    
    // Check type
    if (!C.Chord.TYPES[(ctype=="") ? "M" : ctype]) {
	throw new Error('UnKnown chord type: '+ctype);
    }
    
    return new C.Chord({root:cbase, type:ctype});
};

/**
 * Get all available chord types as array. These are the Indexes
 * and not the .type field...
 * 
 * @return {Array}
 * @static
 */
C.Chord.getAllTypes = function() {
    var arr = [];
    for (v in C.Chord.TYPES){
	if (!C.Chord.TYPES.hasOwnProperty(v)) continue;
	arr.push(v)
    }
    return arr;
};


/**
 * ChordRep: Representation of a chord on an instrument 
 * (one chord formation)
 * 
 * @class C.ChordRep
 * @extends C.Chord
 */
C.ChordRep = C.Chord.extend({
    
    options: {
	instrument: null
    },
    
    /**
     * Base init function. Set pos,notes and diff members
     * 
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	
	// Final chord positions
	this.pos = [];
	// Note of each position
	this.notes=[];
	// Chord difficulty (last step, informational, experimental)
	this.diff=-1;
    },
    
    /**
     * Return the length/numOfStrings for this chord
     * @return {Number}
     */
    size: function(){
	return this.pos.length
    },
    
    /**
     * Return the values for string position idx
     * @param {Number} idx
     * @return {Number}
     */
    getPos: function(idx){
	return this.pos[idx];
    },
    
    /**
     * Set a position/offset on a specific string. This function
     * will clear any note set for this offset/string. One has to 
     * manually reset the note if needed (use the root+offset of the instrument)
     * 
     * @param {Number} idx String index
     * @param {Number} what Fret offset
     * @return this
     */
    setPos: function (idx, what){
	this.pos[idx]=what;
	this.notes[idx]="-";
	return this;
    },
    
    /**
     * Get the note played at string idx
     * 
     * @param {Number} idx String index
     * @return {C.Note}
     */
    getNote: function(idx){
	return this.notes[idx];
    },
    
    /**
     * Set the note for string idx 
     * @param {Number} idx String index
     * @param {C.Note} what Note
     */
    setNote: function (idx, what){
	this.notes[idx]=what
	return this
    },
    
    /**
     * Return true of the chord is empty till string index len
     * @param {Number} len 
     * @return {Boolean}
     */
    isEmptyTill: function (len){
	for (var i=0; i<len; i++){
	    if (this.pos[i]!=-1) return false;
	}
	
	return true;
    },
    
    /**
     * Return true if the chord is empty (ie [ -1 -1 -1 -1 -1 -1 ])
     * @return {Boolean}
     */
    isEmpty: function(){
	if (this.pos.length==0) return true;
			    
	for (var i=0; i<this.pos.length; i++)
	    if (this.pos[i]!=-1) 
		return false;
	
	return true;
    },
    
    /**
     * Get partial chord starting from len string
     * @param {Number} len
     * @return {C.ChordRep}
     */
    getPartialHigher: function(len){
	var tmpChord = C.ChordRep.getEmpty(this.pos.length);
	for (var i=len; i<tmpChord.pos.length; i++){
	    tmpChord.setPos(i,this.pos[i]);
	    tmpChord.setNote(i,this.notes[i]);
	}
	return tmpChord;
    },
    
    /**
     * String representation of the chord (ie [ -1 0 2 2 2 0]). If
     * debug flag is true then the notes of the chord and each notes
     * play position on the instrument is added
     * 
     * @param {Boolean} debug
     * @return {String}
     */
    toString: function(debug) {
	var str="[ "+this.pos.join(" ")+" ] ";
	if (debug) {
	    str+="( "+this.notes.join(" ")+" ) lvl="+this.diff;
	    for (var i=0; i<this.notes.length; i++){
		str+=" "+C.Util.objValue(this.notes[i],"options.playPos","");
	    }
	    str+='\n';
	}
	return str;
    },
    
    /**
     * Compare this ChordRep to another one and return true
     * if they are the same
     * 
     * @param {C.ChordRep} c
     * @return {Boolean}
     */
    equal: function(c){
	// Very slow...: return (this.pos.join('') == c.pos.join(''));
	if (c.pos.length!=this.pos.length) return false;
	
	for (var i=0; i<this.pos.length; i++)
	    if (c.pos[i]!=this.pos[i]) 
		return false;
	
	return true;
    },
    
    /**
     * Return the position of the 1st base string that 
     * is played in this chord
     * 
     * @return {Number}
     */
    getBasePos: function(){
	for (var i=0; i<this.pos.length; i++)
	    if (this.pos[i]!=-1) return i;
    },
    
    
    /**
     * Get a note given the idx of the chord rep and the
     * root not of the instrument for this string 
     * 
     * Prefer to use Instrument::getNoteForString(string, offset)
     * 
     * @param {Number} idx String index (from pos) 
     * @param {String} root Note 
     * @return {C.Note} 
     */
    getNoteForString: function(idx, root){
	var cNote = new C.Note({note: root.toUpperCase()});
	return cNote.offset(this.pos[i]);
    },
    
    /**
     * Clone a ChordRep. Avoid using deep copy C.Util.clone...
     * 
     * @return {C.ChordRep}
     */
    clone: function(){
	var c = new C.ChordRep();
	c.pos = this.pos.slice(0);
	c.notes = this.notes.slice(0);
	c.diff = this.diff;
	
	return c;
    },
    
    /**
     * The the minimum duplicate fret ignoring -1 and 0s.
     * Return -1000 if not found.
     * 
     * @return {Number}
     */
    getMinDuplicate: function(){
	var csorted = this.pos.slice(0).sortn();
	
	// Find min duplicate if any
	var dup = -1000 // to not match open
	for (var i=1; i<csorted.length; i++){
	    if (csorted[i]==-1 || csorted[i]==0)
		continue;
	    if (csorted[i]==csorted[i-1]) {
		dup=csorted[i];
		break;
	    }
	}
	
	return dup;
    },
    
    /**
     * Count of instances of fret number num
     * 
     * @param {Number} num Fret number
     * @return {Number} count
     */
    countNum: function(num){
	return this.pos.countWhat(num);
    },
    
    /**
     * Return minimum fret position greater than zero
     * @return {Number}
     */
    minPos: function(){
	return this.pos.mingt(0);
    },
    
    /**
     * Return minimum fret position greater than 'gt'
     * @param {Number} gt
     * @return {Number}
     */
    getMinPosGt: function(gt){
	return this.pos.mingt(gt)
    },
    
    /**
     * Return maximum fret position
     * @return {Number}
     */
    maxPos: function(){
	return this.pos.max();
    },
    
    /**
     * Return chord span in frets
     * @return {Number}
     */
    span: function(){
	return this.maxPos() - this.minPos();
    },
    
    /**
     * Set chords difficulty (the instrument should know how
     * difficult a chord is and not the chord itself)
     * 
     * @param {Number} d 
     */
    setDiff: function(d){
	this.diff = d;
	return this;
    },
    
    /**
     * Get difficulty
     * @return {Number}
     */
    getDiff: function(){
	return this.diff;
    },
    
    /**
     * Return true if the chord can be played barre
     * @return {Boolean}
     */
    isBar: function(){
	var dup = this.getMinDuplicate();
	var lowerDup=false;
	if (dup<0) return false;
			    
	for (var i=0; i<this.pos.length	; i++){
	     if (this.pos[i]==-1) 
		continue;
	    
	    // Bar stuff...
	    if (dup>this.pos[i]) lowerDup=true;	// Lower note than the min duplicate
	}
	
	return (dup>0 && lowerDup!=true);
    }
    

});

/**
 * Debug print of a ChordRep array
 * @param {Array} arr of C.ChordRep
 * @param {Boolean} debug
 * @static
 */
C.ChordRep.dbgPrintArray = function(arr,debug){
    for (var i=0; i<arr.length; i++){
	lg (arr[i].toString(debug))
    }
};

/**
 * Get an all empty ChordRep
 * @param {Number} numStrings
 * @param {Object} instrument Pointer to instrument
 * @return {C.ChordRep}
 * @static
 */
C.ChordRep.getEmpty = function(numStrings, instrument){
    var c = new C.ChordRep();
    for (var i=0; i<numStrings; i++) {
	c.pos[i]=-1;
	c.notes[i]="-";
    }
    
    if (instrument) c.instrument = instrument;
    return c;
};
/**
 * Full credit to: http://guitarchordsworld.com/chord theory
 * and http://www.smithfowler.org/music/Chord_Formulas.htm
 * 
 * Total: 47
 * 
 * @static
 * @member C.Chord
 * @var
 */
C.Chord.TYPES	= new Array(47);

C.Chord.TYPES["M"]	= { type: "M",		formula: "1 3 5",	name: "Major" };
C.Chord.TYPES["m"]	= { type: "m",		formula: "1 b3 5",	name: "Minor" };
C.Chord.TYPES["7"]	= { type: "7",		formula: "1 3 5 b7",	name: "7th" };
C.Chord.TYPES["m7"]	= { type: "m7",		formula: "1 b3 5 b7",	name: "Minor 7th" };
C.Chord.TYPES["maj7"]	= { type: "maj7",	formula: "1 3 5 7",	name: "Major 7th" };
C.Chord.TYPES["sus4"]	= { type: "sus4",	formula: "1 4 5",	name: "Suspended 4th" };
C.Chord.TYPES["dim"]	= { type: "dim",	formula: "1 b3 b5",	name: "Diminished" };
C.Chord.TYPES["aug"]	= { type: "aug",	formula: "1 3 #5",	name: "Augmented" };
C.Chord.TYPES["6"]	= { type: "6",		formula: "1 3 5 6",	name: "6th" };
C.Chord.TYPES["m6"]	= { type: "m6",		formula: "1 b3 5 6",	name: "Minor 6th" };
C.Chord.TYPES["6add9"]	= { type: "6add9",	formula: "1 3 5 6 9",	name: "6th Add 9th" };
C.Chord.TYPES["9"]	= { type: "9",		formula: "1 3 5 b7 9",	name: "9th" };
C.Chord.TYPES["m9"]	= { type: "m9",		formula: "1 b3 5 b7 9",	name: "Minor 9th" };
C.Chord.TYPES["maj9"]	= { type: "maj9",	formula: "1 3 5 7 9",	name: "Major 9th" };

C.Chord.TYPES["11"]	= { type: "11",		formula: "1 (3) 5 b7 (9) 11",	name: "11th" };
C.Chord.TYPES["m11"]	= { type: "m11",	formula: "1 b3 5 b7 (9) 11",	name: "Minor 11th" };
C.Chord.TYPES["maj11"]	= { type: "maj11",	formula: "1 3 5 7 (9) 11",	name: "Major 11th" };

C.Chord.TYPES["13"]	= { type: "13",		formula: "1 3 5 b7 (9) (11) 13",	name: "13th" };
C.Chord.TYPES["m13"]	= { type: "m13",	formula: "1 b3 5 b7 (9) (11) 13",	name: "Minor 13th" };
C.Chord.TYPES["maj13"]	= { type: "maj13",	formula: "1 3 5 7 (9) (11) 13",		name: "Major 13th" };

// Weird
C.Chord.TYPES["maj7#11"]= { type: "maj7#11",	formula: "1 3 5 7 #11",	name: "Major seven sharp 7th" };
C.Chord.TYPES["maj-5"]	= { type: "maj-5",	formula: "1 3 b5",	name: "Major Flat Five" };
C.Chord.TYPES["mmaj7"]	= { type: "m/maj7",	formula: "1 b3 5 7",	name: "Minor/Major 9th" };
C.Chord.TYPES["mmaj9"]	= { type: "m/maj9",	formula: "1 b3 5 7 9",	name: "Minor/Major 9th" };
C.Chord.TYPES["mmaj11"]= { type: "m/maj11",	formula: "1 b3 5 7 (9) 11",	name: "Minor/Major 11th" };
C.Chord.TYPES["mmaj13"]= { type: "m/maj13",	formula: "1 b3 5 7 (9) (11) 13",	name: "Minor/Major 13th" };
C.Chord.TYPES["m7-5"]	= { type: "m7-5",	formula: "1 b3 b5 b7",	name: "Minor seven flat fifth" };

// Sharps?
C.Chord.TYPES["7#5"]	= { type: "7#5",	formula: "1 3 #5 b7",	name: "Seven sharp five" };
C.Chord.TYPES["7b5"]	= { type: "7b5",	formula: "1 3 b5 b7",	name: "Seven flat five" };
C.Chord.TYPES["7b9"]	= { type: "7b9",	formula: "1 3 5 b7 b9",	name: "Seven flat ninth" };
C.Chord.TYPES["7#9"]	= { type: "7#9",	formula: "1 3 5 b7 #9",	name: "Seven sharp ninth" };
C.Chord.TYPES["9#5"]	= { type: "9#5",	formula: "1 3 #5 b7 9",	name: "Nine sharp five" };
C.Chord.TYPES["9b5"]	= { type: "9b5",	formula: "1 3 b5 b7 9",	name: "Nine flat five" };
C.Chord.TYPES["7#5#9"]	= { type: "7#5#9",	formula: "1 3 #5 b7 #9",	name: "Seven sharp five sharp nine" };
C.Chord.TYPES["7#5b9"]	= { type: "7#5b9",	formula: "1 3 #5 b7 b9",	name: "Seven sharp five flat nine" };
C.Chord.TYPES["7b5#9"]	= { type: "7b5#9",	formula: "1 3 b5 b7 #9",	name: "Seven flat five sharp nine" };
C.Chord.TYPES["7b5b9"]	= { type: "7b5b9",	formula: "1 3 b5 b7 b9",	name: "Seven flat five flat nine" };
C.Chord.TYPES["7#11"]	= { type: "7#11",	formula: "1 3 5 b7 #11",	name: "Seven sharp eleven" };

// Symatrical
C.Chord.TYPES["dim7"]	= { type: "dim7",	formula: "1 b3 b5 bb7",	name: "Diminished 7th" };

// 2 finger!
C.Chord.TYPES["5"]	= { type: "5",		formula: "1 5",		name: "5th" };
C.Chord.TYPES["-5"]	= { type: "-5",		formula: "1 b5",	name: "Flat 5th" };
C.Chord.TYPES["sus2"]	= { type: "sus2",	formula: "1 2 5",	name: "Suspended 2nd" };
C.Chord.TYPES["#11"]	= { type: "#11",	formula: "1 5 #11",	name: "Sharp Eleven" };


// Aliases
C.Chord.TYPES["°"]	= C.Chord.TYPES["dim"];
C.Chord.TYPES["°7"]	= C.Chord.TYPES["dim7"];
C.Chord.TYPES["+"]	= C.Chord.TYPES["aug"];




/**
 * Basic Instrument class
 * 
 * @class 
 * @extends C.Class
 */
C.Instrument = C.Class.extend({
    options: {
	numFrets: -1,
	description: "",
	maxFretSpan: 4,	// Inclusive distance
	renderer: null
    },
    
    /**
     * Base init function. Creates the chord cache structure
     * 
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	
	// Chord Data: TODO: Make Object to have functions?
	this.c = {
	    // Chord set to the instrument
	    chord: "",
	    // Chord notes
	    notes: [],
	    // Chord formula
	    form: "",
	    // Formula split
	    fsplit: [],
	    // Chord sub-notes on each string
	    fpos: [],
	    // Final chord positions
	    pos: [],
	    
	    // Diagram data
	    diag: {
		el: null,
		idx: -1
	    },
	    // 9ths,11ths,13ths
	    th9: false,
	    th11: false,
	    th13: false
	};

	
	
    },
    
    /**
     * Return the number of strings
     * 
     * @return {Number}
     */
    getNumStrings: function(){
	return  this.options.strings.length;
    },
    
    
    /**
     * Return the instruments name
     * 
     * @return {String}
     */
    getName: function(){
	return this.options.name;
    },
    
    /**
     * Return the instruments description
     * 
     * @return {String}
     */
    getDescription: function(){
	return this.options.description;
    },
    
    /**
     * Map a chord on this instrument. This function creates
     * the posible chord positions. Internaly it will call:
     *     - _initChordData
     *     - _procChord
     *     - _slideWindow
     *     - _setDifficulty
     *     - _sortChordPos
     * 
     * @param {C.Chord} c
     */
    mapChord: function(c){
	this.c.chord=c;
	this._initChordData();
	this._procChord();
	lg(this._splitFormulaDbgStr());
	
	this._slideWindow();
	this._setDifficulty();
	this._sortChordPos();
// 	C.ChordRep.dbgPrintArray(this.c.pos,true)
	
	return this;
	
    },
    
    /**
     * Init chord data structure and reset any previous data.
     * 
     * @private
     */
    _initChordData: function(){
	
	// Init data
	this.c.form = this.c.chord.getFormula();
	this.c.fsplit = this.c.form.split(" ");
	
	this.c.notes = new Array();
	this.c.fpos   = new Array();
	this.c.pos   = new Array();
	
	return this
    },
    
    /**
     * Process chord and find the positions for each formula 
     * part on each string.
     * 
     * @private
     */ 
    _procChord: function(){
	
	// Find all positions for all sub-notes in chord
	for (var fp = 0; fp<this.c.fsplit.length; fp++) {
	    
	    var tmpFp = this.c.fsplit[fp];
// 	    lg("Formula: "+tmpFp)
// 	    this.c.fpos[fp] = new Array();
	    
	    
	    // Formula note... (from root of this chord)
	    var note = this.c.chord._formulaToNote(tmpFp);
	    this.c.notes.push (note);
	    
	    // Sort ths: Check for 9th,11th, etc
	    if (tmpFp.indexOf('9')!==-1)
		this.c.th9 = note.toString();
	    else if (tmpFp.indexOf('11')!==-1)
		this.c.th11 = note.toString();
	    else if (tmpFp.indexOf('13')!==-1)
		this.c.th13 = note.toString();
	    
// 	    lg("Target Note: "+note.toString())
		
	    // For each string
	    for (var i=0; i<this.getNumStrings(); i++){
		if (!this.c.fpos[i]) this.c.fpos[i]=[-1];
		
// 		lg("String: "+this.options.strings[i])

		
		// New function
		this.c.fpos[i]=this.c.fpos[i].concat(this.getFretsFor(note,i,this.options.numFrets+this.options.maxFretSpan))
		
// 		lg("Pos: "+this.c.pos[fp][i]);
	    }
	}
	
	return this
	
    },
    
    /**
     * Get all positions/frets for note 'note' on a given string
     * till a maximum fret 
     * 
     * @param {C.Note} note
     * @param {Number} string
     * @param {Number} till
     * @return {Array} Integers
     */
    getFretsFor: function(note, string, till){
	var frets=[];
	var rootNote = this.getStringRoot(string);
	
	var rIdx = rootNote.getIdx();
	var nIdx = note.getIdx();
	
	
	// Find the 1st position after the root
	var first;
	
	if (nIdx >= rIdx) 
	    first = parseInt(nIdx-rIdx);
	else 
	    first = parseInt((C.NOTES.length - rIdx)+nIdx);
	
	// Expand to the number of frets
	while (first<=till){
	    if (frets.hasItem(first)) continue;
	    frets.push(first);
	    first+=C.NOTES.length;
	}
	
	return frets;
    },
    
    
    /**
     * Debug print the result of _procChord function
     * @private
     */
    _splitFormulaDbgStr: function(){
	var str = "For each formula part on a per string basis.\n";
	for (var i=0; i<this.getNumStrings(); i++){
	    str+=i+"=["+this.c.fpos[i].join(" ")+"] \n";
	}
	
	return str;
    },
    
    
    
    /**
     * Get a note given the string number and the offset on it... 
     * If -1 is given, the root note of the string is returned 
     * with -1 playable index.
     * 
     * @param {Number} s String index (from pos) 
     * @param {Number} offset Offset 
     * @return {C.Note} 
     */
    getNoteForString: function(s, offset){
	var cNote = this.getStringRoot(s,(offset==-1));
	if (offset==-1) cNote.setNote("-");
	return cNote.offset(offset);
    },
    
    /**
     * Return to root not for string s. If noPlayable is set
     * it will not attempt to set playable position... This is
     * needed for getPlayableOffForString which causes a loop
     * 
     * NOTE: Do not cache root notes, cause then we need to clone
     * them, which takes a lot longer than creating...
     * 
     * @param {Number} s String index
     * @param {Boolean} noPlayable If true do not set playble offset
     * @return {C.Note}
     */
    getStringRoot: function(s, noPlayable) {
	var newNote = new C.Note({
	    note: this.options.strings[s].toUpperCase()
	});
	
	if (!noPlayable)
	    newNote.options.playPos = this.getPlayableOffForString(s, 0)
	 
	return newNote;
    },
    
    /**
     * Get playable note offset given a string and the offset
     * on that string
     * 
     * @param {Number} s String index
     * @param {Number} offset 
     * @return {Number}
     */
    getPlayableOffForString: function(s,offset){
	var idx = offset;
	
	for (var i=0; i<s; i++) {
	    // Get roots WITHOUT PLAYABLE OFFSETS
	    var r1 = this.getStringRoot(i,true).getIdx();
	    var r2 = this.getStringRoot(i+1,true).getIdx();
	    
	    if (r2<r1) 
		r2 += C.NOTES.length;

	    var diff = r2-r1;
	    
	    idx+=diff;
	}
	
	return idx;
    },

    /**
     * Generic difficulty. A very basic function tobe used 
     * for initial sorting. Specific instruments should override 
     * this.
     * 
     * @private
     */
    _setDifficulty: function() {
	for (var i=0; i<this.c.pos.length; i++){
	    var c = this.c.pos[i];
	    var diff = c.span()*5/this.options.maxFretSpan;
	    var uniq = c.pos.unique().length;
	    diff+=uniq;
	    diff/=2;
	    c.setDiff(diff);
	}
	
	return this;
    },
    
    /**
     * Check if a chord is valid. Make sure that all sub-tones from the 
     * chords formula exist in the given positions. This function also
     * supports optional pitches (ie (9) ) in the formula.
     * 
     * TODO: Add 9ths rules...
     * 
     * @param {C.ChordRep} chord
     * @private
     */
    _checkChord: function(chord){
	// Array of STRINGS!
	var foundNotes = [];
	var root=-1;
	
	// Per string
	for (var i=this.getNumStrings()-1; i>=0; i--) {
	    if (chord.getPos(i)==-1) 
		continue;

	    var n = chord.getNote(i).toString();

	    // Detect ROOT
	    var po = chord.getNote(i).options.playPos;
	    if (root==-1 && n==this.c.chord.getRoot()) {
		root=chord.getNote(i).options.playPos;
	    }
	    
	    // 9ths,etc
	    if (root && (n==this.c.th9 || n==this.c.th11 || n==this.c.th13)
		&& (po-root<C.NOTES.length)
	    ) {
		// another 9th may exist later?
		continue;
		// return false; // Safer, may skip some postions...
	    }
		
	    if (!foundNotes.hasItem(n.toString()))
		foundNotes.push(n.toString());
	    
	    // Check that all formula parts are there
	    if (foundNotes.length === this.c.notes.length)
		return true;
	    
	}
	
	// Check for optionals...
	var countCompalsory = 0;
	var countCompalsoryChord = 0;
	
	for (var i=0; i<this.c.fsplit.length; i++) {
	    // if optional continue...
	    if (this.c.fsplit[i].indexOf("(")!=-1)
		continue;
	    
	    countCompalsory++;
	    if (foundNotes.hasItem(this.c.notes[i].toString())) {
		countCompalsoryChord++;
	    }
	    
	}
	
	return (countCompalsoryChord==countCompalsory);
    },
    
    /**
     * Get the number of positions for the current
     * chord mapped on this instrument
     * 
     * @return {Number}
     */
    getNumPos: function(){
	return this.c.pos.length
    },
    
    
    /**
     * Get current plotted position (if any)
     * 
     * @return {Number} 
     */
    getPosIdx: function(){
	return this.c.diag.idx
    },
    
    /**
     * Get chord representation at the specified index
     * 
     * @param {Number} idx
     * @return {C.ChordRep}
     */
    getChordPos: function(idx){
	if (idx<0) idx=0;
	if (idx>=this.c.pos.length) idx=this.c.pos.length-1;
	
	return this.c.pos[idx];
    },
    
    /**
     * Sort chord positions based on their difficulty
     * @private
     */
    _sortChordPos: function(){
	this.c.pos.sort(function(a,b){
	    return (a.getDiff()-b.getDiff())
	});
	
	return this;
    },
    
    
    //--------------------------------
    // Plotting/GUI
    //--------------------------------
    
    /**
     * Base of diagram, ensure that what is a chord representation
     * and store info. This function is responsible for calling the 
     * correct plotter based on the options object.
     * 
     * @param {C.ChordRep/Number} Index of chord or ChordRep to plot
     * @param {HTMLElement} el
     * @param {Object} opts Options
     */
    diagram: function(what,el,opts){
	
	el = (el) ? el : this.c.diag.el;
	
	this.c.diag.el = el;
	
	// Accept eiter chord representation or
	// position 
	if (!(what instanceof C.ChordRep)) {
	    if (this.c.pos.length==0) return false;
	    if (what<0) what=0;
	    if (what>=this.c.pos.length) what=this.c.pos.length-1;
			      
	    // Store
	    this.c.diag.idx = what;
	    what = this.c.pos[what];
	}
	
	var t = C.Util.objValue(opts, "type", "html");
	
	switch (t) {
	    case "html":
		return this.diagramHTML(what,el,opts);
	    default:
		throw new Error({'C.Instrument':'Diagram type "'+t+'" is not known...'}) 
	}
	
	return this;
    },
    
    /**
     * Show next chord from the available positions
     * 
     * @return {Boolean} True if next exists
     */
    diagramNext: function(){
	if (this.c.diag.idx==-1 || !this.c.diag.el) return false;
	this.diagram(this.c.diag.idx+1);
	return true;
    },
    
    /**
     * Show prev chord
     * @return {Boolean} True if previous exists
     */
    diagramPrev: function(){
	if (this.c.diag.idx==-1 || !this.c.diag.el) return false;
	this.diagram(this.c.diag.idx-1);
	return true;
    }
});







/**
 * Base class for all string instruments. Mainly 
 * diagram plotting happens here
 * 
 * @class 
 * @extends C.Instrument
 */
C.IStringInstrument = C.Instrument.extend({
    
        
    /**
     * Return true if the chord is playable. This is decided based on the 
     * instrument parameters. Skilled players may need to create new instruments
     * but this should cover most ppl.
     * 
     * The parameters are supplied via options in the constructor and they are:
     * 
     *    - hasBar: true/false, If the instrument supports bar chords... with a bar 
     * chord the minimum duplicate pos is considered to be occuping 1 finger
     * 
     *    - ignoreTone0: true/false, Mainly true for string instruments. The 0 is 
     * considered open and does nto need a finger (used also in _slideWindow)
     * 
     *    - maxPlayableTones: 4/5, Usually the same number as the fingers?!
     *  
     *     - maxFretSpan: 4, how many frets a chord can occupy (width)
     * 
     * @param {C.ChordRep} c
     * @return {Boolean}
     */
    isChordPlayable: function(c) {
	
	// Check span!
	if (c.span()>=this.options.maxFretSpan) return false;
	
	var dup = c.getMinDuplicate();
	
	// Do the basic checking and see if this can be played 
	// as bare
	var higherDup = false;
	var lowerDup = false;
	var count=0;
	for (var i=0; i<c.size(); i++){
	    if (c.getPos(i)==-1) 
		continue;
	    
	    // Register tone...
	    
	    // 0 doesnt count in the tones...
	    if (c.getPos(i)!=0 || !this.options.ignoreTone0) {
		count++
	    }
	    
	    // Bar stuff...
	    if (dup>0) {
		if (dup<c.getPos(i)) higherDup=true;	// Higher note than the min duplicate
		if (dup>c.getPos(i)) lowerDup=true;	// Lower note than the min duplicate
	    }
	}
	
	// Now do the Math...
	var bar = (dup>0 && lowerDup!=true);
	var finalCount = count;
	if (bar && this.options.hasBar) 
	    finalCount=count - c.countNum(dup) +1;
// 	lg(c+" "+finalCount)
	var playable = (finalCount <= this.options.maxPlayableTones);
	
	if (!playable) return false;
	return true;
	
    },
    
    /**
     * Make all the posible string/fret combinations that include notes
     * from the chords' formula. This is actually done recursively calling 
     * __doRecursion
     * 
     * @private
     */
    _slideWindow: function(){

	    
	// For each string! set the the first postion and do all
	// combos for the next string!
	this.__doRecursion(
		0, 
		new C.ChordRep.getEmpty(this.getNumStrings(), this)
	    );
	
	return this;
    },
    
    /**
     * Make all the posible string/fret combinations (recursively) that 
     * include notes from the chords' formula
     * 
     * @param {Number} s Index of string
     * @param {C.ChordRep} chord Chord built at the current stage
     * @private
     */
    __doRecursion: function(s,chord){
// 	var tab = "";
// 	for (var t=0; t<s; t++) tab+=" ";
// 	lg ("\n"+tab+"Rec s="+(s)+"/"+this.getNumStrings()+" "+chord)
	
	// Static max/min to reduce function call
	// on recursion
	var minS = chord.minPos();
	var maxS = chord.maxPos();
	var empty = chord.isEmpty();
	
	// For the rest of the strings...
	for (var p=0; p<this.c.fpos[s].length; p++){
// 	    lg(tab+s+":"+p)
	    var tmp_pos = this.c.fpos[s][p];
	
	    if (!empty) {
	    
		var min = minS;
		var max = maxS;
		
		if ((tmp_pos!=0 && tmp_pos!=-1) || (tmp_pos==0 && !this.options.ingoreTone0)){
		    if (max<tmp_pos) max=tmp_pos;
		    if (min>tmp_pos) min=tmp_pos;
		}
		if (max-min > this.options.maxFretSpan) {
// 		    lg(tab+"Skipping pos="+tmp_pos+" max="+max+" min="+min)
		    continue;
		}
	    }
	    
	    // Clone: Do NOT change the base
	    var newChord = chord.clone();
	    newChord.setPos(s,tmp_pos);
	    newChord.setNote(s, this.getNoteForString(s, tmp_pos));
		
	    // Current string was the last
	    if (s==this.getNumStrings()-1) {
		newChord=this._checkBase(newChord, this.c.chord.getRoot());

		if (newChord.isEmpty()     || 
		    this._chordPosExists(newChord)   || 
		    !this.isChordPlayable(newChord) ||
		    !this._checkChord(newChord) ) {
// 		    lg (tab+"Failing: "+newChord +this._chordPosExists(newChord))
		    continue;
		}
		
		
		// Assuming we got everything now...
// 		lg (tab+"Adding: "+newChord)
		this.c.pos.push(newChord);
	    } 
	    else {
		this.__doRecursion(s+1, newChord.clone());
	    }
// 	    lg(tab+"-"+p)
	}
	return this;
    },
    
    /**
     * Return all partial positions for this chord given
     * the number of tones/piches in it
     * 
     * @return {Array/Boolean} false if not partials exist
     * @deprecated
     * @private
     */
    _getVariations: function(data, chord){
	var variations = [];
	var foundNotes = [];
	var complete = false;
	
	
	for (var i=this.getNumStrings()-1; i>=0; i--) {
	    if (chord.getPos(i)==-1) {
		continue;
	    }

	    var n = chord.getNote(i).toString();
	    if (!foundNotes.hasItem(n))
		foundNotes.push(n);
	    
	    // Check that all formula parts are there
	    if (!complete && foundNotes.length === data.notes.length){
		var complete = true;
	    }
	    
	    // Now if all there and base is correct add as variation 
	    var tmpChord = chord.getPartialHigher(i);

	    if (complete && // complete
		data.chord.getRoot()==n && // correct base
		!tmpChord.isEmpty() && // not the last string
		!chord.isEmptyTill(i) &&
		i!=0
		)
	    {
		variations.push(tmpChord);
	    }
	}
	
	if (!complete) return false;
	return variations;
    },
    
    /**
     * Check that the chord start with the base note...
     * MAYBE: Optional?
     * 
     * @param {C.ChordRep} c
     * @param {C.Note} root
     * @private
     */
    _checkBase: function(c,root){
	
	for (var s=c.getBasePos(); s<c.size(); s++){
	    // Skip strings we dont play
	    if (c.getPos(s)==-1) 
		continue;
	    
	    var note = this.getStringRoot(s);
	    note.offset(c.getPos(s));
	    
	    if (note.toString()!=root) {
		c.setPos(s,-1);
	    }else {
		break;
	    }
	    
	}
	
	return c;
    },
    
    
    /**
     * Return true if the given chord already exists in the
     * chord structure
     * 
     * @param {C.ChordRep} c
     * @return {Boolean}
     * @private
     */
    _chordPosExists: function(c){
	for (var p=0; p<this.getNumPos(); p++){
	    if (c.equal(this.getChordPos(p)))
		return true;
	}
	
	return false;
    },
    
    /**
     * Set all chord positions difficulty for string-based instruments
     * 
     * @private
     */
    _setDifficulty: function(){
	var maxDiff = -1;
	var minDiff = 10000;
	
	// Set score
	for (var i=0; i<this.getNumPos(); i++){
	    var c = this.getChordPos(i)
	    var diff = this.getChordDiff(c);
	    if (diff<minDiff) minDiff=diff;
	    if (diff>maxDiff) maxDiff=diff;
	    c.setDiff(diff);
	}
	
	// Normalize scores... optional
	
	return this;
    },
    
    /**
     * 
     * Get chords difficulty
     * 
     * Change and loop:
     *     - Higher priority chords on top
     *     - UnInterapted patters (x ONLY)
     *     - Make sure the distance between fret and o is small
     *     - Make sure a base string is played!
     *     - Span, the sorter the better
     *     - Number of position < the better
     * 
     * TODO:FIXME: This does not work very well... find another way
     * 
     * @param {C.ChordRep} c
     * @return {Number}
     */
    getChordDiff: function(c){
	var min = 100000;
	var max = -1;
	var countXinBetween = 0;
	var countX = 0;
	var countXTotal = 0;
	var countOinBetween = 0;
	var countO = 0;
	var countOTotal = 0;
	var foundPress = false;
	
	for (var s=0; s<c.size(); s++) {
	    var cur = c.getPos(s);
	    
	    // MaxMin
	    if (cur>0 && cur<min) min=cur;
	    if (cur>max) max=cur;
	    
	    // Handle 0/-1
	    if (cur>-1) {
		// If 1st playable, discart OX
		if (!foundPress) {
		    countO=0;
		    countX=0;
		}
		foundPress=true; 
		// Add all previous...
		countXinBetween+=countX;
		countX=0;
		if (cur!=0) {
		    countOinBetween+=countO;
		    countO=0;
		}
		else {
		    countO++;	// this resets
		    countOTotal++;	// this doesn't
		}
	    }
	    else if (cur==-1) {
		countX++;	// this resets
		countXTotal++;	// this doesn't
	    }
	}
	
	// We should be OK here!
// 	lg (c+":"+countXTotal+" "+ countXinBetween+", "+countOTotal+" "+ countOinBetween+", "+min+" "+max)
	
	var score=50; // out of 100
	// An Open is good
	score -= (countOTotal)*5;
	// ... however an open in between is worse
	score += countOinBetween*10;
	// and all open is also Bad boy...
	if (max==0) score+=60;
	
	// X in the middle is very bad
	score += countXinBetween*20;
	// Small Penalty for not playing strings...
	score += (countXTotal-countXinBetween)*4;
	
	// Bar is bad!
	if (c.isBar()) score += 20;
	// However (full bar)
	if (c.isBar() && !countXinBetween && !countOinBetween) score -= 20;
	  
	    
	// Use less a bit long open
	if (countOTotal>0 && max>5) score+= (max -5)*3;
					  
	// The longer it spans the more diff
	if (max!=0) score+=(max-min)*5;
	
	
	
	
	// The Higher the better! (If no shit in the between)
	// just fractions for Fs...
// 	if (!countXinBetween && !countOinBetween)
// 	    score+=(min);
	
	// Playing a base is good...
	// Penalty chords that do not have one...
	if (c.getBasePos()>=this.getNumStrings()/2) score+=c.getBasePos()*5;
					  
					  
	
	return score;
	
    },
    
    /**
     * Make current set chord diagram in an HTML element
     * 
     * @param {C.ChordRep} what
     * @param {HTMLElement} el
     * @param {Object} opts
     */
    diagramHTML: function(what,el,opts){
	
	el = (el) ? el : this.c.diag.el;
	if (what===false) return false;
	
	C.DomUtil.empty(el);
	var base = this._getBaseTable();
	var idx = base[1];
	
	// Title
	idx[0][1].textContent = this.c.chord.toString();
	
	// First fret && Fretboard start!
	var numStrings = this.getNumStrings();
	var f = what.minPos();
	
	// We start from top
	if (f<=1 || what.maxPos()<=this.options.maxFretSpan+1){
	    f=""
	    for (var i=1; i<numStrings; i++)
		C.DomUtil.addClass(idx[1][i], "c_fretstart");
	}
	idx[2][0].textContent = f;
	var root = this.c.chord.getRoot().toString();
	
	// Add the chord
	for (var i=0; i<numStrings; i++){
	    
	    // See if root
	    var tmpNote = what.getNote(i).toString();
	    var cls="";
	    if (tmpNote==root) 
		cls=" root";
	    
	    
	    if (what.getPos(i)==0) {
		C.DomUtil.create("span",cls,idx[1][i]).textContent = "o";
		continue;
	    }
	    if (what.getPos(i)==-1) {
		C.DomUtil.create("span","",idx[1][i]).textContent = "x";
		continue;
	    }
	    var idxpos = what.getPos(i);
	    
	    if (what.maxPos()>this.options.maxFretSpan+1)
		idxpos = what.getPos(i) - what.minPos() +1; // start from 0 fret + headers
	    
	    var dot = C.DomUtil.create("div","guitardot"+cls,idx[idxpos+1][i+1]);
	    dot.innerText = tmpNote;
	}
	
	el.appendChild(base[0]);
	
	return this;
    },
    
    
    /**
     * Helper function to get the basic HTML table to be used for plotting
     * the chord on...
     * 
     * @return {Array} of DOMElement (table) and index of all it's cells
     * @@private
     */
    _getBaseTable: function(){
	var t = C.DomUtil.create('table','c_guitar_diagram noselect');
	var idx = [];
	
	// 1st line - title
	idx[0] = [];
	var cell = C.DomUtil.create('tr','',t);
	idx[0][0] = C.DomUtil.create('td','',cell); // wasted column
	idx[0][1] = C.DomUtil.create('td','c_chord_title',cell); // title
	idx[0][1].colSpan = this.getNumStrings()-1;
	
	var numStrings = this.getNumStrings();
	
	// The rest!
	for (var row=1; row<2+this.options.maxFretSpan+1; row++) {
	    idx[row] = [];
	    var cell = C.DomUtil.create('tr','',t);
	    for (var i=0; i<numStrings+1; i++) {
		var cls = "";
		if (row==1) cls="c_openclose"
		else if (row>1 && i>0 && i<numStrings) cls="c_fret_cell"
		
		// Style Extensions
		if (row==2 && i>0 && i<numStrings) cls+=" c_fret_cell_top";
		if (row==numStrings && i>0 && i<numStrings) cls+=" c_fret_cell_bottom";
		if (row>1 && i==1) cls+=" c_fret_cell_1st"
		
		idx[row][i] = C.DomUtil.create('td',cls,cell);
	    }
	}
	return [t,idx];
    },
    
    
    /**
     * Create full the fretboard, if applicable. Store
     * the HTML elements on this.fretboard to be able to 
     * clear without redrawing
     * 
     * @param {HTMLElement} el
     * @param {Object} opts
     * @param {String} opts.cssClass Base css class
     * @param {Boolean} opts.changeSize Change string size
     * @param {Function} opts.fretClick Callback for on click on fret
     * @return {Array} index
     */
    drawInstrument: function(el,opts){
	
	if (this.fretboard!==undefined) return;
	
	C.DomUtil.empty (el);
	var numStrings = this.getNumStrings();
	var numFrets = this.options.numFrets;
	
	// Base css class
	var cls = C.Util.objValue(opts, "cssClass", "g_fret_s");
	
	if (this.options.doubleString) cls+="d";
	
	// Create base table
	var t = C.DomUtil.create('table','c_guitar_fretboard noselect');
	var idx = [];
	
	var cb = C.Util.objValue(opts, "fretClick", false);
	
	for (var s=0; s<numStrings; s++){
	    
	    idx[s] = [];
	    var row = C.DomUtil.create('tr','',t);
	    idx[s][0] = C.DomUtil.create('td',"g_fret_open",row);
	    idx[s][0].setAttribute("data-string",s);
	    idx[s][0].setAttribute("data-fret",0);
	    if (cb) idx[s][0].onclick = cb;
	    
	    var clsExtra = "";
	    if ( C.Util.objValue(opts, "changeSize", false))  clsExtra = " s"+(s+1);
	    
	    for (var f=1; f<numFrets+2; f++){
		idx[s][f] = C.DomUtil.create('td',cls+clsExtra,row);
		idx[s][f].setAttribute("data-string",s);
		idx[s][f].setAttribute("data-fret",f);
		if (cb) idx[s][f].onclick = cb;
	    }
	}
	
	idx[numStrings] = [];
	var row = C.DomUtil.create('tr','',t);
	for (var f=0; f<numFrets+2; f++){
	    idx[numStrings][f] = C.DomUtil.create('td',"g_fret_num",row);
	    // dot pattern...
	    if ((f!=1 && f%2!=0 && f!=11 && f!=13) || f==12) idx[numStrings][f].innerText=f;
	}
	
	el.appendChild(t);
	
	this.fretboard = idx;
	
	return this;
    },
    
    /**
     * Draw the whole scale on the fretboard. 
     * 
     * TODO: extend with boxes
     */
    drawScale: function(scale,opts,el){
	this.drawInstrument(el,opts);
	var idx = this.fretboard;
	var notes = scale.getNotes();
	
	for (var n=0; n<notes.length; n++) {
	    
	    // create the correct class for this note
	    var cls="";
	    if (n==0) cls=" root";
	    
	    for (var s=0; s<this.getNumStrings(); s++) {
		
		// Get all positions of this not on this string
		var pos = this.getFretsFor(notes[n],s,this.options.numFrets+1);
		
		// Add them
		for (var p=0; p<pos.length; p++) {
		    var dot = C.DomUtil.create("div","guitardot"+cls,idx[this.getNumStrings()-s-1][pos[p]]);
		    dot.innerText = notes[n].toString();
		}
	    }
	}
	
	return this;
    },
    
    /**
     * Clear the current scale if any
     */
    clearScale: function(){
	var f = this.fretboard;
	
	if (!f) return;
	
	for (var i=0; i<f.length; i++){
	    for (var j=0; j<f[i].length; j++){
		C.DomUtil.empty(f[i][j]);
	    }
	}
    },
    
    drawChordOnInstrument: function(what,el,opts){
    }
}); 

/**
 * Basic Scale class
 * 
 * @class C.Scale
 * @extends C.Class
 */
C.Scale = C.Class.extend({
    options: {
	root: "C",
	name: "Major"
    },
    
    /**
     * Base init function. It will load the scale 
     * distances and cache it 
     * 
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	// Cache distances
	this.dist = C.Scale.TYPES[this.options.name];
    },
    
    /**
     * Get string representation of this scale
     */
    toString: function(){
	return this.options.root+" "+this.options.name;
    },
    
    /**
     * Set the root note of the scale
     * @param {String} root
     */
    setRoot: function(root){
	this.options.root=root;
	return this;
    },
    
    /** 
     * Set/Change the scale name/type 
     * 
     * @param {String} name
     */
    setName: function(name){
	this.options.name = name;
	this.dist = C.Scale.TYPES[this.options.name];
	return this;
    },
    
    /**
     * Get a note offset by f on the current scale and
     * from the current root note. 'f' is in the formula
     * format (ie. "1" or "b5")
     * 
     * @param {String} f
     * @return {C.Note}
     */
    offset: function(f){
	// Check for optional 1st
	if (f[0]=="(") {
	    f = f.substring(1,f.length-1);
	}
	
	var off = 0;
	if (f[0]=="b") {
	    f = parseInt(f.substring(1));
	    off=-1;
	}
	else if (f[0]=="#"){
	    f = parseInt(f.substring(1));
	    off=1;
	}
	
	
	// Loop offset! 9ths/11ths
	var oo = 0;
	if (f>this.dist.length) {
	    f=f%this.dist.length;
	    oo=1; // FIXME:!Not exactly, assuming only 1 octave offset
	}
	
	
	for (var i=0; (i<this.dist.length && i<f-1); i++) {
	    off+=this.dist[i]*2;
	}
	
	var n = new C.Note({note: this.options.root,octaveOffset: oo});
	return n.offset(off);
    },
    
    /**
     * Return all notes on the scale
     * 
     * @return {Array} C.Notes
     */
    getNotes: function(){
	var notes = [];
	notes[0] = new C.Note({note: this.options.root});
	var prevNote = new C.Note({note: this.options.root});
	for (var i=0; i<this.dist.length-1; i++){
	    notes.push(prevNote.offset(this.dist[i]*2).clone())
	}
	
	return notes;
    },
    
    /**
     * Get scale's name
     * @return {String}
     */
    getName: function(){
	return this.options.name;
    },
    
    /**
     * Get scale's root (attribute)
     * @return {String}
     */
    getRoot: function(){
	return this.options.root;
    },
    
    /**
     * Get scale's root (Note)
     * @return {C.Note}
     */
    getRootNote: function(){
	return new C.Note({note: this.options.root});
    }
});



/**
 * Full credit to: :( ?
 * 
 * Total: 
 * 
 * @static
 * @member C.Scale
 * @var
 */
C.Scale.TYPES = new Array(); 

C.Scale.TYPES["Major"]			= [ 1, 1, .5, 1, 1, 1, .5 ];
C.Scale.TYPES["Natural Minor"]		= [ 1, .5, 1, 1, .5, 1, 1 ];

C.Scale.TYPES["Major Pentatonic"]	= [ 1, 1, 1.5, 1, 1.5 ];
C.Scale.TYPES["Minor Pentatonic"]	= [ 1.5, 1, 1, 1.5, 1 ]; 
C.Scale.TYPES["Blues"]			= [ 1.5, 1, .5, .5, 1.5, 1 ];
C.Scale.TYPES["Major Blues"]		= [ 1, .5, .5, .5, .5, .5, 1, .5, 1 ]; 
C.Scale.TYPES["Minor Blues"]		= [ 1, .5, 1, .5, .5, .5, 1, 1 ]; 

// Shifting!
C.Scale.TYPES["Ionian Mode"]		= [ 1, 1, .5, 1, 1, 1, .5 ];
C.Scale.TYPES["Dorian Mode"]		= [ 1, .5, 1, 1, 1, .5, 1 ];
C.Scale.TYPES["Phrygian Mode"]		= [ .5, 1, 1, 1, .5, 1, 1 ];
C.Scale.TYPES["Lydian Mode"]		= [ 1, 1, 1, .5, 1, 1, .5 ];
C.Scale.TYPES["Mixolydian Mode"]	= [ 1, 1, .5, 1, 1, .5, 1 ];
C.Scale.TYPES["Aeolian Mode"]		= [ 1, .5, 1, 1, .5, 1, 1 ];
C.Scale.TYPES["Locrian Mode"]		= [ .5, 1, 1, .5, 1, 1, 1 ];


C.Scale.TYPES["Harmonic Minor"]		= [ 1, .5, 1, 1, .5, 1.5, .5 ];
C.Scale.TYPES["Phrygian Dominant"]	= [ .5, 1.5, .5, 1, .5, 1, 1 ];

C.Scale.TYPES["Jazz Melodic Minor"]	= [ 1, .5, 1, 1, 1, 1, .5 ];
C.Scale.TYPES["Dorian b2"]		= [ .5, 1, 1, 1, 1, .5, 1 ];
C.Scale.TYPES["Lydian Augmented"]	= [ 1, 1, 1, 1, .5, 1, .5 ];
C.Scale.TYPES["Lydian b7"]		= [ 1, 1, 1, .5, 1, .5, 1 ];
C.Scale.TYPES["Mixoydian b13"]		= [ 1, 1, .5, 1, .5, 1, 1 ];
C.Scale.TYPES["Locrian #2"]		= [ 1, .5, 1, .5, 1, 1, 1 ];
C.Scale.TYPES["Super Locrian"]		= [ .5, 1, .5, 1, 1, 1, 1 ];



C.Scale.TYPES["Chromatic"]		= [ .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5, .5 ];
C.Scale.TYPES["Whole Tone"]		= [ 1, 1, 1, 1, 1, 1, 1 ];
C.Scale.TYPES["Dimished Whole Half"]	= [ 1, .5, 1, .5, 1, .5, 1, .5 ];
C.Scale.TYPES["Dimished Half Whole"]	= [ .5, 1, .5, 1, .5, 1, .5, 1 ];


C.Scale.TYPES["Hungarian Minor"]	= [ 1, .5, 1.5, .5, 1.5, .5 ];
C.Scale.TYPES["Double Harmonic"]	= [ .5, 1.5, .5, 1, .5, 1.5, .5 ];
C.Scale.TYPES["Enigmatic"]		= [ 1, 1.5, 1, 1, 1, .5, .5 ];
C.Scale.TYPES["Japanese"]		= [ .5, 1.5, 1, .5, 1, .5 ];
/**
 * C.DomUtil contains various utility functions for working with DOM.
 * FULL CREDIT TO LEAFLET
 */
C.DomUtil = {
	get: function (id) {
		return typeof id === 'string' ? document.getElementById(id) : id;
	},

	getStyle: function (el, style) {

		var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	remove: function (el) {
		var parent = el.parentNode;
		if (parent) {
			parent.removeChild(el);
		}
	},

	empty: function (el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	},

	toFront: function (el) {
		el.parentNode.appendChild(el);
	},

	toBack: function (el) {
		var parent = el.parentNode;
		parent.insertBefore(el, parent.firstChild);
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = C.DomUtil.getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = C.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!C.DomUtil.hasClass(el, name)) {
			var className = C.DomUtil.getClass(el);
			C.DomUtil.setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			C.DomUtil.setClass(el, C.Util.trim((' ' + C.DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	setTransform: function (el, offset, scale) {
		var pos = offset || new C.Point(0, 0);

		el.style[C.DomUtil.TRANSFORM] =
			'translate3d(' + pos.x + 'px,' + pos.y + 'px' + ',0)' + (scale ? ' scale(' + scale + ')' : '');
	},

	setPosition: function (el, point, no3d) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (C.Browser.any3d && !no3d) {
			C.DomUtil.setTransform(el, point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	},
	
	setSelectedByValue: function(sel_id, value){
	    var sel = document.getElementById(sel_id);
	    
	    for (i=0; i<sel.options.length; i++) {
		if (sel.options[i].value == value) {
		    sel.selectedIndex = i;
		    break;
		}
	    }
	},
	
	getSelectedValue: function(sel_id){
	    var sel=document.getElementById(sel_id);
	    
	    if (sel.options[sel.selectedIndex] == undefined) return null;
	    
	    return sel.options[sel.selectedIndex].value;
	    
	}
};
 

/**
 * Basic Renderer Interface
 * @class IRenderer
 */
C.IRenderer = C.Class.extend({
    options: {
	type: "abstract"
    },
    
    initialize: function (options) {
	C.setOptions(this, options);
    }
})

C.IRenderer.byType = function(opts){

}
/**
 * Bazooka class...
 * 
 * @class
 * @extends C.IStringInstrument
 */
C.Bazooka = C.IStringInstrument.extend({
    options: {
	numFrets: 12,
	name: "Bazooka",
	description: "This is A Bazooka!",
	strings: ["D", "A", "D"],
	doubleString: true,
	
	// Playable? parameters
	hasBar: true, 
	ignoreTone0: true,
	maxPlayableTones: 4,
	maxFretSpan: 6 
    },
    
    
    _setDifficulty: function(){
	for (var i=0; i<this.c.pos.length; i++){
	    var c = this.c.pos[i];
	    var diff = c.span();
	    var uniq = c.pos.uniquegt(-1).length;
	    if (c.countNum(0)>0) diff--;
	    if (c.isBar()) {
		diff+=2;
// 		uniq-=c.countNum(c.getMinDuplicate()) +1;
	    }
	    
	    diff+=uniq;
	    diff/=2;
	    
	    c.setDiff(diff);
	}
    }
}) 
 
/**
 * Guitar class...
 * 
 * @class 
 * @extends C.IStringInstrument
 */
C.Guitar = C.IStringInstrument.extend({
    options: {
	numFrets: 12,
	name: "Guitar",
	description: "This is A guitar!",
	strings: ["E", "A", "D", "G", "B", "e"],
	
	// Playable? parameters
	hasBar: true, 
	ignoreTone0: true,
	maxPlayableTones: 4,
	maxFretSpan: 4
    }
}) 
/**
 * Piano class...
 * @class
 * @extends C.Instrument
 */
C.Piano = C.Instrument.extend({
    options: {
	numFrets: 0,
	name: "Piano",
	description: "This is A piano!",
	strings: [
	    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
	    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
	    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
	],
	
	// Playable? parameters
	hasBar: false, 
	ignoreTone0: false,
	maxPlayableTones: 5,
	maxFretSpan: 2 // TODO: [ -1 3 5 5 1 0 ] ISNT PLAYABLE
    },
    
    _splitFormulaDbgStr: function(){
	var str = "For each formula part on a per string basis.";
	for (var fp = 0; fp<this.c.fsplit.length; fp++) {
	    str+= "\n"+this.c.fsplit[fp] + " ("+this.c.notes[fp].toString()+"): ";
	    str+="=["+this.c.fpos[fp]+"] ";
	}
	
	return str;
    },
    
    _procChord: function(){
	// Find all positions for all sub-notes in chord
	for (var fp = 0; fp<this.c.fsplit.length; fp++) {
	    var tmpFp = this.c.fsplit[fp];
	    
	    
	    // Formula note... (from root of this chord)
	    var note = this.c.chord._formulaToNote(tmpFp);
	    this.c.notes.push (note);
	    
	    this.c.fpos[fp] = note.getIdx(true);
	}
    },
    
    /**
     * TODO: Check chord... 9ths, etc are wrong at the last
     * inversion
     */
    _slideWindow: function(){
	
	// Find 1st inversion!
	
	var fposlen = this.c.fpos.length;
	
	// for each fpos circularly!
	for (var i=0; i<fposlen; i++){
	    
	    var chordPos = new C.ChordRep.getEmpty(this.getNumStrings(), this);
	    var inversionPos = this.c.fpos[i];
	    chordPos.setPos(this.c.fpos[i],1);
	    chordPos.setNote(this.c.fpos[i], this.c.notes[i]);
	    
	    // for each fpos circularly! (after the current one) find the reset
	    for (var j=0; j<fposlen; j++) {
		if (i==j) continue;
		var tmppos = this.c.fpos[j];
		while (tmppos<inversionPos) {
		    tmppos+=C.NOTES.length;
		}
		
		// Fix me: here 9ths are wrong!
		
		// Add that pinch
		chordPos.setPos(tmppos,1);
		chordPos.setNote(tmppos, this.c.notes[j]);
		
	    }
	    
	    // Make sure all piches are added
	    if (this.getNumStrings() - chordPos.countNum(-1)!=fposlen) continue;
	    // We have a full chord here...
	    this.c.pos.push(chordPos);
	    
	}
    },
    
    _setDifficulty: function(){
	
    },
    
    
    /**
     * Make this chord diagram on an element
     */
    diagramHTML: function(what,el,opts){
	
	el = (el) ? el : this.c.diag.el;
	if (what===false) return false;
	
	C.DomUtil.empty(el);
	var base = this._getBaseTable();
	var idx = base[1];
	
	// Title
	idx[0][1].textContent = this.c.chord.toString();
	
	var root = this.c.chord.getRoot().toString();
	
	// Add the chord
	for (var i=0; i<this.getNumStrings(); i++) {
	    
	    if (what.getPos(i)==-1) continue;
	    
    
	    var isSharp = this.options.strings[i].indexOf('#')!=-1;
	    var cls = "pianodot";
	    var tops=2;
	    if (isSharp) {
		cls = "pianodot_up";
		tops=1;
	    }
	    
	    	      
	    // See if root
	    var tmpNote = what.getNote(i).toString();
// 	    lg(tmpNote+" "+root)
	    if (tmpNote==root) 
		cls+=" root";
	    var dot = C.DomUtil.create("div",cls,idx[tops][i]);
	}
	
	el.appendChild(base[0]);
	
    },
    
    _getBaseTable: function(){
	var t = C.DomUtil.create('table','c_piano_diagram  noselect');
	var idx = [];
	
	idx[0] = [];
	var cell = C.DomUtil.create('tr','',t);
	idx[0][0] = C.DomUtil.create('td','',cell); // wasted column
	idx[0][1] = C.DomUtil.create('td','c_chord_title',cell); // title
	idx[0][1].colSpan = this.getNumStrings();
	
	for (var i=1; i<3; i++){
	    idx[i] = [];
	    var cell = C.DomUtil.create('tr','',t);
	    for (var j=0; j<this.getNumStrings(); j++) {
		var cls="c_piano_cell";
		
		if (i==1) cls="c_piano_cell_top";
		
		// Additional 
		var isSharp = this.options.strings[j].indexOf('#')!=-1;
		var isSharpNext = 
		    (j==this.getNumStrings()-1) ? false : 
		    this.options.strings[j+1].indexOf('#')!=-1;
		
		if (i==1 && isSharp ) 
		    cls+=" c_piano_cell_sharp";
		else if (i==2 && isSharp ) 
		    cls+=" c_piano_cell_sharp_bottom";
		
		// Add for border
		if (!isSharpNext && !isSharp) cls+=" c_piano_cell_border";
		if (j==0) cls+=" c_piano_cell_first";
		
		idx[i][j] = C.DomUtil.create('td',cls,cell);
		
		if (i==2 && isSharp ) {
		    C.DomUtil.create("div","vertical-line",idx[i][j]);
		}
		
	    }
	}
	return [t,idx];
    },
}) 
 
/**
 * Base class for audio operations
 */
C.Audio = C.Class.extend({
    options:{
	success: function(){},	// Success callback
	error: function(err){ 	// Error callback
	    lg("C.Audio Error: "+err)
	}
    },
    
    // Static 
    audioCtx: {},
    
    /**
     * Base init function
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	
	navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
	
	this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	
	var tmpThis = this;
	
	if (navigator.getUserMedia) {
	    navigator.getUserMedia (
		{audio:true},
		function(stream){
		    tmpThis._success(stream);
		    tmpThis.options.success(stream);
		}, 
		this.options.error);
	}
	else {
	    lg ("NOT SUPPORTED BROWSER");
	}
    },
    
    /**
     * Base callback to set the stream on success and call user-level
     * callback
     */
    _success: function(stream) {
	this.stream = stream;
    },
    
    getSampleRate: function(){
	return this.audioCtx.sampleRate;
    },
    
    getCtx: function(){
	return this.audioCtx;
    }
    
});

/**
 * distortion curve for the waveshaper, thanks to Kevin Ennis
 * http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
 * 
 * @param {Number} amount [0-100]
 * @return {Array} curve
 */
C.Audio.makeDistortionCurve = function(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
