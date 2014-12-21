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
 
