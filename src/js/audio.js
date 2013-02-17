var audio = (function() {
	
	var context = new webkitAudioContext();
	var source;
	var analyser;
	
	function createGraph() {
		// find and connect the audio source
		var elem = $('audio')[0];
		source = context.createMediaElementSource(elem);
		
		// monitoring 
		analyser = context.createAnalyser();
		analyser.fftSize = 2048;
		source.connect(analyser);		
		
		// out
		analyser.connect(context.destination);
	}

	this.init = function() {
		createGraph();
	}
	
	this.getAnalyser = function() {
		return analyser;
	}
	
	return {
		init: init,
		getAnalyser: getAnalyser
	};
})();