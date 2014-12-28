/**
 * 
 */
C.AudioUtil = { 
    
    /**
     * Calculate the average frequency given the data and the 
     * halftone range to focus in. This can be used to avoid 
     * overtones and harmonics when large spectrum is considered.
     * 
     * The result is appended in the dataset in:
     * data.frequency.stats.avgFinOctave
     * 
     * @param {Number} halfTones
     * @param {Object} data as returned by C.Audio.analyze
     * @param {Array} test_frequencies as returned by C.getAllFreq
     */
    calcFinOctave: function (halfTones, data, test_frequencies){
	var fstats = data.frequency.stats;
	
	var mLen = data.frequency.magnitudes.length;
	var mag = data.frequency.magnitudes;
	
	var avgFinOctave = 0;
	var sumMinOctave = 0;
	var notesLen = C.NOTES.length;
	var octStart = notesLen * (parseInt(fstats.maxIdx/notesLen))
	
	// Loop only for this octave! Do not calc HARMONICS 
	// or noise in other bandwidth ranges
	// 	    for (var f=octStart; f<octStart+notesLen; f++) {
	for (var f=fstats.maxIdx-halfTones; f<fstats.maxIdx+halfTones+1; f++) {
	    
	    var frequency = test_frequencies[f].frequency;
	    
	    avgFinOctave+=frequency * mag[f];
	    sumMinOctave+=mag[f];
	}
	
	data.frequency.stats.avgFinOctave = (avgFinOctave/sumMinOctave).toFixed(2);
    },
    
    /**
     * Analyzes a given timeseries and returns time and frequency 
     * properties.
     * 
     * Extended (a bit) version of the pseudo-Fourier found in:
     * http://jonathan.bergknoff.com/journal/making-a-guitar-tuner-html5
     * 
     * @param {Array} timeseries Input data
     * @param {Array} test_frequencies Frequencies considered in this app
     * @param {Number} sample_rate Sample rate of the audio device (in ms)
     * @return {Object}
     */
    analyze: function(timeseries, test_frequencies, sample_rate) {
	
	// 2pi * frequency gives the appropriate period to sine.
	// timeseries index / sample_rate gives the appropriate time coordinate.
	var scale_factor = 2 * Math.PI / sample_rate;
	
	/**
	 * Calculate as much stats here as possible
	 */
	var flen = test_frequencies.length;
	var tlen = timeseries.length;
	var amplitudes = [];
	var magnitudes = [];
	
	// frequency statistics
	var fstats = {
	    max: -100000,	// Max F
	    maxIdx: -1,		// Max F index
	    avgF: 0,		// Full bandwidth average
	    avgM: 0		// Avg magnitude
	};
	
	var tstats = {
	    max: -100000,
	    min: 100000,
	    amp: -1
	};
	var sum_mag = 0;
	var timeDone = false;
	
	// For each frequency and time
	for (var f=0; f<flen; f++){
	    
	    // Current F
	    var frequency = test_frequencies[f].frequency;
	    
	    // Represent a complex number as a length-2 array [ real, imaginary ].
	    var accumulator = [ 0, 0 ];
	    
	    for (var t=0; t<tlen; t++){
		
		// Time stats
		if (!timeDone) {
		    if (timeseries[t]>tstats.max) tstats.max=timeseries[t];
		    if (timeseries[t]<tstats.min) tstats.min=timeseries[t];
		}
		
		// 		if (Math.abs(timeseries[t])<0.05)
		// 		    continue;
		
		accumulator[0] += timeseries[t] * Math.cos(scale_factor * frequency * t);
		accumulator[1] += timeseries[t] * Math.sin(scale_factor * frequency * t);
		
		
	    }
	    
	    amplitudes[f] = accumulator.slice();
	    
	    // Compute the (squared) magnitudes of the complex amplitudes for each
	    // test frequency. 
	    magnitudes[f] = (accumulator[0]*accumulator[0] + accumulator[1]*accumulator[1]);
	    
	    
	    // Stats 
	    if (magnitudes[f]>fstats.max) {
		fstats.max = magnitudes[f];
		fstats.maxIdx = f;
	    }
	    
	    
	    sum_mag+=magnitudes[f];
	    fstats.avgF+=test_frequencies[f].frequency * magnitudes[f];
	}
	
	// Final stats
	fstats.avgF = fstats.avgF/sum_mag;
	
	// Compute the average magnitude. We'll only pay attention to frequencies
	// with magnitudes significantly above average.
	fstats.avgM = sum_mag/magnitudes.length;
	
	// Analog amplitude
	tstats.amp = tstats.max-tstats.min;
	
	return 	{ 
	    timeseries: timeseries, 
	    frequency: {
		amplitudes: amplitudes,
		magnitudes: magnitudes,
		stats: fstats
	    },
	    time: {
		stats: tstats
	    }
	};
    }
}