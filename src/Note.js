

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

});

/**
 * Get index for a given note name 
 * 
 * @param {String} note
 * @return {Number} Index
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