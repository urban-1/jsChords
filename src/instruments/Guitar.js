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
	ingoreTone0: true,
	maxPlayableTones: 4,
	maxFretSpan: 4 // TODO: [ -1 3 5 5 1 0 ] ISNT PLAYABLE
    }
}) 
