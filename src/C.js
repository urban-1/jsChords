; // Prevent error when combining scripts!


if (typeof console === 'undefined'){
  var console = {
    log:function(){},
    warn:function(){},
    assert:function(){},
    error:function(){},
    info:function(){}
  }
}

/**
 * Regbetiko Chords Lib
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
 * All base notes (no flats)
 */
C.NOTES2  = ["C", "D", "E", "F", "G", "A", "B"];

/**
 * All notes (in semi-tones)
 */
C.NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
C.NOTESIoanna = ["Do", "Do+", "Re", "Re+", "Mi", "Fa", "Fa+", "Sol", "Sol+", "La", "La+", "Si"];


// function lg(a){console.log(a)}
lg = /*console.log =*/ Function.prototype.bind.call(console.log,console);
