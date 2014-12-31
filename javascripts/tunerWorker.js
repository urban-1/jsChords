importScripts("http://rawgit.com/urban-1/jsChords/master/jschords-src.js")
self.onmessage = function(event)
{
	var timeseries = event.data.timeseries;
	var test_frequencies = event.data.test_frequencies;
	var sample_rate = event.data.sample_rate;
	var data = C.AudioUtil.analyze(timeseries, test_frequencies, sample_rate);
	self.postMessage(data);
}; 
