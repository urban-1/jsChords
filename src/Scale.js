
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



