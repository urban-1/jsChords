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
 */
C.NOTESIoanna = ["Do", "Do+", "Re", "Re+", "Mi", "Fa", "Fa+", "Sol", "Sol+", "La", "La+", "Si"];


// function lg(a){console.log(a)}
// Shortcut for console.log but may not work with IE!
lg = /*console.log =*/ Function.prototype.bind.call(console.log,console);


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
    // extend an object with properties of one or more other objects
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
    
    // create an object from a given prototype
    create: Object.create || (function () {
	function F() {}
	return function (proto) {
	    F.prototype = proto;
	    return new F();
	};
    })(),
    
    /**
     * set options to an object, inheriting parent's options as well
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
    
    
    objNull: function(obj, key){
	return (C.Util.objValue(obj,key,undefined)===undefined)
    },
    
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
    
    objIsEmpty: function(obj){
	for(var key in obj) {
	    if(obj.hasOwnProperty(key)) return false;
	}
	
	return true;
    },
    
    // trim whitespace from both sides of a string
    trim: function (str) {
	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },
    
    // split a string into words
    splitWords: function (str) {
	return C.Util.trim(str).split(/\s+/);
    },
    
    /**
     * Clone an object instead of pointing to it!
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
 * @static
 */
C.setOptions = C.Util.setOptions;
/**
 * Alias to C.Util.extend
 * @method extend
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
	duration: 1,		// time duration (sec?)
	style: "",		// bend "b", vibrato "~"
	styleAttr: "",		// Style attribure: 1, 1/2, etc for bends,
	octaveOffset:false,	// Used for 9ths +
	playPos: -1	 	// Position on an instrument (comparison between instr cannot be done)
    },
    
    
    initialize: function (options) {
	C.setOptions(this, options);
	this.idx = C.Note.noteIndex(this.options.note);
    },
    
    toString: function(){
	return this.options.note;
    },
    
    setNote: function(note){
	this.options.note = note;
	this.idx = C.Note.noteIndex(note);
    },
    
    /**
     * Offest by off. Off is in half-tones, if step is given 
     * then it will off*step ie: step=2 (by tone)
     * @chainable
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
    
    offsetNotes: function(off){
	if (off==0) return;
	var idx2 = C.NOTES2.indexOf(this.options.note);
	idx2 = (off + idx2)%C.NOTES2.length;
	
	this.idx = C.NOTES.indexOf(C.NOTES2[idx2]);
	this.options.note = C.NOTES[this.idx];
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
    
    getIdx: function(useOffset) {
	var off = this.idx;
	if (useOffset && this.options.octaveOffset) off+=C.NOTES.length;
	return off;
    }

});

/**
 * @static
 */
C.Note.noteIndex = function(note){
    
    if (note[1]=="b") {
	note = note[0];
	var idx = C.NOTES.indexOf(note)-1;
	if (idx<0) idx = C.NOTES.length -idx;
	return idx;
    }
    
    return C.NOTES.indexOf(note);
};

/**
 * @static
 */
C.Note.indexNote = function(idx){
    return C.NOTES[idx];
};

/**
 * @static
 */
