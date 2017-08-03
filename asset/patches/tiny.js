
var tiny = {

  isMono: false,
  numVoices: 8,
  portamentoPeriod: 0.25,
  portamentoRelative: 0.25,
  oscillatorSet: {
    oscillators: [
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
        frequencyLFOXXX: {
          shape: "square",
          frequency: 8.0,
          width: 20,
          syncWithSongTempo: true,
          beatMultiplier: 4
        },
        effects: []
      },
      {
        type:"triangle",
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

    ]
  }

}

