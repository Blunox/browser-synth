var diabolicalHorns = {
  isMono: true,
  portamentoRelative: 0.5,
  portamentoThreshold: 0.2,
  numVoices: 1,
  audioBuffers: [
    {
      id: 'hornA440',
      url: 'asset/sound/hornA440.wav',
      chop: true
    }
  ],
  soundGenerators: [
    {
      type:"sample",
      src:"hornA440",
      baseFrequency:184.98,
      loopStart: 0.147,
      loopEnd: 2.3,
      octave: 1,
      envelope: {
        threshold: 0.25,
        thresholdScaling: 0.5,
        attack: 0.3,
        release: 0.7
      },
      effects: [
        {
          type: "amplitudeLFO",
          shape: "square",
          frequency: 5.0,
          width: 0.815,
          syncWithSongTempo: true,
          beatMultiplier: 4,
          envelope: {
            attack: 3.5,      
            decay: 2.0,
            decayLevel:0
          }
        }
      ]
    }
  ],
  effects: [
    {
      type: "biquadFilter",
      filterType: "lowpass",
      frequency: 1099, // 0 to 22050
      qualityFactor: 0.5,
      mixLFO: {
        shape: "sine",
        frequency: 0.05
      }
    },
    {
      type:"delay",
      delayTime: 0.05,
      feedback: true,
      feedbackGain: 0.8
    }
  ]

}
