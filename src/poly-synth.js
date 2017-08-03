
var rxjs = require('rxjs');

const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const frequencyTable = { };
const notesTable = {};
const noteToNumber = {};

module.exports.frequencyTable = frequencyTable;
module.exports.notesTable = notesTable;
module.exports.noteToNumber = noteToNumber;

module.exports.foo = ()=> { console.log("foo"); }

const baseFreq = 16.35;
const a = Math.pow(2, 1.0/12.0)

// Initialize frequenceyTable
var n = 0;
for (var range = 0; range < 9; range++) {
	for (var note = 0; note < 12; note++) {
		frequencyTable[n] = baseFreq * Math.pow(a, n);
		notesTable[n] = notes[note] + "" + range;
		noteToNumber[notesTable[n]] = n;
		n++;
	}
}

const kbMap1 = {

	"z":[0,0],
	"x":[1,0],
	"c":[2,0],
	"v":[3,0],
	"b":[4,0],
	"n":[5,0],
	"m":[6,0],
	",":[7,0],
	".":[8,0],
	"/":[9,0],

	"a":[3,0],
	"s":[4,0],
	"d":[5,0],
	"f":[6,0],
	"g":[7,0],
	"h":[8,0],
	"j":[9,0],
	"k":[10,0],
	"l":[11,0],
	";":[0,1],
	"'":[1,1],

	"q":[6,0],
	"w":[7,0],
	"e":[8,0],
	"r":[9,0],
	"t":[10,0],
	"y":[11,0],
	"u":[0,1],
	"i":[1,1],
	"o":[2,1],
	"p":[3,1],
	"[":[4,1],
	"]":[5,1],

	"1":[9,0],
	"2":[10,0],
	"3":[11,0],
	"4":[0,1],
	"5":[1,1],
	"6":[2,1],
	"7":[3,1],
	"8":[4,1],
	"9":[5,1],
	"0":[6,1],
	"-":[7,1],
	"=":[8,1]
}

const kbMap2 = {

	"z":[3,0],
	"x":[5,0],
	"c":[7,0],
	"v":[9,0],
	"b":[11,0],
	"n":[1,1],
	"m":[3,1],
	",":[5,1],
	".":[7,1],
	"/":[9,1],

	"a":[2,0],
	"s":[4,0],
	"d":[6,0],
	"f":[8,0],
	"g":[10,0],
	"h":[0,1],
	"j":[2,1],
	"k":[4,1],
	"l":[6,1],
	";":[8,1],
	"'":[10,1],

	"q":[1,0],
	"w":[3,0],
	"e":[5,0],
	"r":[7,0],
	"t":[9,0],
	"y":[11,0],
	"u":[1,1],
	"i":[3,1],
	"o":[5,1],
	"p":[7,1],
	"[":[9,1],
	"]":[11,1],

	"1":[0,0],
	"2":[2,0],
	"3":[4,0],
	"4":[6,0],
	"5":[8,0],
	"6":[10,0],
	"7":[0,1],
	"8":[2,1],
	"9":[4,1],
	"0":[6,1],
	"-":[8,1],
	"=":[10,1]

}

const kbMap = kbMap1;

const setupPlayer = function (synth) {


	const keypres$ = rxjs.Observable.fromEvent(document, "keypress");
	const keyup$ = rxjs.Observable.fromEvent(document, "keyup");
	
	const master$ = keypres$.merge(keyup$)
	.groupBy(event => {

		if (event.key === undefined) {
			if (event.which == null)
				event.key = String.fromCharCode(event.keyCode).toLowerCase();    // old IE
			else if (event.which != 0)
				event.key = String.fromCharCode(event.which).toLowerCase();
		}

		return event.key;
	})
	.do(value$ => {

		value$
		.distinctUntilChanged((now, past) => now.type === past.type)
		.subscribe(event => {

			const val = kbMap[event.key];
			if (val != null) {

				const noteNum = val[0] + (12 * (val[1] + 3));

				if (event.type === "keypress") {

					synth.start(frequencyTable[noteNum], event.key, 0);

				} else if (event.type === "keyup") {

					synth.stop(frequencyTable[noteNum], event.key, 0);
				}
			}
		});
	})
	.subscribe({})

}


