
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
     * - ingoreTone0: true/false, Mainly true for string instruments. The 0 is 
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
	    if (c.getPos(i)!=0 || !this.options.ingoreTone0) {
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
// 	lg (tab+"Rec s="+(s)+"/"+this.getNumStrings()+" "+chord)
	
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
// 		    lg(tab+"Skipping "+tmp_pos+" "+(max-min))
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
		    !this._checkChord(newChord) )
		    continue;
		
		
		// Assuming we got everything now...
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
     * - Higher priority chords on top
     * - UnInterapted patters (x ONLY)
     * - Make sure the distance between fret and o is small
     * - Make sure a base string is played!
     * - Span, the sorter the better
     * - Number of position < the better
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
	score -= countOTotal*5;
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
	if (!countXinBetween && !countOinBetween)
	    score+=( min/30);
	
	// Playing a base is good...
	// Penalty chords that do not have one...
	if (c.getBasePos()>=this.getNumStrings()/2) score+=c.getBasePos()*5;
					  
					  
	
	return score;
	
    },
    
    /**
     * Make this chord diagram on an element
     */
    diagram: function(what,el,opts){
	what=C.Instrument.prototype.diagram.call(this,what,el,opts);
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
