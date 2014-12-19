/**
 * Full credit to: http://guitarchordsworld.com/chord theory
 * and http://www.smithfowler.org/music/Chord_Formulas.htm
 * 
 * Total: 47
 * 
 * @static
 * @member C.Chord
 */
C.Chord.TYPES	= [];

C.Chord.TYPES["M"]	= { type: "M",		formula: "1 3 5",	name: "Major" };
C.Chord.TYPES["m"]	= { type: "m",		formula: "1 b3 5",	name: "Minor" };
C.Chord.TYPES["7"]	= { type: "7",		formula: "1 3 5 b7",	name: "7th" };
C.Chord.TYPES["m7"]	= { type: "m7",		formula: "1 b3 5 b7",	name: "Minor 7th" };
C.Chord.TYPES["maj7"]	= { type: "maj7",	formula: "1 3 5 7",	name: "Major 7th" };
C.Chord.TYPES["sus4"]	= { type: "sus4",	formula: "1 4 5",	name: "Suspended 4th" };
C.Chord.TYPES["dim"]	= { type: "dim",	formula: "1 b3 b5",	name: "Diminished" };
C.Chord.TYPES["aug"]	= { type: "aug",	formula: "1 3 #5",	name: "Augmented" };
C.Chord.TYPES["6"]	= { type: "6",		formula: "1 3 5 6",	name: "6th" };
C.Chord.TYPES["m6"]	= { type: "m6",		formula: "1 b3 5 6",	name: "Minor 6th" };
C.Chord.TYPES["6add9"]	= { type: "6add9",	formula: "1 3 5 6 9",	name: "6th Add 9th" };
C.Chord.TYPES["9"]	= { type: "9",		formula: "1 3 5 b7 9",	name: "9th" };
C.Chord.TYPES["m9"]	= { type: "m9",		formula: "1 b3 5 b7 9",	name: "Minor 9th" };
C.Chord.TYPES["maj9"]	= { type: "maj9",	formula: "1 3 5 7 9",	name: "Major 9th" };

C.Chord.TYPES["11"]	= { type: "11",		formula: "1 (3) 5 b7 (9) 11",	name: "11th" };
C.Chord.TYPES["m11"]	= { type: "m11",	formula: "1 b3 5 b7 (9) 11",	name: "Minor 11th" };
C.Chord.TYPES["maj11"]	= { type: "maj11",	formula: "1 3 5 7 (9) 11",	name: "Major 11th" };

C.Chord.TYPES["13"]	= { type: "13",		formula: "1 3 5 b7 (9) (11) 13",	name: "13th" };
C.Chord.TYPES["m13"]	= { type: "m13",	formula: "1 b3 5 b7 (9) (11) 13",	name: "Minor 13th" };
C.Chord.TYPES["maj13"]	= { type: "maj13",	formula: "1 3 5 7 (9) (11) 13",		name: "Major 13th" };

// Weird
C.Chord.TYPES["maj7#11"]= { type: "maj7#11",	formula: "1 3 5 7 #11",	name: "Major seven sharp 7th" };
C.Chord.TYPES["maj-5"]	= { type: "maj-5",	formula: "1 3 b5",	name: "Major Flat Five" };
C.Chord.TYPES["mmaj7"]	= { type: "m/maj7",	formula: "1 b3 5 7",	name: "Minor/Major 9th" };
C.Chord.TYPES["mmaj9"]	= { type: "m/maj9",	formula: "1 b3 5 7 9",	name: "Minor/Major 9th" };
C.Chord.TYPES["mmaj11"]= { type: "m/maj11",	formula: "1 b3 5 7 (9) 11",	name: "Minor/Major 11th" };
C.Chord.TYPES["mmaj13"]= { type: "m/maj13",	formula: "1 b3 5 7 (9) (11) 13",	name: "Minor/Major 13th" };
C.Chord.TYPES["m7-5"]	= { type: "m7-5",	formula: "1 b3 b5 b7",	name: "Minor seven flat fifth" };

// Sharps?
C.Chord.TYPES["7#5"]	= { type: "7#5",	formula: "1 3 #5 b7",	name: "Seven sharp five" };
C.Chord.TYPES["7b5"]	= { type: "7b5",	formula: "1 3 b5 b7",	name: "Seven flat five" };
C.Chord.TYPES["7b9"]	= { type: "7b9",	formula: "1 3 5 b7 b9",	name: "Seven flat ninth" };
C.Chord.TYPES["7#9"]	= { type: "7#9",	formula: "1 3 5 b7 #9",	name: "Seven sharp ninth" };
C.Chord.TYPES["9#5"]	= { type: "9#5",	formula: "1 3 #5 b7 9",	name: "Nine sharp five" };
C.Chord.TYPES["9b5"]	= { type: "9b5",	formula: "1 3 b5 b7 9",	name: "Nine flat five" };
C.Chord.TYPES["7#5#9"]	= { type: "7#5#9",	formula: "1 3 #5 b7 #9",	name: "Seven sharp five sharp nine" };
C.Chord.TYPES["7#5b9"]	= { type: "7#5b9",	formula: "1 3 #5 b7 b9",	name: "Seven sharp five flat nine" };
C.Chord.TYPES["7b5#9"]	= { type: "7b5#9",	formula: "1 3 b5 b7 #9",	name: "Seven flat five sharp nine" };
C.Chord.TYPES["7b5b9"]	= { type: "7b5b9",	formula: "1 3 b5 b7 b9",	name: "Seven flat five flat nine" };
C.Chord.TYPES["7#11"]	= { type: "7#11",	formula: "1 3 5 b7 #11",	name: "Seven sharp eleven" };

// Symatrical
C.Chord.TYPES["dim7"]	= { type: "dim7",	formula: "1 b3 b5 bb7",	name: "Diminished 7th" };

// 2 finger!
C.Chord.TYPES["5"]	= { type: "5",		formula: "1 5",		name: "5th" };
C.Chord.TYPES["-5"]	= { type: "-5",		formula: "1 b5",	name: "Flat 5th" };
C.Chord.TYPES["sus2"]	= { type: "sus2",	formula: "1 2 5",	name: "Suspended 2nd" };
C.Chord.TYPES["#11"]	= { type: "#11",	formula: "1 5 #11",	name: "Sharp Eleven" };


// Aliases
C.Chord.TYPES["°"]	= C.Chord.TYPES["dim"];
C.Chord.TYPES["°7"]	= C.Chord.TYPES["dim7"];
C.Chord.TYPES["+"]	= C.Chord.TYPES["aug"];




