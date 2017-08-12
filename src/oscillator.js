var Effects = require("./effects");
var Utils = require("./utils");

const Oscillator = function(audioContext, spec) {

	this.audioContext = audioContext;
	this.spec = spec;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = spec.volume? spec.volume : 1.0;
	this.targetNode = this.outputNode;
	this.osc = null;
	this.setNoteValues = [];

	if (this.spec.envelope) {

		this.inputEnvelope = new Effects.InputEnvelope(this.audioContext);
		this.envelopeGain = this.inputEnvelope.envelopeGain;
		this.envelopeGain.connect(this.targetNode);
	}
}

module.exports = Oscillator;

Oscillator.prototype.start = function(freq, key, startTime, volume, duration) {

	for (var effect of this.setNoteValues) {
		effect.setNoteValues(freq, key, startTime, volume, duration);
	}

	startTime = startTime === null ? this.audioContext.currentTime : this.audioContext.currentTime + startTime;

	this.osc = this.audioContext.createOscillator();
	this.osc.type = this.spec.type ? this.spec.type : "sine";

 	if (this.spec.detune) {

 		const myFreq = this.spec.octave ? freq * this.spec.octave: freq;
 		const freqAdj = Utils.getFrequencyFromCents(myFreq, this.spec.detune);

 		this.osc.frequency.value = freqAdj;//myFreq + freqAdj;
 	} else {
 		this.osc.frequency.value = this.spec.octave ? freq * this.spec.octave: freq;
 	}
	

	this.osc.start(startTime);
	this.freq = freq;

	this.toStop = [];

	if (this.inputEnvelope) {

		this.inputEnvelope.setGainValues(this.spec.envelope, startTime, duration);
		this.osc.connect(this.envelopeGain);
	} else {
		this.osc.connect(this.targetNode);
	}

	this.targetNode.gain.value = volume != null ? volume : 1.0;

	if (this.spec.frequencyLFO) {
		const freqLFO = new Effects.FrequencyLFO (this.audioContext, this.spec.frequencyLFO, 120, this.osc);
		this.toStop.concat(freqLFO.toStop);
	}

	
}
Oscillator.prototype.setFrequency = function(freq) {
	
	if (this.spec.detune) {

 		const myFreq = this.spec.octave ? freq * this.spec.octave: freq;
 		const freqAdj = Utils.getFrequencyFromCents(myFreq, this.spec.detune);

 		this.osc.frequency.value = freqAdj;
 	} else {
 		this.osc.frequency.value = this.spec.octave ? freq * this.spec.octave: freq;
 	}

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

