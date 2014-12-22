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
 
