const _chai = require('chai');
const _synth = require('../src/poly-synth');
const Oscillator = require('../src/oscillator');
const SamplePlayer = require('../src/samplePlayer');
require ('web-audio-mock');
const _patches = require('./patches');
const _utils = require('./utils');


describe('Synth node initialization', () => {

	var audioContext;

	before(function() {
		audioContext = new AudioContext();
	});


	describe('Instantiate multi-voiced synth', () => {

		it('Initializes a synth with eight voices.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p1, function() { 
	    		
	    		_chai.expect(synth.voices.voices.length).equal(8);
	    		done();
	    	});
	    	
		});

		it('Initializes a synth with an empty soundGeneratorSet.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p2, function() { 
	    		
	    		_chai.expect(synth.voices.voices.length).equal(8);
	    		done();
	    	});
	    	
		});

		it('Initializes a synth with one oscillator.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p3, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators.length).equal(1);
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);


	    		done();
	    	});
	    	
		});

		it('Initializes a synth with two oscillators.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p4, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators.length).equal(2);
	    		_chai.expect(voice.soundGenerators[1]).to.be.an.instanceof(Oscillator);


	    		done();
	    	});	    	
		});
	});

	describe('Instantiate mono synth', () => {

		it('Initializes a synth with only one voice.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p5, function() { 
	    		
	    		_chai.expect(synth.voices.voices.length).equal(1);
	    		done();
	    	});
	    	
		});


		it('Initializes a synth with an audio buffer.', (done) => {

	    	const audioBuffers = {};
	    	_utils.initAudioBuffers(
	    		audioContext,
	    		_patches.p6.audioBuffers,
		    	audioBuffers,
		    	() => { 
		    		let synth = new _synth.Synth(audioContext);
		    		synth.manuallySetAudioBuffers(audioBuffers);
		    		synth.init(_patches.p6, function() { 
	    		
	    				_chai.should().exist(synth.audioBuffers['hornA440']);
	    				done();
	    			});
		    	}
	    	);	    	
		});


		it('Initializes a synth with a sample player.', (done) => {

	    	const audioBuffers = {};
	    	_utils.initAudioBuffers(
	    		audioContext,
	    		_patches.p7.audioBuffers,
		    	audioBuffers,
		    	() => { 
		    		let synth = new _synth.Synth(audioContext);
		    		synth.manuallySetAudioBuffers(audioBuffers);
		    		synth.init(_patches.p7, function() { 
	    				let voice = synth.voices.voices[0];
	    				_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(SamplePlayer);
	    				done();
	    			});
		    	}
	    	);	    	
		});


		it('Initializes a synth with a sample player and an oscillator.', (done) => {

	    	const audioBuffers = {};
	    	_utils.initAudioBuffers(
	    		audioContext,
	    		_patches.p8.audioBuffers,
		    	audioBuffers,
		    	() => { 
		    		let synth = new _synth.Synth(audioContext);
		    		synth.manuallySetAudioBuffers(audioBuffers);
		    		synth.init(_patches.p8, function() { 
	    				let voice = synth.voices.voices[0];
	    				_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(SamplePlayer);
	    				_chai.expect(voice.soundGenerators[1]).to.be.an.instanceof(Oscillator);
	    				done();
	    			});
		    	}
	    	);	    	
		});


		it('Initializes a synth with a two oscillators, each set with a distinct volume.', (done) => {

	    	let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p9, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		let osc0 = voice.soundGenerators[0];
	    		let osc1 = voice.soundGenerators[1];
	    		_chai.expect(osc0.outputNode.gain.value).equal(0.9);
	    		_chai.expect(osc1.outputNode.gain.value).equal(0.1);

	    		done();
	    	});	    
		});
	});


	describe('Instantiate synth with a sound generator that has an associated envelope.', () => {

		it('Initializes a synth with an oscillator modified by an envelope.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.p10, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);

	    		done();
	    	});
	    	
		});
	});
});

