 
 // Define the set of test frequencies that we'll use to analyze microphone data.
    var test_frequencies = C.getAllFreq();
    var correlation_worker,audio;
    var data;
    var allTimesMax =-10;
    var MSSAMPLE = 100;
    var CONFTHRES = 10;
    var SIGNALAMP = 0.05;
    var HALFTONEGOOD = 0.1;
    
    window.addEventListener("load", onLoad);
    
    function onLoad()
    {
	audio = new C.Audio({
	    success: use_stream
	});
	correlation_worker = new Worker("tunerWorker.js");
	correlation_worker.addEventListener("message", interpret_correlation_result);
	vis(C.DomUtil.get("canvasF"))
	visAnal(C.DomUtil.get("canvasA"))
    }
    
    
    function use_stream(stream)
    {
	    var audio_context = audio.getCtx();
	    var minBufLen = MSSAMPLE * audio_context.sampleRate / 1000
	    var microphone = audio_context.createMediaStreamSource(stream);
	    var script_processor = audio_context.createScriptProcessor(1024, 1, 1);
	    script_processor.connect(audio_context.destination);
	    microphone.connect(script_processor);
	    
	    var buffer = [];
	    var recording = true;
	    // Need to leak this function into the global namespace so it doesn't get
	    // prematurely garbage-collected.
	    // http://lists.w3.org/Archives/Public/public-audio/2013JanMar/0304.html
	    window.capture_audio = function(event)
	    {
		    if (!recording)
			    return;
		    buffer = buffer.concat(Array.prototype.slice.call(event.inputBuffer.getChannelData(0)));
		    // Stop recording after MSSAMPLE.
		    if (buffer.length > minBufLen)
		    {
			    recording = false;
			    correlation_worker.postMessage
			    (
				    {
					    "timeseries": buffer,
					    "test_frequencies": test_frequencies,
					    "sample_rate": audio_context.sampleRate
				    }
			    );
			    
			    buffer = [];
			    // Urban: sliding window ?? Keep middle values...?!
// 			    buffer=buffer.splice(minBufLen/1.5);
			    
			    setTimeout(function() { recording = true; }, 250);
		    }
	    };
	    script_processor.onaudioprocess = window.capture_audio;
    }
    
    function calcFinOctave(){
	    var fstats = data.frequency.stats;
	    
	    var mLen = data.frequency.magnitudes.length;
	    var mag = data.frequency.magnitudes;
	    
	    var avgFinOctave = 0;
	    var sumMinOctave = 0;
	    var notesLen = C.NOTES.length;
	    var octStart = notesLen * (parseInt(fstats.maxIdx/notesLen))
	    
	    // Loop only for this octave! Do not calc HARMONICS 
	    // or noise in other bandwidth ranges
	    for (var f=octStart; f<octStart+notesLen; f++) {
		
		var frequency = test_frequencies[f].frequency;
		
		avgFinOctave+=frequency * mag[f];
		sumMinOctave+=mag[f];
	    }
	    
	    data.frequency.stats.avgFinOctave = avgFinOctave/sumMinOctave;
    }
    
    
    function interpret_correlation_result(event)
    {
	    data = event.data;
	    var timeseries = data.timeseries;
	    var frequency_amplitudes = data.frequency.amplitudes;
	    var magnitudes = data.frequency.magnitudes;
	    
	    
// 	    var average = magnitudes.reduce(function(a, b) { return a + b; }, 0) / magnitudes.length;
	    var fstats = data.frequency.stats;
	    
	    calcFinOctave();
	    
	    
	    var confidence = fstats.max / fstats.avgM;
	    var avgF = fstats.avgFinOctave;
// 	    if (confidence>CONFTHRES) lg(confidence,fstats.max,fstats.avgM)
	    if (confidence > CONFTHRES && data.time.stats.amp > SIGNALAMP)
	    {
		var dominant_frequency = test_frequencies[fstats.maxIdx];
		document.getElementById("note-name").textContent = dominant_frequency.name;
		document.getElementById("frequency").textContent = dominant_frequency.frequency;
		document.getElementById("avgf").textContent = avgF;
		
		var halfToneDist = C.getFreqOffset(dominant_frequency.frequency, avgF);
		halfToneDist=Math.abs(halfToneDist);
		
		// FIXME: calc note spacing!
		if (halfToneDist<=HALFTONEGOOD)
		    document.getElementById("dir").textContent = "O";
		else if (avgF<dominant_frequency.frequency) 
		    document.getElementById("dir").textContent = "<";
		else 
		    document.getElementById("dir").textContent = ">";
			
	    }
	    
	    /*if (allTimesMax<fstats.max) */allTimesMax=fstats.max;
	    
	    C.DomUtil.get("ddata").innerHTML = JSON.stringify(data.frequency.stats)+
					    "<br/>"+JSON.stringify(data.time.stats);
    }
    
    
    function vis(el){
	var WIDTH = el.width;
	var HEIGHT = el.height;

	var canvasCtx = el.getContext("2d");
	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
	
	
	function draw() {
	    drawVisual = requestAnimationFrame(draw);
	    var magnitudes = ( data ) ? data.frequency.magnitudes : false;
	    if (!magnitudes) return;
	    

	    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
	    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
	    drawFs(el);

	    var barWidth = (WIDTH / magnitudes.length)-1;
	    var barHeight;
	    var x = 0;
	    for(var i = 0; i < magnitudes.length; i++) {
		if (magnitudes[i]==0) continue;
		    barHeight = magnitudes[i]/allTimesMax*HEIGHT;

		canvasCtx.fillStyle = 'red';
		canvasCtx.fillRect(x,HEIGHT-barHeight,barWidth,barHeight);

		x += barWidth + 1;
	    }
	};

	draw();
    }
    
    function drawFs(el){
	var WIDTH = el.width;
	var HEIGHT = el.height;

	var canvasCtx = el.getContext("2d");
	
	
	var barWidth = 1;
	var barWidth2 = (WIDTH / test_frequencies.length)-1;
	
	var min = test_frequencies[0].frequency
	var max = test_frequencies[test_frequencies.length-1].frequency
	// Bandwidth
	var bw = max-min;
	    
	for(var i = 0; i < test_frequencies.length; i++) {
	    var f = test_frequencies[i].frequency;
	    var n = test_frequencies[i].name;
	    if (n[1]=="#") {
		continue;
	    }
	    var color = "blue";
	    if ((i%12)==0) color = "yellow";
	    
	    
	    
	    canvasCtx.fillStyle = color;
	    // We dont plot in scale (lower Fs are too dense)
// 	    canvasCtx.fillRect((f-min)*WIDTH/bw,0,barWidth,HEIGHT);
	    canvasCtx.fillRect(i*(barWidth2+1),0,barWidth2,HEIGHT);
	    
	}
    }
    
        
    function visAnal(el){
	var WIDTH = el.width;
	var HEIGHT = el.height;

	var canvasCtx = el.getContext("2d");
	canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
	


	function draw2() {
	    requestAnimationFrame(draw2);
	    var dataAnalog = ( data ) ? data.timeseries : false;
	    
	    if (!dataAnalog) return;

	    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
	    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

	    canvasCtx.lineWidth = 1;
	    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

	    canvasCtx.beginPath();

	    var sliceWidth = WIDTH * 1.0 / dataAnalog.length;
	    var x = 0;

	    for(var i = 0; i < dataAnalog.length; i++) {
	
		var v = dataAnalog[i];
		var y = v * HEIGHT/2 + HEIGHT/2;

		if(i === 0) {
		    canvasCtx.moveTo(x, y);
		} else {
		    canvasCtx.lineTo(x, y);
		}

		x += sliceWidth;
	    }

	    canvasCtx.lineTo(WIDTH, HEIGHT/2);
	    canvasCtx.stroke();
	};

	draw2();
    }
    
// Unnecessary addition of button to play an E note.
var note_context = new AudioContext();
var note_node = note_context.createOscillator();
var gain_node = note_context.createGain();
note_node.frequency.value = C.Note.F["E4"]; // E, ~82.41 Hz.
gain_node.gain.value = 0;
note_node.connect(gain_node);
gain_node.connect(note_context.destination);
note_node.start();
var playing = false;
function toggle_playing_note()
{
	lg(note_node.frequency.value)
	playing = !playing;
	if (playing)
		gain_node.gain.value = 0.5;
	else
		gain_node.gain.value = 0;
}