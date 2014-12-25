; // Prevent error when combining scripts!


if (typeof console === 'undefined'){
  var console = {
    log:function(){},
    warn:function(){},
    assert:function(){},
    error:function(){},
    info:function(){}
  }
};

/**
 * Chords Lib
 */
var C = {
    version: 'v0.1'
};

/**
 * Generic error handler for all AJAX errors. Logs the error message and 
 * status
 * 
 * @method
 * @param {Event} e
 * @static
 */
C.ajaxErr = function(e){
    if (e.statusText=="OK") return;
    console.log("AJAX ERROR:"+e.responseText+" status="+e.statusText);
    console.log(e);
};

/**
 * All base notes (no flats - major scale from C)
 * @member C
 * @var
 */
C.NOTES2  = ["C", "D", "E", "F", "G", "A", "B"];

/**
 * All notes (in semi-tones)
 * @member C
 * @var
 */
C.NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Notes with different naming...
 * @member C
 * @var
 */
C.NOTESIoanna = ["Do", "Do+", "Re", "Re+", "Mi", "Fa", "Fa+", "Sol", "Sol+", "La", "La+", "Si"];


// function lg(a){console.log(a)}
// Shortcut for console.log but may not work with IE!
lg = /*console.log =*/ Function.prototype.bind.call(console.log,console);


/**
 * Get a notes frequency
 * http://jonathan.bergknoff.com/journal/making-a-guitar-tuner-html5
 * 
 * @param {Number} referenceFreq
 * @param {Number} halfToneOffset
 * @return {Number} frequency
 * @method
 * @static
 */
C.getFreq = function(referenceFreq, halfToneOffset){
    return (referenceFreq * Math.pow(2, (halfToneOffset/12)))
};


C.getAllFreq = function(){
    var fs = [];
    
    for (i in C.Note.F) {
	if (i[1]=="b") continue;
	fs.push( {frequency: C.Note.F[i], name: i});
    };
    
    return fs;
};
