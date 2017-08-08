var warble = {

	isMono: true,
	numVoices: 1,
	portamentoRelative: 0.25,
	//portamentoShelf: 0.25,
	audioBuffers: [
		{
		  id: 'hallShort',
		  url: 'asset/sound/hallShort.wav'
		}
	],
	soundGeneratorSet: {
		soundGenerators: [
		  {
		    type:"sine",
		    octave: 2,
		    volume: 0.9,
		    envelope: {
		      attack: 0.5,
		      envelopeShelf: 0.25,
		      scaleAttack: 0.5,
		      release: 0.5,
		      scaleRelease: 0.5,
		      releaseLevel: 0.0
		    },
		    effects: []
		  },
		  {
		    type:"sine",
		    octave: 1,
		    envelope: {
		      envelopeShelf: 0.25,
		      attack: 0.5,
		      scaleAttack: 0.5,
		      release: 0.5,
		      scaleRelease: 0.5,
		      releaseLevel: 0.0
		    },
		    effects: [
		      {
		        type: "biquadFilter",
		        frequency: 1400,
		        filterType: "lowpass",
		        qualityFactor: 3
		      }
		    ]
		  }
		],
		output: [
		 {
		    type: "amplitudeLFO",
		    shape: "sine",
		    frequency: 5.0,
		    width: 0.815,
		    syncWithSongTempo: true,
		    beatMultiplier: 4,
		    envelopeXX: {
		      attack: 0.03, 
		      attackLevel: 1.0,      
		      //decay: 0.3,
		      //decayLevel:0,
		      //sustainLevel: 0.0
		    }
		  },
		  {
		    type:"distortion",
		    amount: 40,
		    mix: 0.3,
		    mixLFO: {
		      shape: "sine",
		      invert: true,
		      frequency: 0.05,
		      width: 0.99,
		    }
		  } 
		]
	}
}