module.exports.setupPlayer = setupPlayer;


// Webaudio API's implementation is buggy and doesn't work on IE
function setValueCurveAtTime(param, values, startTime, duration, msg) {

    const divisor = duration * 20;
    var current = values[0];
    const diff = (values[1] - values[0]) / divisor;

    const timeDiff = duration / divisor;

    for (var i = 0; i < divisor ; i++) {

    	//console.log("set " + current + " at " + startTime + " " + msg)
        param.setValueAtTime(current, startTime);
        current += diff;
        startTime += timeDiff;
    }
}


const InputEnvelope = function(audioContext) {

	this.envelopeGain = audioContext.createGain();
}
InputEnvelope.prototype.setGainValues = function(spec, startTime, duration) {

	var currentTime = startTime;

	if (spec.envelopeShelf && duration && (duration < spec.envelopeShelf)) {
		this.envelopeGain.gain.cancelScheduledValues(startTime);
		this.envelopeGain.gain.setValueAtTime(1.0, startTime);
		return;
	}

	var attackTime = spec.attack;
	if (spec.scaleAttack) {
		if (duration && duration < spec.scaleAttack) {
			attackTime = (duration/spec.scaleAttack) * spec.attack;
		}
	}

	if (spec.attack) {

		this.envelopeGain.gain.cancelScheduledValues(currentTime);
		setValueCurveAtTime(
			this.envelopeGain.gain,
			[0, 1.0], 
			currentTime, 
			attackTime
		);
		currentTime += attackTime;

	} else {
		this.envelopeGain.gain.cancelScheduledValues(startTime);
		this.envelopeGain.gain.setValueAtTime(1.0, startTime);
	}
	if (spec.decay) {
		this.envelopeGain.gain.cancelScheduledValues(currentTime);
		setValueCurveAtTime(
			this.envelopeGain.gain,
			[1.0, spec.decayLevel], 
			currentTime, 
			spec.decay
		);
		currentTime += spec.decay;
	}
	if (spec.sustainLevel) {
		this.envelopeGain.gain.cancelScheduledValues(currentTime);
		this.envelopeGain.gain.setValueAtTime(spec.sustainLevel, currentTime);
	}	
}
InputEnvelope.prototype.setStopValues = function(spec, stopTime, duration, osc, toStop) {


	if (spec.envelopeShelf && duration && (duration < spec.envelopeShelf)) {
		osc.stop(stopTime);
		toStop.map(osc => osc.stop(stopTime));
		return;
	}


	var releaseTime = spec.release;
	if (spec.scaleRelease) {
		if (duration && duration < spec.scaleRelease) {
			releaseTime = (duration/spec.scaleRelease) * spec.release;
		}
	}

	this.envelopeGain.gain.cancelScheduledValues(stopTime);
	setValueCurveAtTime(
		this.envelopeGain.gain,
		[this.envelopeGain.gain.value, spec.releaseLevel], 
		stopTime, 
		releaseTime
	);

	osc.stop(stopTime + spec.release);
	toStop.map(osc => osc.stop(stopTime + spec.release));

}


const getCents = function(f1, f2) {

	return 1200 * Math.log2(f2 / f1);
}
const getPlaybackRate = function(f1, f2) {

	return f2 / f1;
}

