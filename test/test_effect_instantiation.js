const _chai = require('chai');
const _synth = require('../src/poly-synth');
const Oscillator = require('../src/oscillator');
const SamplePlayer = require('../src/samplePlayer');
require ('web-audio-mock');
const _patches = require('./patches');
const _utils = require('./utils');

/**
 * Note -- these tests just instantiate effects -- 
 */
describe('Synth effect instantiation', () => {

	var audioContext;

	before(function() {
		audioContext = new AudioContext();
	});


	describe('Instantiate oscillators with effects', () => {

		it('Initializes a synth with an oscillator with an amplitudeLFO effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p11, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		done();
	    	});
	    	
		});


		it('Initializes a synth with an oscillator with a biquadFilter effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.biquadFilterTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		done();
	    	});
	    	
		});
	});


});

