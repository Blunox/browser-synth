# browser-synth

browser-synth is a library that lets you instantiate synthesizer modules that run in a web browser.  Synthesizer modules are implemented using the [Web Audio API] (https://webaudio.github.io/web-audio-api/).

Synth module instantiation is driven by javascript configuration objects called _patch specifications_. See documentation (https://github.com/blunox/browser-synth/wiki/Documentation).

browser-synth allows you to wire together poly- or mono-synth modules consisting of:

* Oscillators
* Sample players
* Amplitude and frequency modulators
* BiquadFilters
* Delay units
* Distortion units
* Convolver units

browser-synth supports attack/delay/sustain/release envelopes on note playback and effects.  It also supports portamento on mono-synths.

## Usage

### Browser
```html
<script src="/lib/browser-synth.min.js"></script>
```

### Webpack project
```javascript
const BrowserSynth = require('browser-synth');
```

In Javascript:

```javascript
window.AudioContext = window.AudioContext||window.webkitAudioContext;
var audioContext = new AudioContext();

var synth = new BrowserSynth.Synth(audioContext);

// patchSpec is a javascript patch specification object
synth.init(patchSpec, function() {

    synth.outputNode.gain.value = 0.6;

    synth.outputNode.connect(audioContext.destination);
});

...

// Utility that sets up your synth to be playable 
// from computer keyboard for easy testing.
BrowserSynth.setupPlayer(synth);

...

/* 
 * To play a note -- browser-synth initializes a frequency table 
 * based on standard midi note numbers.
 * Params are:  
 *    1) frequency
 *    2) String identifier letting BS track what key has been been pressed.
 *       Can be any String as long as it's consistent in your application.
 *    3) Time -- this call schedules a note half-a-second from now.
 *    4) Volume -- this value will set a gain node associated with the note.
 *                 There is no official limit to the value you can set, but
 *                 for practical purposes, we consider 1.0 to be "full."        
 */
synth.start(BrowserSynth.frequencyTable[60], "c5", audioContext.currentTime + 0.5, 1.0);

/*
 * This call schedules a stop event for the same note one second from now.
 */
synth.stop(BrowserSynth.frequencyTable[60], "c5", audioContext.currentTime + 1.0);
```

## To build
```
>npm run-script build
```

## To test
```
>npm test
```