const SamplePlayer = function(audioContext, audioBuffers, spec) {

	this.audioContext = audioContext;
	this.spec = spec;
	this.audioBuffers = audioBuffers;

	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;
	this.osc = null;
	this.setNoteValues = [];

	if (this.spec.envelope) {

		this.inputEnvelope = new InputEnvelope(this.audioContext);
		this.envelopeGain = this.inputEnvelope.envelopeGain;
		this.envelopeGain.connect(this.outputNode);
	}
}
SamplePlayer.prototype.start = function(freq, key, startTime, volume, duration) {

	for (var effect of this.setNoteValues) {
		effect.setNoteValues(freq, key, startTime, volume, duration);
	}

	startTime = startTime === null ? this.audioContext.currentTime : this.audioContext.currentTime + startTime;

	this.osc = this.audioContext.createBufferSource();
	this.osc.buffer = this.audioBuffers[this.spec.src];
	//this.osc.detune.value = getCents(this.spec.baseFrequency, freq); // Detune doesn't work in Safari
	this.osc.playbackRate.value = getPlaybackRate(this.spec.baseFrequency, freq);
	this.osc.loop = true;
	if (this.spec.loopStart) {
		this.osc.loopStart = this.spec.loopStart;
	}
	if (this.spec.loopEnd) {
		this.osc.loopEnd = this.spec.loopEnd;

	}
	this.osc.start(startTime);
	
	this.freq = freq;

	this.toStop = [];

	if (this.inputEnvelope) {
		this.inputEnvelope.setGainValues(this.spec.envelope, startTime, duration);
		this.osc.connect(this.envelopeGain);
	} else {
		this.osc.connect(this.outputNode);
	}



	this.outputNode.gain.value = volume != null ? volume : 1.0;

	
}
SamplePlayer.prototype.setFrequency = function(freq) {

	//this.osc.detune.value = getCents(this.spec.baseFrequency, freq);
	this.osc.playbackRate.value = getPlaybackRate(this.spec.baseFrequency, freq);
}
SamplePlayer.prototype.stop = function(time, duration) {

	time = time === null ? this.audioContext.currentTime : this.audioContext.currentTime + time;

	if (this.spec.envelope != null && this.spec.envelope.release != null) {

		this.inputEnvelope.setStopValues(this.spec.envelope, time, duration, this.osc, this.toStop);

	} else {
		this.osc.stop(time);
		this.toStop.map(osc => osc.stop(time));
	}
}
SamplePlayer.prototype.addEffect = function(effect) {
	this.outputNode.connect(effect.inputNode);
	this.outputNode = effect.outputNode;
}



const Oscillator = function(audioContext, spec) {

	this.audioContext = audioContext;
	this.spec = spec;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;
	this.osc = null;
	this.setNoteValues = [];

	if (this.spec.envelope) {

		this.inputEnvelope = new InputEnvelope(this.audioContext);
		this.envelopeGain = this.inputEnvelope.envelopeGain;
		this.envelopeGain.connect(this.outputNode);
	}
}
Oscillator.prototype.start = function(freq, key, startTime, volume, duration) {

	for (var effect of this.setNoteValues) {
		effect.setNoteValues(freq, key, startTime, volume, duration);
	}

	startTime = startTime === null ? this.audioContext.currentTime : this.audioContext.currentTime + startTime;

	this.osc = this.audioContext.createOscillator();
	this.osc.type = this.spec.type ? this.spec.type : "sine";

	this.osc.frequency.value = this.spec.octave ? freq * this.spec.octave: freq;

	this.osc.start(startTime);
	this.freq = freq;

	this.toStop = [];

	if (this.inputEnvelope) {

		this.inputEnvelope.setGainValues(this.spec.envelope, startTime, duration);
		this.osc.connect(this.envelopeGain);
	} else {
		this.osc.connect(this.outputNode);
	}

	this.outputNode.gain.value = volume != null ? volume : 1.0;

	if (this.spec.frequencyLFO) {
		const freqLFO = new FrequencyLFO (this.audioContext, this.spec.frequencyLFO, 120, this.osc);
		this.toStop.concat(freqLFO.toStop);
	}

	
}
Oscillator.prototype.setFrequency = function(freq) {
	this.osc.frequency.value = this.spec.octave ? freq * this.spec.octave: freq;
	this.freq = freq;
}
Oscillator.prototype.stop = function(time, duration) {

	if (this.osc === null) return;

	time = time === null ? this.audioContext.currentTime : this.audioContext.currentTime + time;

	if (this.spec.envelope && this.spec.envelope.release != null) {

		this.inputEnvelope.setStopValues(this.spec.envelope, time, duration, this.osc, this.toStop);
	} else {
		this.osc.stop(time);
		this.toStop.map(osc => osc.stop(time));
	}
}
Oscillator.prototype.addEffect = function(effect) {
	this.outputNode.connect(effect.inputNode);
	this.outputNode = effect.outputNode;
}


