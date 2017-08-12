var warble = {

	isMono: true,
	numVoices: 1,
	portamentoRelative: 0.5,
	portamentoPeriod: 0.35,
	//portamentoThreshold: 0.2,
	soundGenerators: [
	  {
	    type:"sine",
	    octave: 2,
	    //volume: 0.9,
	    detune: 6,
	    envelope: {
	      threshold: 0.25,
	      thresholdScaling: 0.5,
	      attack: 0.5,
	      release: 0.5
	    },
	    effects: []
	  },
	  {
	    type:"sine",
	    octave: 1,
	    envelope: {
	      threshold: 0.25,
	      thresholdScaling: 0.5,
	      attack: 0.5,
	      release: 0.5
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
	effects: [
	 {
	    type: "amplitudeLFO",
	    shape: "sine",
	    frequency: 5.0,
	    width: 0.815,
	    syncWithSongTempo: true,
	    beatMultiplier: 4,
	    envelope: {
	      attack: 0.6,
	    }
	  },
	  {
	    type:"distortion",
	    amount: 40,
	    mix: 0.3,
	    mixLFO: {
	      shape: "sine",
	      invert: true,
	      frequency: 0.05
	    }
	  } 
	]
}
