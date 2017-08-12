var testPatches = {

	inputEnvelopeTest: {
		isMono: false,
  		numVoices: 8,
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
	},
	amplitudeLFOTest: {
		isMono: false,
		numVoices: 5,
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

	},
	frequencyLFOTest: {
		isMono: false,
		numVoices: 5,
		
		soundGenerators: [
  			{
	        	type:"square",
		        frequencyLFO: {
					shape: "sine",
					//frequency: 5.0,
		            syncWithSongTempo: true,
        			beatMultiplier: 4,
					width: 6
				}
	  		}
	  	]
	},
	biquadFilterTest: {
		isMono: false,
		numVoices: 5,
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
	},
	delayTest: {
		isMono: true,
		numVoices: 5,
		soundGenerators: [
  			{
	        	type:"square",
		        effects: [
		          {
		            type:"delay",
			        //delayTime: 0.1,
			        syncWithSongTempo: true,
        			beatMultiplier: 0.1,
			        feedback: true,
			        feedbackGain: 0.75
		          }
		        ]
	  		}
	  	]
	},
	convolverTest: {
		isMono: true,
		numVoices: 5,
		audioBuffers: [
			{
		  		id: 'hallShort',
		  		url: 'asset/sound/hallShort.wav'
			}
		],
		soundGenerators: [
  			{
	        	type:"square",
		        effects: [
		          {
		            type:"convolver",
			        bufferId: "hallShort",
			        normalize: true
		          }
		        ]
	  		}
	  	]
	},
	distortionTest: {
		isMono: false,
		numVoices: 8,
		soundGenerators: [
  			{
	        	type:"sine",
		        effects: [
		          {
		            type:"distortion",
			        amount: 400,
			        oversample: '4x'
		          }
		        ]
	  		}
	  	]
	},
	effectEnvelopeTest: {
		isMono: false,
		numVoices: 5,
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
		            width: 0.815,
		            envelope: {
		          		attack: 0.65, // Time in seconds
		          		decay: 2.0,
		          		decayLevel: 0.0
		            }
		          }
		        ]
	  		}
	  	]
	},
	effectDryMixTest: {
		isMono: false,
		numVoices: 5,
		soundGenerators: [
  			{
	        	type:"square",
		        effects: [
		          {
		            type: "amplitudeLFO",
		            shape: "square",
		            frequency: 5.0,
		            width: 0.815,
		            mix: 0.75
		          }
		        ]
	  		}
	  	]
	},
	effectMixLfoTest: {
		isMono: false,
		numVoices: 5,
		soundGenerators: [
  			{
	        	type:"square",
		        effects: [
		          {
		            type: "biquadFilter",
    				filterType: "lowpass",
    				frequency: 1099, 
    				qualityFactor: 0.5,
		            mixLFO: {
      					shape: "sine",
      					frequency: 0.1,
      					XXXXmix: 1.0
    				}
		          }
		        ]
	  		}
	  	]
	}
}

 