const Voice = function(freq) {
	this.oscillators = [];
	this.freq = freq;
	this.key; // Note that's pressed, not musical key
	this.outputNode;
	this.setNoteValues = [];
}
Voice.prototype.setFrequency = function(freq) {
	this.oscillators.map(osc => osc.setFrequency(freq));
	this.freq = freq;
}
Voice.prototype.start = function(freq, key, startTime, volume, duration) {

	this.freq = freq;
	this.key = key;

	for (var effect of this.setNoteValues) {
		effect.setNoteValues(freq, key, startTime, volume, duration);
	}
	this.oscillators.map(osc => osc.start(freq, key, startTime, volume, duration));
}
Voice.prototype.stop = function(time, duration) {
	this.oscillators.map(osc => osc.stop(time, duration));
}
Voice.prototype.addOscillator = function(osc) {
	this.oscillators.push(osc);
}


const Voices = function() {
	this.voices = [];
}
Voices.prototype.addVoice = function(voice) {
	this.voices.push(voice);
}
Voices.prototype.getVoice = function() {
	const voice = this.voices.pop();
	this.voices.unshift(voice);
	return voice;
}

const Synth = function(audioContext) {

	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 0.75;
	this.audioContext = audioContext;
	this.downKeys = [];
	this.downFreqs = [];
	this.running = {};
	this.portamentoExecSubscription;
	this.impulseResponseBuffers = {};
	this.noteRecords = {}; // To keep track of duration
	this.lastDuration = Math.Infinity;
	this.voices = new Voices();
}
module.exports.Synth = Synth;
Synth.prototype.init = function(patch, callback) {

	this.patch = patch;
	this.tempo = patch.tempo ? patch.tempo : 120;

	this.loadImpulseResponseBuffers(() => {
		this.initVoices(callback);
	});

}
Synth.prototype.initVoices = function(callback) {

	for (var i = 0; i < this.patch.numVoices; i++) {
		const voice = this.createVoice();
		voice.outputNode.connect(this.outputNode);
		this.voices.addVoice(voice);
	}
	
	callback();
}
Synth.prototype.chopBuffer = function(buff) {

	const temps = [new Float32Array(buff.length), new Float32Array(buff.length)];
	const newTemps = [new Float32Array(buff.length), new Float32Array(buff.length)];

	var chan;
	for (chan = 0; chan < buff.numberOfChannels; chan++) {

		buff.copyFromChannel(temps[chan], chan)
		buff.copyFromChannel(newTemps[chan], chan)
	}

	for (var i = 0; i < 50; i++) {
		const size = Math.floor(Math.random() * buff.length / 5);
		const loc1 = Math.floor(Math.random() * buff.length);
		const loc2 = Math.floor(Math.random() * buff.length);
		for (var chan = 0; chan < buff.numberOfChannels; chan++) {
			var slice = temps[chan].slice(loc1, size)
			newTemps[chan].set(slice, loc2);
		}
	}
	for (chan = 0; chan < buff.numberOfChannels; chan++) {

		buff.copyToChannel(newTemps[chan], chan)
	}

	return buff;
}
Synth.prototype.loadImpulseResponseBuffers = function(callback) {

	if (this.patch.impulseResponseBuffers == null) {
		callback();
	} else {

		rxjs.Observable.from(this.patch.impulseResponseBuffers)
		.map(spec => {
			
			const call$ = rxjs.Observable
			  .ajax({ url:spec.url, responseType:'arraybuffer'})
			  .map(result => {

			  	const audioContext = this.audioContext;
			  	const impulseResponseBuffers = this.impulseResponseBuffers;
			  	const chop = this.chopBuffer;
			  	
			  	return rxjs.Observable.fromPromise(
			  		new Promise(
			  			function(resolve, reject) {

			  				audioContext.decodeAudioData(
					            result.response,
					            function(buffer) {
					            	
					            	impulseResponseBuffers[spec.id] = buffer;
					                resolve(true)
					            }    
					        );
			  			}
			  		)
			  	);
			  })	

			return call$;
		})
		.mergeAll()
		.concatAll()
		.last()
		.subscribe(x => callback(),
			err => console.log("FUD" + err));
	}
}
Synth.prototype.start = function(freq, key, startTime, volume) {

	if (this.patch.isMono) {
		
		if (this.downKeys.length > 0) {

			this.lastDuration = this.audioContext.currentTime - this.noteRecords["all"];
		}

		this.noteRecords["all"] = this.audioContext.currentTime;

	} else {
		this.noteRecords[key] = this.audioContext.currentTime;
	}

	if (this.patch.isMono) {
		this.startMono(freq, key, startTime, volume, this.lastDuration);
	} else {
		this.startPoly(freq, key, startTime, volume, this.lastDuration);
	}
}
Synth.prototype.applyRelativePortamento = function(voice, key, freq, noteStart) {

	const startFreq = voice.freq;
	const freqDiff = freq - voice.freq;
	const freqRatio = freq / voice.freq;

	const period = freqRatio * (this.patch.portamentoRelative / 2.0)

	const startTime = this.audioContext.currentTime + noteStart;
	if (this.portamentoExecSubscription) {
		if (!this.portamentoExecSubscription.closed) {
			this.portamentoExecSubscription.unsubscribe();
		}
	}
	this.portamentoExecSubscription = rxjs.Observable.interval(30)
	.subscribe(time => {

		if (this.audioContext.currentTime <= startTime) return;

		const elapsed = this.audioContext.currentTime - startTime;
		const frac = elapsed / period;

		if (frac < 1.0) {
			voice.setFrequency(startFreq + (frac * freqDiff));
			voice.key = key;
		} else {
			voice.setFrequency(freq);
			voice.key = key;
			this.running[key] = voice;
			this.portamentoExecSubscription.unsubscribe();
		}
	})
}
Synth.prototype.applyConstantPortamento = function(voice, key, freq, noteStart) {

	const startFreq = voice.freq;
	const freqDiff = freq - voice.freq;
	const startTime = this.audioContext.currentTime + noteStart;
	if (this.portamentoExecSubscription) {
		if (!this.portamentoExecSubscription.closed) {
			this.portamentoExecSubscription.unsubscribe();
		}
	}
	this.portamentoExecSubscription = rxjs.Observable.interval(30)
	.subscribe(time => {
		const elapsed = this.audioContext.currentTime - startTime;
		const frac = elapsed / this.patch.portamentoPeriod;

		if (frac < 1.0) {
			voice.setFrequency(startFreq + (frac * freqDiff));
			voice.key = key;
		} else {
			voice.setFrequency(freq);
			voice.key = key;
			this.running[key] = voice;
			this.portamentoExecSubscription.unsubscribe();
		}
	})
}
Synth.prototype.startMono = function(freq, key, startTime, volume, duration) {

	this.downKeys.push(key);
	this.downFreqs.push(freq);


	if (this.running["all"] == null) {


		this.startPoly(freq, "all", startTime, volume, duration)

	} else if ((this.patch.portamentoShelf != null) && (duration != null) && (duration < this.patch.portamentoShelf)) { 

		this.stopPoly(freq, "all", startTime, volume, duration)
		this.startPoly(freq, "all", startTime, volume, duration)

	} else {

		const voice = this.running["all"];


		if (this.patch.portamentoRelative) {
			// Scale the time the portamento takes based on distance
			this.applyRelativePortamento(voice, key, freq, startTime);

		} else if (this.patch.portamentoPeriod) { 

			// Use a constant time no matter the distance
			this.applyConstantPortamento(voice, key, freq, startTime);
		} else {
			this.running[key] = voice;
			voice.setFrequency(freq);
			voice.key = key;
		}
	}

}
Synth.prototype.startPoly = function(freq, key, startTime, volume, duration) {

	if (this.running[key] != null) {
		this.running[key].stop(startTime == null ? 0 : startTime);
		delete this.running[key];art

	}

	const voice = this.voices.getVoice();
	this.running[key] = voice;
	voice.start(freq, key, startTime, volume, duration);

}
Synth.prototype.stopAll = function(stopTime) {

	for (var key in this.running) {
		this.running[key].stop((stopTime === null) || (typeof(stopTime) === 'undefined') ? 0 : stopTime);
		delete this.running[key];
	}
}
Synth.prototype.stop = function(freq, key, stopTime) {


	if (this.patch.isMono) {
		this.stopMono(freq, key, stopTime, 1.0, this.lastDuration);

		if (this.noteRecords["all"]) {
			this.lastDuration = this.audioContext.currentTime - this.noteRecords["all"];
		}
	} else {
		this.stopPoly(freq, key, stopTime, 1.0, this.lastDuration);

		if (this.noteRecords[key]) {
			this.lastDuration = this.audioContext.currentTime - this.noteRecords[key];
		}
	}
	
	
	
}
Synth.prototype.stopPoly = function(freq, key, stopTime, volume, duration) {

	if (this.running[key] != null) {
		this.running[key].stop(stopTime == null ? 0 : stopTime, duration);
		delete this.running[key];
	}
}
Synth.prototype.stopMono = function(freq, key, stopTime, volume, duration) {

	if (this.downKeys.indexOf(key) != -1) {
		var index = this.downKeys.indexOf(key);
		this.downKeys.splice(index, 1);
		this.downFreqs.splice(index, 1);
	}

	if (this.downKeys.length > 0) {
		this.startMono(this.downFreqs.pop(), this.downKeys.pop(), stopTime, volume, duration);
	} else {
		this.stopPoly(freq, "all", stopTime, volume, duration);
	}
}

