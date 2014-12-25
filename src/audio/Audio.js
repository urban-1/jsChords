/**
 * Base class for audio operations
 */
C.Audio = C.Class.extend({
    options:{
	success: function(){},	// Success callback
	error: function(err){ 	// Error callback
	    lg("C.Audio Error: "+err)
	}
    },
    
    // Static 
    audioCtx: {},
    
    /**
     * Base init function
     * @param {Object} options
     */
    initialize: function (options) {
	C.setOptions(this, options);
	
	navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
	
	this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	
	var tmpThis = this;
	
	if (navigator.getUserMedia) {
	    navigator.getUserMedia (
		{audio:true},
		function(stream){
		    tmpThis._success(stream);
		    tmpThis.options.success(stream);
		}, 
		this.options.error);
	}
	else {
	    lg ("NOT SUPPORTED BROWSER");
	}
    },
    
    /**
     * Base callback to set the stream on success and call user-level
     * callback
     */
    _success: function(stream) {
	this.stream = stream;
    },
    
    getSampleRate: function(){
	return this.audioCtx.sampleRate;
    },
    
    getCtx: function(){
	return this.audioCtx;
    }
    
});

/**
 * distortion curve for the waveshaper, thanks to Kevin Ennis
 * http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
 * 
 * @param {Number} amount [0-100]
 * @return {Array} curve
 */
C.Audio.makeDistortionCurve = function(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
