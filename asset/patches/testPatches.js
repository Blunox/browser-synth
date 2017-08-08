var testPatches = {

	inputEnvelopeTest: {
		isMono: false,
  		numVoices: 8,
  		soundGeneratorSet: {
  			soundGenerators: [
		  		{
		        	type:"square",
		        	octave: 0.5,

		        	envelope: {
		        	  threshold: 0.15,
		        	  thresholdScaling: 0.75,
			          attack: 0.65, // Time in seconds
			          decay: 0.3,
			          decayLevel: 0.75,
			          release: 0.65
			        }
		  		}
		  	]
		}
	},
	amplitudeLFOTest: {
		isMono: false,
		numVoices: 5,
		soundGeneratorSet: {
			soundGenerators: [
	  			{
		        	type:"square",
			        effects: [
			          {
			            type: "amplitudeLFO",
			            shape: "square",
			            //frequency: 5.0,
			            syncWithSongTempo: true,
            			beatMultiplier: 3,
			            width: 0.815
			          }
			        ]
		  		}
		  	]
		}
	},
	biquadFilterTest: {
		isMono: false,
		numVoices: 5,
		soundGeneratorSet: {
			soundGenerators: [
	  			{
		        	type:"square",
			        effects: [
			          {
			            type: "biquadFilter",
        				filterType: "lowpass",
        				frequency: 1099, // 0 to 22050
        				qualityFactor: 0.5
			          }
			        ]
		  		}
		  	]
		}
	},
	delayTest: {
		isMono: true,
		numVoices: 5,
		soundGeneratorSet: {
			soundGenerators: [
	  			{
		        	type:"square",
			        effects: [
			          {
			            type:"delay",
				        delayTime: 0.1,
				        feedback: true,
				        feedbackGain: 0.75
			          }
			        ]
		  		}
		  	]
		}
	}
}

 