Synth.prototype.createVoice = function() {

	const gain = this.audioContext.createGain();
	gain.gain.value = 0.2;

	const voice = new Voice();


	for (var spec of this.patch.oscillatorSet.oscillators) {

		var osc;

		if (spec.type === "sample") {

			osc = new SamplePlayer(this.audioContext, this.impulseResponseBuffers ,spec);
		} else {

			osc = new Oscillator(this.audioContext, spec);
		}
		
		if (spec.effects) {

			spec.effects.map(effectSpec => {

				const effect = this.createEffect(effectSpec);

				if (effect != null) {
					osc.addEffect(effect);

					if (effect.setNoteValues != null) {
						osc.setNoteValues.push(effect);
					}
				}


			});
		}
		
		osc.outputNode.connect(gain);
		voice.addOscillator(osc);

	}

	var output = gain;

	for (var spec of this.patch.oscillatorSet.output) {
		
		const effect = this.createEffect(spec);

		if (effect != null) {
			output.connect(effect.inputNode);
			output = effect.outputNode;

			if (effect.setNoteValues != null) {
				voice.setNoteValues.push(effect);
			}
		}
	}

	voice.outputNode = output;
	return voice;
}
Synth.prototype.createEffect = function(spec) {

	var effect = this.createEffectInternal(spec);
	
	if (effect != null && spec.envelope) {
		const envelope = new Envelope(this.audioContext, effect, spec.envelope);
		effect = envelope;
	}

	if (effect != null && spec.frequencyLFO) {
		const fLFO = new FrequencyLFO(this.audioContext, spec.frequencyLFO, 
			this.getSongTempo(), effect);
		//effect = fLFO;
	}

	if (effect != null && spec.mixLFO != null && spec.mixLFO.width) {

		return new DualMixLfoMixed(this.audioContext, effect, spec.mixLFO);
	} else if (effect != null && spec.mixLFO != null) {

		return new DualMixLFO(this.audioContext, effect, spec.mixLFO);
	} else if (effect != null && spec.mix != null) {

		return new DualMixer(this.audioContext, effect, spec)
	} else {

		return effect;
	}
}
Synth.prototype.createEffectInternal = function(spec) {

	switch (spec.type) {

		case "biquadFilter":
			return new BiquadFilter(this.audioContext, spec);
		case "convolver":
			return new Convolver(this.audioContext, this.impulseResponseBuffers, spec);
		case "delay":
			return new Delay(this.audioContext, spec);
		case "amplitudeLFO":
			return new AmplitudeLFO(this.audioContext, spec, this.getSongTempo());
		case "distortion":
			return new Distortion(this.audioContext, spec);

	}
}
Synth.prototype.getSongTempo = function() {

	return this.tempo;
}

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};
const Distortion = function(audioContext, spec) {

	this.inputNode = audioContext.createWaveShaper();
	this.outputNode = this.inputNode;

	this.inputNode.curve = makeDistortionCurve(spec.amount);
	this.inputNode.oversample = spec.oversample ? spec.oversampe : 'none';
}

