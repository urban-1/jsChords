

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
     */
    _formulaToNote: function(f){
	var scale = new C.Scale({root: this.options.root,type:"Major"})
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
