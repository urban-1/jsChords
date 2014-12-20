

/**
 * Basic Chord class
 * An important notice: FUCK MIDDLE AGED BRITISH FUCKTARDS
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
}

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
}


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
	return (this.pos.join('') == c.pos.join(''));
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
