
var Rxjs = require('rxjs');
var Oscillator = require('./oscillator');
var SamplePlayer = require('./samplePlayer');
var Effects = require("./effects");
var Utils = require("./utils");


module.exports.setupPlayer = Utils.setupPlayer;


const Voice = function(freq) {
	this.soundGenerators = [];
	this.freq = freq;
	this.key; // Note that's pressed, not musical key
	this.outputNode;
	this.setNoteValues = [];
}
Voice.prototype.setFrequency = function(freq) {
	this.soundGenerators.map(osc => osc.setFrequency(freq));
	this.freq = freq;
}
Voice.prototype.start = function(freq, key, startTime, volume, duration) {

	this.freq = freq;
	this.key = key;

	for (var effect of this.setNoteValues) {
		effect.setNoteValues(freq, key, startTime, volume, duration);
	}
	this.soundGenerators.map(osc => osc.start(freq, key, startTime, volume, duration));
}
Voice.prototype.stop = function(time, duration) {
	this.soundGenerators.map(osc => osc.stop(time, duration));
}
Voice.prototype.addSoundGenerator = function(osc) {
	this.soundGenerators.push(osc);
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
	this.audioBuffers = {};
	this.noteRecords = {}; // To keep track of duration
	this.lastDuration = Math.Infinity;
	this.voices = new Voices();
}

module.exports.Synth = Synth;

Synth.prototype.init = function(patch, callback) {

	this.patch = patch;
	this.tempo = patch.tempo ? patch.tempo : 120;

	this.loadAudioBuffers(() => {
		this.initVoices(callback);
	});

}
Synth.prototype.getNumVoices = function() {

	return this.patch.isMono ? 1 : this.patch.numVoices;
}
Synth.prototype.initVoices = function(callback) {

	for (var i = 0; i < this.getNumVoices(); i++) {
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
Synth.prototype.manuallySetAudioBuffers = function(audioBuffers) {

	this.audioBuffersSet = audioBuffers;
}
Synth.prototype.loadAudioBuffers = function(callback) {

	if (this.audioBuffersSet) {

		this.audioBuffers = this.audioBuffersSet;
		delete this.audioBuffersSet;
		callback();

	} else if (this.patch.audioBuffers == null) {

		callback();
	} else {

		Rxjs.Observable.from(this.patch.audioBuffers)
		.map(spec => {
			
			const call$ = Rxjs.Observable
			  .ajax({ url:spec.url, responseType:'arraybuffer'})
			  .map(result => {

			  	const audioContext = this.audioContext;
			  	const audioBuffers = this.audioBuffers;
			  	const chop = this.chopBuffer;
			  	
			  	return Rxjs.Observable.fromPromise(
			  		new Promise(
			  			function(resolve, reject) {

			  				audioContext.decodeAudioData(
					            result.response,
					            function(buffer) {
					            	
					            	audioBuffers[spec.id] = buffer;
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
		.subscribe(x => callback(), err => console.log(err));
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
	this.portamentoExecSubscription = Rxjs.Observable.interval(30)
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
	this.portamentoExecSubscription = Rxjs.Observable.interval(30)
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

	var output = gain;

	if (this.patch.soundGeneratorSet) {

		if (this.patch.soundGeneratorSet.soundGenerators) {
			for (var spec of this.patch.soundGeneratorSet.soundGenerators) {

				var soundGen;

				if (spec.type === "sample") {

					soundGen = new SamplePlayer(this.audioContext, this.audioBuffers ,spec);
				} else {

					soundGen = new Oscillator(this.audioContext, spec);
				}
				
				if (spec.effects) {

					spec.effects.map(effectSpec => {

						const effect = this.createEffect(effectSpec);

						if (effect != null) {
							soundGen.addEffect(effect);

							if (effect.setNoteValues != null) {
								soundGen.setNoteValues.push(effect);
							}
						}


					});
				}

				soundGen.outputNode.connect(gain);
				voice.addSoundGenerator(soundGen);
			}
		}
		
		if (this.patch.soundGeneratorSet.output) {
			for (var spec of this.patch.soundGeneratorSet.output) {
				
				const effect = this.createEffect(spec);

				if (effect != null) {
					output.connect(effect.inputNode);
					output = effect.outputNode;

					if (effect.setNoteValues != null) {
						voice.setNoteValues.push(effect);
					}
				}
			}
		}
	}

	voice.outputNode = output;
	return voice;
}
Synth.prototype.createEffect = function(spec) {

	var effect = this.createEffectInternal(spec);
	
	if (effect != null && spec.envelope) {
		const envelope = new Effects.Envelope(this.audioContext, effect, spec.envelope);
		effect = envelope;
	}

	if (effect != null && spec.frequencyLFO) {
		const fLFO = new Effects.FrequencyLFO(this.audioContext, spec.frequencyLFO, 
			this.getSongTempo(), effect);
		//effect = fLFO;
	}

	if (effect != null && spec.mixLFO != null && spec.mixLFO.width) {

		return new Effects.DualMixLfoMixed(this.audioContext, effect, spec.mixLFO);
	} else if (effect != null && spec.mixLFO != null) {

		return new Effects.DualMixLFO(this.audioContext, effect, spec.mixLFO);
	} else if (effect != null && spec.mix != null) {

		return new Effects.DualMixer(this.audioContext, effect, spec)
	} else {

		return effect;
	}
}
Synth.prototype.createEffectInternal = function(spec) {

	switch (spec.type) {

		case "biquadFilter":
			return new Effects.BiquadFilter(this.audioContext, spec);
		case "convolver":
			return new Effects.Convolver(this.audioContext, this.audioBuffers, spec);
		case "delay":
			return new Effects.Delay(this.audioContext, spec);
		case "amplitudeLFO":
			return new Effects.AmplitudeLFO(this.audioContext, spec, this.getSongTempo());
		case "distortion":
			return new Effects.Distortion(this.audioContext, spec);
		case "broken":
			return new Effects.Broken(this.audioContext, spec);

	}
}
Synth.prototype.getSongTempo = function() {

	return this.tempo;
}



