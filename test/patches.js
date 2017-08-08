module.exports = {

	p1: {
		isMono: false,
  		numVoices: 8
	},
	p2: {
		isMono: false,
  		numVoices: 8,
  		soundGeneratorSet: {}
	},
	p3: {
		isMono: false,
  		numVoices: 8,
  		soundGeneratorSet: {
  			soundGenerators: [
      			{
		        	type:"sine",
		        	octave: 3
		  		}
		  	]
		}
	},
	p4: {
		isMono: false,
  		numVoices: 1,
  		soundGeneratorSet: {
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
  		soundGeneratorSet: {
  			soundGenerators: [
      			{
			        type:"sample",
			        src:"hornA440",
			        baseFrequency:184.98
			    }
		  	]
		}
	},
	p8: {
		isMono: true,
		audioBuffers: [
 			{
		      id: 'hornA440',
		      url: '../asset/sound/hornA440.wav'
		    }
  		],
  		soundGeneratorSet: {
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
		}
	},
	p9: {
		isMono: false,
  		numVoices: 1,
  		soundGeneratorSet: {
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
		}
	},
	p10: {
		isMono: false,
  		numVoices: 1,
  		soundGeneratorSet: {
  			soundGenerators: [
      			{
		        	type:"sine"
		  		}
		  	]
		}
	},
	p10: {
		isMono: false,
  		numVoices: 1,
  		soundGeneratorSet: {
  			soundGenerators: [
      			{
		        	type:"sine"
		  		}
		  	]
		}
	},
	p11: {
		isMono: false,
  		numVoices: 5,
  		soundGeneratorSet: {
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
	}
}

 