# browser-synth
Browser-based, Web Audio API-enabled synthesizer

## SoundGenerator Envelopes

All envelope parameters are optional.  All time values are in seconds.

#### Parameter descriptions:

threshold: Time value -- envelope will not be operative if note duration is less than threshold.

thresholdScaling: Time value -- all envelope time values (like attack) will be scaled down if duration is lower than this value.  If there is no threshold value present, then time values are scaled from full to 0 as duration approaches 0 -- otherwise, they are scaled from full to 0 as duration approaches threshold.

attack: Volume scales from 0 to full over this time value.

decay: Volume decays to decayLevel (or 0.75 if not present) over this time value.

release: Time value for note release.

#### Example

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

## Effects

### amplitudeLFO

#### Parameter descriptions:

shape: sine, square, triangle, sawtooth

frequency: Cycles per second.

syncWithSongTempo: Overrides frequency setting -- syncs with synth's tempo setting instead.

beatMultiplier: With syncWithSongTempo, mulitplies number of oscillations per beat.

width: 1.0 is full.

#### Example

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

### biquadFilter

#### Parameter descriptions:

See Web Audio API doc for details.

#### Example

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