const AmplitudeLFO = function(audioContext, spec, tempo) {

	const width = typeof(spec.width) === "undefined" ? 0.5 : spec.width;

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 0.5 + (1.0 - width/2);

	const osc = audioContext.createOscillator();
	osc.type = spec.shape;

	if (spec.syncWithSongTempo) {
		osc.frequency.value = (tempo / 60) * (spec.beatMultiplier ? spec.beatMultiplier : 1.0);
	} else {
		osc.frequency.value = spec.frequency;
	}
	const oscGain = audioContext.createGain();
	oscGain.gain.value = width;
	osc.start(audioContext.currentTime);
	osc.connect(oscGain);
	oscGain.connect(this.inputNode.gain);

	
	this.outputNode = this.inputNode;
	this.toStop = [osc];
}

const FrequencyLFO = function(audioContext, spec, tempo, target) {

	const width = spec.width === null ? 5 : spec.width;

	const osc = audioContext.createOscillator();
	osc.type = spec.shape;

	if (spec.syncWithSongTempo) {
		osc.frequency.value = (tempo / 60) * (spec.beatMultiplier ? spec.beatMultiplier : 1.0);
	} else {
		osc.frequency.value = spec.frequency;
	}
	const oscGain = audioContext.createGain();
	oscGain.gain.value = width;
	osc.start(audioContext.currentTime);
	osc.connect(oscGain);

	oscGain.connect(target.frequency);

	
	this.toStop = [osc];
}

