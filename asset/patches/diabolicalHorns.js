diabolicalHorns = {
  isMono: true,
  portamentoRelative: 0.25,
  numVoices: 1,
  impulseResponseBuffers: [

    {
      id: 'hornA440',
      url: 'asset/sound/hornA440.wav',
      chop: true
    }
  ],
  oscillatorSet: {
    oscillators: [
      {
        type:"sample",
        src:"hornA440",
        baseFrequency:184.98,
        loopStart: 0.147,
        loopEnd: 2.3,
        octave: 1,
        envelope: {
          attack: 0.3,
          release: 0.7,
          releaseLevel: 0.0
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
              attackLevel: 1.0,      
              decay: 2.0,
              decayLevel:0,
              sustainLevel: 0.0
            }
          }
        ]
      }
    ],
    output: [
      {
        type: "biquadFilter",
        filterType: "lowpass",
        frequency: 1099, // 0 to 22050
        qualityFactor: 0.5,
        mixLFO: {
          shape: "sine",
          frequency: 0.05,
          //width: 0.99,
        }
      },
      {
        type:"delay",
        delayTime: 0.05,
        feedback: true,
        feedbackGain: 0.8,
        mix: 0.8
      }]
  }

}