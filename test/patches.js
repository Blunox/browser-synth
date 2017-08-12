module.exports = {

	p1: {
		isMono: false,
  		numVoices: 8
	},
	p2: {
		isMono: false,
  		numVoices: 8,
  		soundGenerators: []
	},
	p3: {
		isMono: false,
  		numVoices: 8,
		soundGenerators: [
  			{
	        	type:"sine",
	        	octave: 3
	  		}
	  	]
	},
	p4: {
		isMono: false,
  		numVoices: 1,
		soundGenerators: [
				{
	        	type:"sine",
	        	octave: 3
	  		},
	  		{
	        	type:"sawtooth",
	        	octave: 1
	  		}
	  	]
	},
	p5: {
		isMono: true,
  		numVoices: 8
	},
	p6: {
		isMono: true,
		audioBuffers: [
 			{
		      id: 'hornA440',
		      url: '../asset/sound/hornA440.wav'
		    }
  		]
	},
	p7: {
		isMono: true,
		audioBuffers: [
 			{
		      id: 'hornA440',
		      url: '../asset/sound/hornA440.wav'
		    }
  		],

		soundGenerators: [
  			{
		        type:"sample",
		        src:"hornA440",
		        baseFrequency:184.98
		    }
	  	]

	},
	p8: {
		isMono: true,
		audioBuffers: [
 			{
		      id: 'hornA440',
		      url: '../asset/sound/hornA440.wav'
		    }
  		],
		soundGenerators: [
  			{
		        type:"sample",
		        src:"hornA440",
		        baseFrequency:184.98
		    },
		    {
	        	type:"sine",
	        	octave: 3
	  		}
	  	]
	},
	p9: {
		isMono: false,
  		numVoices: 1,
  		soundGenerators: [
  			{
	        	type:"sine",
	        	octave: 3,
	        	volume: 0.9
	  		},
	  		{
	        	type:"sawtooth",
	        	octave: 1,
	        	volume: 0.1
	  		}
	  	]
	},
	p10: {
		isMono: false,
  		numVoices: 1,
		soundGenerators: [
  			{
	        	type:"sine"
	  		}
	  	]
	},
	p10: {
		isMono: false,
  		numVoices: 1,
		soundGenerators: [
  			{
	        	type:"sine"
	  		}
	  	]
	},
	p11: {
		isMono: false,
  		numVoices: 5,
		soundGenerators: [
  			{
	        	type:"sine",
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
		  		url: '../asset/sound/hallShort.wav'
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
	frequencyLFOTest: {
		isMono: false,
		numVoices: 5,
		
		soundGenerators: [
  			{
	        	type:"square",
		        frequencyLFO: {
					shape: "sine",
					frequency: 5.0,
		            syncWithSongTempo: true,
        			beatMultiplier: 3,
					width: 5
				}
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
	effectMixLfoTestV1: {
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
      					frequency: 0.1
    				}
		          }
		        ]
	  		}
	  	]

	},
	effectMixLfoTestV2: {
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
      					mix: 1.0
    				}
		          }
		        ]
	  		}
	  	]
	},
	monoSynth: {
		isMono: true,
		numVoices: 5,
		soundGenerators: [
  			{
	        	type:"square"
	  		}
	  	]
	},
	polySynth: {
		isMono: false,
  		numVoices: 8,
		soundGenerators: [
  			{
	        	type:"sine",
	        	octave: 3
	  		},
	  		{
	        	type:"sawtooth",
	        	octave: 1
	  		}
	  	]
	}
}

 