var Effects = require("./effects");

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
	this.outputNode.gain.value = spec.volume ? spec.volume : 1.0;
	this.targetNode = this.outputNode;

	this.osc = null;
	this.setNoteValues = [];

	if (this.spec.envelope) {

		this.inputEnvelope = new Effects.InputEnvelope(audioContext);
		this.envelopeGain = this.inputEnvelope.envelopeGain;
		this.envelopeGain.connect(this.targetNode);
	}
}

module.exports = SamplePlayer;

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
		this.osc.connect(this.targetNode);
	}



	this.targetNode.gain.value = volume != null ? volume : 1.0;

	
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