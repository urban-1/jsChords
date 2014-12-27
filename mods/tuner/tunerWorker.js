
self.onmessage = function(event)
{
	var timeseries = event.data.timeseries;
	var test_frequencies = event.data.test_frequencies;
	var sample_rate = event.data.sample_rate;
	var data = anal(timeseries, test_frequencies, sample_rate);
	self.postMessage(data);
};


/**
 * 
 * http://jonathan.bergknoff.com/journal/making-a-guitar-tuner-html5
 */
function anal(timeseries, test_frequencies, sample_rate)
{
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