C.Note.byIdx = function(idx){
    return new C.Note({note: C.NOTES[idx]});
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
    
    initialize: function (options) {
	C.setOptions(this, options);
    },
    
    toString: function(){
	return this.options.root+ this.getChordType().type
    },
    
    offset: function(off, step){
	var idx = C.Note.noteIndex(this.options.root);
	if (step!==undefined) off*=step;
	var newIdx = (idx+off);
	this.options.root = C.NOTES[newIdx];
    },
    
    setType: function(type){
	this.options.type = type;
    },
    
    setRoot: function(root){
	this.options.root = root;
    },
    
    _formulaToIdx: function(f){
	return this._formulaToNote(f).getIdx();
	
    },
    
    _formulaToNote: function(f){
	var scale = new C.Scale({root: this.options.root,type:"Major"})
	return scale.offset(f);
    },
    
    getFormula: function(){
	return this.getChordType().formula;
    },
    
    getChordType: function(){
	return C.Chord.TYPES[this.getType()];
    },
    
    getRoot: function(){
	return this.options.root;
    },
    
    getType: function(){
	return (this.options.type=="") ? "M" : this.options.type;
    },
    
    getFullName: function(){
	return this.getChordType().name;
    },
    
    getNotes: function(){
	var f = this.getFormula().split(" ");
	var notes = [];
	for (var i=0; i<f.length; i++) {
	    notes.push(this._formulaToNote(f[i]));
	}
	
	return notes;
    },
    
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
C.Chord.getAllTypes = function(cname) {
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
    
    initialize: function (options) {
	C.setOptions(this, options);
	
	// Final chord positions
	this.pos = [];
	// Note of each position
	this.notes=[];
	// Chord difficulty (last step, informational, experimental)
	this.diff=-1;
    },
    
    size: function(){
	return this.pos.length
    },
    
    getPos: function(idx){
	return this.pos[idx];
    },
    
    /**
     * Set a position/offset on a specific string. This function
     * will clear any note set for this offset/string. One has to 
     * manually reset the note if needed (use the root+offset of the instrument)
     */
    setPos: function (idx, what){
	this.pos[idx]=what
	this.notes[idx]="-"
    },
    
    getNote: function(idx){
	return this.notes[idx];
    },
    
    setNote: function (idx, what){
	this.notes[idx]=what
    },
    
    isEmptyTill: function (len){
	for (var i=0; i<len; i++){
	    if (this.pos[i]!=-1) return false;
	}
	
	return true;
    },
    
    isEmpty: function(){
	if (this.pos.length==0) return true;
			    
	for (var i=0; i<this.pos.length; i++)
	    if (this.pos[i]!=-1) 
		return false;
	
	return true;
    },
    
    getPartialHigher: function(len){
	var tmpChord = C.ChordRep.getEmpty(this.pos.length);
	for (var i=len; i<tmpChord.pos.length; i++){
	    tmpChord.setPos(i,this.pos[i]);
	    tmpChord.setNote(i,this.notes[i]);
	}
	return tmpChord;
    },
    
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
    
    clone: function(){
	var c = new C.ChordRep();
	c.pos = this.pos.slice(0);
	c.notes = this.notes.slice(0);
	c.diff = this.diff;
	
	return c;
    },
    
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
    
    countNum: function(num){
	return this.pos.countWhat(num);
    },
    
    minPos: function(){
	return this.pos.mingt(0);
    },
    
    getMinPosGt: function(gt){
	return this.pos.mingt(gt)
    },
    
    maxPos: function(){
	return this.pos.max();
    },
    
    span: function(){
	return this.maxPos() - this.minPos();
    },
    
    setDiff: function(d){
	this.diff = d;
    },
    
    getDiff: function(){
	return this.diff;
    },
    
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
 * 
 * @static
 */
C.ChordRep.dbgPrintArray = function(arr,debug){
    for (var i=0; i<arr.length; i++){
	lg (arr[i].toString(debug))
    }
};

/**
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
    
    getNumStrings: function(){
	return  this.options.strings.length;
    },
    
    getName: function(){
	return this.options.name;
    },
    
    getDescription: function(){
	return this.options.description;
    },
    
    mapChord: function(c){
	this.c.chord=c;
	this._initChordData();
	this._procChord();
// 	lg(this._splitFormulaDbgStr());
	
	this._slideWindow();
	this._setDifficulty();
	this._sortChordPos();
// 	C.ChordRep.dbgPrintArray(this.c.pos,true)
	
    },
    
    /**
     * Init chord data structure
     * @private
     */
    _initChordData: function(){
	
	// Init data
	this.c.form = this.c.chord.getFormula();
	this.c.fsplit = this.c.form.split(" ");
	
	this.c.notes = new Array();
	this.c.fpos   = new Array();
	this.c.pos   = new Array();
    },
    
    /**
     * Process chord and find the positions for each formula 
     * part on each string...
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
		// String root note
		var rootNote = this.getStringRoot(i);
		
		var rIdx = rootNote.getIdx();
		var nIdx = note.getIdx();
		
		
		// Find the 1st position after the root
		var first;
		
		if (nIdx >= rIdx) 
		    first = parseInt(nIdx-rIdx);
		else 
		    first = parseInt((C.NOTES.length - rIdx)+nIdx);
		
		// Expand to the number of frets
		while (first<=this.options.numFrets+this.options.maxFretSpan){
		    if (this.c.fpos[i].hasItem(first)) continue;
		    this.c.fpos[i].push(first);
		    first+=C.NOTES.length;
		}
		
// 		lg("Pos: "+this.c.pos[fp][i]);
	    }
	}
	
    },
    
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
     * Generic diff
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
    },
    
    /**
     * TODO: Add 9ths rules...
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
     */
    getNumPos: function(){
	return this.c.pos.length
    },
    
    getPosIdx: function(){
	return this.c.diag.idx
    },
    
    getChordPos: function(idx){
	if (idx<0) idx=0;
	if (idx>=this.c.pos.length) idx=this.c.pos.length-1;
	
	return this.c.pos[idx];
    },
    
    _sortChordPos: function(){
	this.c.pos.sort(function(a,b){
	    return (a.getDiff()-b.getDiff())
	});
    },
    
    
    //--------------------------------
    // Plotting/GUI
    //--------------------------------
    
    /**
     * Base of diagram, ensure that what is a chord representation
     * and store info...
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
	
    },
    
    /**
     * Show next chord
     */
    diagramNext: function(){
	if (this.c.diag.idx==-1 || !this.c.diag.el) return false;
	this.diagram(this.c.diag.idx+1);
	return true;
    },
    
    /**
     * Show prev chord
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
     * - hasBar: true/false, If the instrument supports bar chords... with a bar 
     * chord the minimum duplicate pos is considered to be occuping 1 finger
     * 
     * - ignoreTone0: true/false, Mainly true for string instruments. The 0 is 
     * considered open and does nto need a finger (used also in _slideWindow)
     * 
     * - maxPlayableTones: 4/5, Usually the same number as the fingers?!
     *  
     * - maxFretSpan: 4, how many frets a chord can occupy (width)
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
     * WARNING: This is a FUCKED UP FUNCTION that you DONT want to mess up with... However,
     * you might wanna optimize it... so feel free!
     * 
     * Now, this function builds chords from formula parts. It works as a sliding window
     * starting from fret number 0 (which can optionally be considered as free/open - see
     * instrument options). It will make all combinations of numbers/pos that can be done
     * in this "box/window". Steps:
     * 
     * 1. For each window, create a chord representation including the minimum
     * numbers. Numbers that are in the box but not minimum will be stored as
     * alternatives
     * 
     * 2. Expand all the alternatives for all the strings (combinatorial) and create
     * new chord positions (since we do know they fall into the window)
     * 
     * 3. Get chord variations for each created chord... variation is considered a 
     * complete chord without using the base strings (ie F=[ 1 3 3 2 1 1 ],
     * F_variation = [ -1 -1 -3 2 1 1] and derives from F). Append these to the 
     * chord list
     * 
     * 4. Filter crappy representations out by:
     *   a. _checkBase: ensuring correct base string (not sure is correct...)
     *   b. isEmpty: Make sure chord is not empty 
     *   c. ._chordPosExists: No duplicates
     *   d. isChordPlayable: Based on the instrument make sure the chord is playable
     *   e. _checkChord: Verify that the chord has all required formula parts
     *   
     * 5. Append the remaining chords in the result: this.c.pos which is an array
     * of C.ChordRep
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
	
    },
    
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
    
    
    _chordPosExists: function(c){
	for (var p=0; p<this.getNumPos(); p++){
	    if (c.equal(this.getChordPos(p)))
		return true;
	}
	
	return false;
    },
    
    
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
    },
    
    /**
     * Change and loop:
     *     - Higher priority chords on top
     *     - UnInterapted patters (x ONLY)
     *     - Make sure the distance between fret and o is small
     *     - Make sure a base string is played!
     *     - Span, the sorter the better
     *     - Number of position < the better
     * 
     * TODO:FIXME: This does not work very well... find another way
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
	
    },
    
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
     * Make this chord diagram on an element
     */
    drawInstrument: function(el,opts){
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
	type: "Major"
    },
    
    initialize: function (options) {
	C.setOptions(this, options);
	// Cache distances
	this.dist = C.Scale.TYPES[this.options.type];
    },
    
    // 1. Create a note (root)
    // 2. Return the scaled/offseted note
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
	var oo = false;
	if (f>this.dist.length) {
	    f=f%this.dist.length;
	    oo=true;
	}
	
	
	for (var i=0; (i<this.dist.length && i<f-1); i++) {
	    off+=this.dist[i]*2;
	}
	
	var n = new C.Note({note: this.options.root,octaveOffset: oo});
	return n.offset(off);
    }
});



/**
 * Full credit to: :( ?
 * 
 * Total: 
 * 
 * @static
 * @member C.Scale
 */
C.Scale.TYPES = new Array(); 

C.Scale.TYPES["Major"]			= [ 1, 1, .5, 1, 1, 1, .5 ];
C.Scale.TYPES["Natural Minor"]		= [ 1, .5, 1, 1, .5, 1, 1 ];
C.Scale.TYPES["Major Pentatonic"]	= [ 1, 1, 1.5, 1, 1.5 ];
C.Scale.TYPES["Minor Pentatonic"]	= [ 1.5, 1, 1, 1.5, 1 ]; 

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
	numFrets: 15,
	name: "Bazooka",
	description: "This is A Bazooka!",
	strings: ["D", "A", "D"],
	
	// Playable? parameters
	hasBar: true, 
	ignoreTone0: true,
	maxPlayableTones: 4,
	maxFretSpan: 6 // TODO: [ -1 3 5 5 1 0 ] ISNT PLAYABLE
    },
    
//     c: {},
    
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
 