const Envelope = function(audioContext, effect, spec) {

	this.audioContext = audioContext;

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 1.0;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;


	this.dryGain = audioContext.createGain();
	this.wetGain = audioContext.createGain();

	this.inputNode.connect(effect.inputNode);
	this.inputNode.connect(this.dryGain);
	effect.outputNode.connect(this.wetGain);

	this.dryGain.connect(this.outputNode);
	this.wetGain.connect(this.outputNode);

	this.spec = spec;

}
Envelope.prototype.setNoteValues = function(freq, key, startTime, volume, duration) {

	var currentTime = this.audioContext.currentTime +  startTime;

	if (this.spec.attack) {

		this.wetGain.gain.cancelScheduledValues(currentTime);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		setValueCurveAtTime(
			this.wetGain.gain,
			[0, this.spec.attackLevel ? this.spec.attackLevel : 1.0], 
			currentTime, 
			this.spec.attack,
			"wet"
		);
		setValueCurveAtTime(
			this.dryGain.gain,
			[1.0, this.spec.attackLevel ? 1.0 - this.spec.attackLevel : 0], 
			currentTime, 
			this.spec.attack,
			"dry"
		);
		currentTime += this.spec.attack;

	} else {
		this.wetGain.gain.cancelScheduledValues(currentTime);
		this.wetGain.gain.setValueAtTime(1.0, currentTime);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		this.dryGain.gain.setValueAtTime(0, currentTime);
	}
	if (this.spec.decay) {
		this.wetGain.gain.cancelScheduledValues(currentTime);
		setValueCurveAtTime(
			this.wetGain.gain,
			[1.0, this.spec.decayLevel], 
			currentTime, 
			this.spec.decay
		);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		setValueCurveAtTime(
			this.dryGain.gain,
			[this.spec.decayLevel, 1.0], 
			currentTime, 
			this.spec.decay
		);
		currentTime += this.spec.decay;
	}
	if (this.spec.sustainLevel) {
		this.wetGain.gain.cancelScheduledValues(currentTime);
		this.wetGain.gain.setValueAtTime(this.spec.sustainLevel, currentTime);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		this.dryGain.gain.setValueAtTime(1 - this.spec.sustainLevel, currentTime);
	}
}

