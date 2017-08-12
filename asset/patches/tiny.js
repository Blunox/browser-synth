var tiny = {

  isMono: false,
  numVoices: 8,

  soundGenerators: [
    {
      type:"sine",
      octave: 3,
      detune: 5,
      envelope: {
        threshold: 0.25,
        thresholdScaling: 0.5,
        attack: 0.5,
        release: 0.5
      }
    },
    {
      type:"triangle",
      octave: 2,

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
  ]
}

