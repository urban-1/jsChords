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