const DualMixLfoMixed = function(audioContext, effect, spec) {

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 1.0;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;

	const effectsGain = audioContext.createGain();
	const bypassGain = audioContext.createGain();
	effectsGain.gain.value = spec.width;
	bypassGain.gain.value = 1.0 - spec.width;

	const wet = audioContext.createGain();
	const dry = audioContext.createGain();

	this.inputNode.connect(effectsGain);
	this.inputNode.connect(bypassGain);

	effectsGain.connect(effect.inputNode);
	effectsGain.connect(dry);

	const osc = audioContext.createOscillator()
	osc.type = spec.type ? spec.type : "sine";
	osc.frequency.value = spec.frequency;
	const negGain = audioContext.createGain()

	if (spec.invert) {
		wet.gain.value = -1.0
		negGain.gain.value = 1.0
	} else {
		wet.gain.value = -1.0
		negGain.gain.value = 1.0
	}

	osc.connect(wet.gain)
	osc.connect(negGain)
	
	negGain.connect(dry.gain)
	
	osc.start(audioContext.currentTime);		


	effect.outputNode.connect(wet);
	wet.connect(this.outputNode);
	dry.connect(this.outputNode);
	bypassGain.connect(this.outputNode);
}

const DualMixLFO = function(audioContext, effect, spec) {

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 1.0;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;

	const wet = audioContext.createGain();
	const dry = audioContext.createGain();

	this.inputNode.connect(effect.inputNode);
	this.inputNode.connect(dry);


	const osc = audioContext.createOscillator()
	osc.type = spec.type ? spec.type : "sine";
	osc.frequency.value = spec.frequency;
	const negGain = audioContext.createGain()
	negGain.gain.value = -1;

	osc.connect(wet.gain)
	osc.connect(negGain)
	negGain.connect(dry.gain)
	
	
	osc.start(audioContext.currentTime);		


	effect.outputNode.connect(wet);
	wet.connect(this.outputNode);
	dry.connect(this.outputNode);
}

 
const DualMixer = function(audioContext, effect, spec) {

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 1.0;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;

	const wet = audioContext.createGain();
	const dry = audioContext.createGain();


	this.inputNode.connect(effect.inputNode);
	this.inputNode.connect(dry);

	wet.gain.value = spec.mix;
	dry.gain.value = 1 - spec.mix;


	effect.outputNode.connect(wet);
	wet.connect(this.outputNode);
	dry.connect(this.outputNode);
}

const Delay = function(audioContext, spec) {

	const delay = audioContext.createDelay(spec.delayTime);
	delay.delayTime.value = spec.delayTime;

	const inputGain = audioContext.createGain();
	const outputGain = audioContext.createGain();
	const delayGain = audioContext.createGain();
	delayGain.gain.value = spec.feedbackGain;
	inputGain.gain.value = 1.0;
	outputGain.gain.value = 1.0;
	inputGain.connect(delay)
	delay.connect(delayGain);
	delayGain.connect(outputGain);
	delayGain.connect(delay);
	inputGain.connect(outputGain);

	this.inputNode = inputGain;
	this.outputNode = outputGain;
}

const Convolver = function(audioContext, impulseResponseBuffers, spec) {

	this.convolver = audioContext.createConvolver();

	this.convolver.buffer = impulseResponseBuffers[spec.bufferId];
	if (spec.normalize) {
		this.convolver.normalize = true;
	}
	this.inputNode = this.convolver;
	this.outputNode = this.convolver;

}

const BiquadFilter = function(audioContext, spec) {

	this.filter = audioContext.createBiquadFilter();
	this.filter.type = spec.filterType;
	this.filter.frequency.value = spec.frequency;
	
	if (spec.qualityFactor) {
		this.filter.Q.value = spec.qualityFactor;
	}
	if (spec.detune) {
		this.filter.detune.value = spec.detune;
	}
	this.inputNode = this.filter;
	this.outputNode = this.filter;
	this.frequency = this.filter.frequency;
}






