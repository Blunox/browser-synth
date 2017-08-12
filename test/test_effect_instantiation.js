const _chai = require('chai');
const _synth = require('../src/poly-synth');
const Oscillator = require('../src/oscillator');
const SamplePlayer = require('../src/samplePlayer');
require ('web-audio-mock');
const _patches = require('./patches');
const _utils = require('../src/utils');
const _testUtils = require('./utils');

function playAFewNotes(synth, callback) {

	synth.start(_utils.frequencyTable[22], "key1", 0);
	synth.start(_utils.frequencyTable[23], "key2", 0);
	synth.start(_utils.frequencyTable[24], "key3", 0);
	synth.start(_utils.frequencyTable[25], "key4", 0);

	synth.stop(_utils.frequencyTable[22], "key1", 0.01);
	synth.stop(_utils.frequencyTable[23], "key2", 0.01);
	synth.stop(_utils.frequencyTable[24], "key3", 0.01);
	synth.stop(_utils.frequencyTable[25], "key4", 0.01);

	setTimeout(()=> {
    	callback();
	}, 12);
}


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

	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth with an oscillator with a biquadFilter effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.biquadFilterTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);

	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth with an oscillator with a delay effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.delayTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth with an oscillator with a convolver effect applied.', (done) => {

			const audioBuffers = {};
	    	_testUtils.initAudioBuffers(
	    		audioContext,
	    		_patches.convolverTest.audioBuffers,
		    	audioBuffers,
		    	() => { 

	    			let synth = new _synth.Synth(audioContext);
	    			synth.manuallySetAudioBuffers(audioBuffers);
					synth.init(_patches.convolverTest, function() { 
			    		
			    		let voice = synth.voices.voices[0];
			    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
			    		
			    		playAFewNotes(synth, ()=>{ done(); });
			    	});
		    	}
	    	);	        	
		});


		it('Initializes a synth with an oscillator with a distortion effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.distortionTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth with an oscillator with a frequencyLFO effect applied.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.frequencyLFOTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth that has an envelope applied to an effect.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.effectEnvelopeTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});

		it('Initializes a synth that has a dry mix applied to an effect.', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.effectDryMixTest, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth where LFO drives effect (with no dry mix).', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.effectMixLfoTestV1, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});


		it('Initializes a synth where LFO drives effect (with dry mix).', (done) => {

			let synth = new _synth.Synth(audioContext);

			synth.init(_patches.effectMixLfoTestV2, function() { 
	    		
	    		let voice = synth.voices.voices[0];
	    		_chai.expect(voice.soundGenerators[0]).to.be.an.instanceof(Oscillator);
	    		
	    		playAFewNotes(synth, ()=>{ done(); });
	    	});
	    	
		});
	});


});

