var Utils = require("./utils");

const InputEnvelope = function(audioContext) {

	this.envelopeGain = audioContext.createGain();
}

module.exports.InputEnvelope = InputEnvelope;

InputEnvelope.prototype.setGainValues = function(spec, startTime, duration) {

	var currentTime = startTime;

	if (spec.threshold && duration && (duration < spec.threshold)) {
		this.envelopeGain.gain.cancelScheduledValues(startTime);
		this.envelopeGain.gain.setValueAtTime(1.0, startTime);
		return;
	}

	var attackTime = spec.attack ? spec.attack : 0;
	if (spec.thresholdScaling) {
		if (duration && duration < spec.thresholdScaling) {
			if (spec.threshold) {
				attackTime = ((duration - spec.threshold)/spec.thresholdScaling) * spec.attack;
			} else {
				attackTime = (duration/spec.thresholdScaling) * spec.attack;
			}
		}
	}

	if (spec.attack) {

		this.envelopeGain.gain.cancelScheduledValues(currentTime);
		Utils.setValueCurveAtTime(
			this.envelopeGain.gain,
			[0, 1.0], 
			startTime, 
			attackTime
		);

	} else {
		this.envelopeGain.gain.cancelScheduledValues(startTime);
		this.envelopeGain.gain.setValueAtTime(1.0, startTime);
	}

	if (spec.decay) {

		var decayTime = spec.decay;
		if (spec.thresholdScaling) {
			if (duration && duration < spec.thresholdScaling) {

				if (spec.threshold) {

					decayTime = ((duration - spec.threshold)/spec.thresholdScaling) * spec.decay;
				} else {
					decayTime = (duration/spec.thresholdScaling) * spec.decay;
				}
			}
		}
		//console.log(`Setting decay: startTime: ${ startTime } duration: ${ duration } decayTime: ${ decayTime } `)


		Utils.setValueCurveAtTime(
			this.envelopeGain.gain,
			[1.0, spec.decayLevel ? spec.decayLevel : 0.75], 
			startTime + attackTime, 
			decayTime
		);
	}

}
InputEnvelope.prototype.setStopValues = function(spec, stopTime, duration, osc, toStop) {


	if (spec.threshold && duration && (duration < spec.threshold)) {
		osc.stop(stopTime);
		toStop.map(osc => osc.stop(stopTime));
		return;
	}


	var releaseTime = spec.release;
	if (spec.thresholdScaling) {
		if (duration && duration < spec.thresholdScaling) {

			if (spec.threshold) {
				releaseTime = ((duration - spec.threshold)/spec.thresholdScaling) * spec.release;
			} else {
				releaseTime = (duration/spec.thresholdScaling) * spec.release;
			}
		}
	}

	this.envelopeGain.gain.cancelScheduledValues(stopTime);
	Utils.setValueCurveAtTime(
		this.envelopeGain.gain,
		[this.envelopeGain.gain.value, 0], // was using spec.releaseLevel, but shouldn't we release to 0?
		stopTime, 
		releaseTime
	);

	osc.stop(stopTime + spec.release);
	toStop.map(osc => osc.stop(stopTime + spec.release));

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
	this.inputNode.oversample = spec.oversample ? spec.oversample : 'none';
}
module.exports.Distortion = Distortion;


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
module.exports.AmplitudeLFO = AmplitudeLFO;


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
module.exports.FrequencyLFO = FrequencyLFO;


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

module.exports.Envelope = Envelope;

Envelope.prototype.setNoteValues = function(freq, key, startTime, volume, duration) {

	var currentTime = this.audioContext.currentTime +  startTime;

	if (this.spec.attack) {

		this.wetGain.gain.cancelScheduledValues(currentTime);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		Utils.setValueCurveAtTime(
			this.wetGain.gain,
			[0, this.spec.attackLevel ? this.spec.attackLevel : 1.0], 
			currentTime, 
			this.spec.attack,
			"wet"
		);
		Utils.setValueCurveAtTime(
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
		Utils.setValueCurveAtTime(
			this.wetGain.gain,
			[1.0, this.spec.decayLevel], 
			currentTime, 
			this.spec.decay
		);
		this.dryGain.gain.cancelScheduledValues(currentTime);
		Utils.setValueCurveAtTime(
			this.dryGain.gain,
			[this.spec.decayLevel, 1.0], 
			currentTime, 
			this.spec.decay
		);
		currentTime += this.spec.decay;
	}
}

const DualMixLfoMixed = function(audioContext, effect, spec) {

	this.inputNode = audioContext.createGain();
	this.inputNode.gain.value = 1.0;
	this.outputNode = audioContext.createGain();
	this.outputNode.gain.value = 1.0;

	const effectsGain = audioContext.createGain();
	const bypassGain = audioContext.createGain();
	effectsGain.gain.value = spec.mix;
	bypassGain.gain.value = 1.0 - spec.mix;

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
module.exports.DualMixLfoMixed = DualMixLfoMixed;


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
module.exports.DualMixLFO = DualMixLFO;

 
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
module.exports.DualMixer = DualMixer;

const Broken = function(audioContext, spec) {

	this.id = "broken";
	console.log("You are in broken.")
	this.inputNode = audioContext.createGain();
	this.outputNode = audioContext.createGain();
}
module.exports.Broken = Broken;

const Delay = function(audioContext, spec, tempo) {

	const delay = audioContext.createDelay(spec.delayTime);

	if (spec.syncWithSongTempo) {
		delay.delayTime.value = (tempo / 60) * (spec.beatMultiplier ? spec.beatMultiplier : 1.0);
	} else {
		delay.delayTime.value = spec.delayTime;
	}
	

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
module.exports.Delay = Delay;


const Convolver = function(audioContext, audioBuffers, spec) {

	this.convolver = audioContext.createConvolver();

	this.convolver.buffer = audioBuffers[spec.bufferId];
	if (spec.normalize) {
		this.convolver.normalize = true;
	}
	this.inputNode = this.convolver;
	this.outputNode = this.convolver;

}
module.exports.Convolver = Convolver;


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

module.exports.BiquadFilter = BiquadFilter;


