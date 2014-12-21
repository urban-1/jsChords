

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
	this.idx = C.Note.noteIndex(this.options.note);
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