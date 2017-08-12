const _chai = require('chai');
const _synth = require('../src/poly-synth');
require ('web-audio-mock');
const _patches = require('./patches');
const _utils = require('../src/utils');

function startNotes(synth, numNotes) {

	for (var i = 0; i < numNotes; i++) {
		synth.start(_utils.frequencyTable[22], "key" + i, 0);
	}

}

function stopNotes(synth, numNotes) {

	for (var i = 0; i < numNotes; i++) {
		synth.stop(_utils.frequencyTable[22], "key" + i, 0);
	}

}

describe('Play notes on synth instances.', () => {

	var audioContext;

	before(function() {
		audioContext = new AudioContext();
	});

	describe('Play notes on mono synth', () => {

		it('Plays multiple notes on a mono synth.', () => {

			const synth = new _synth.Synth(audioContext);
			synth.init(_patches.monoSynth, function() { 
	    		
	    		
	    		_chai.expect(synth.voices.voices.length).equal(1);
	    		startNotes(synth, 4);
	    		const params = Object.getOwnPropertyNames(synth.running);
	    		_chai.expect(params.length).equal(1);
	    		_chai.expect(params[0]).equal("all");
	    	});
			
		});

	});


	describe('Play notes on a poly synth', () => {

		it('Plays 4 notes on an 8-voice poly synth.', () => {

			const synth = new _synth.Synth(audioContext);
			synth.init(_patches.polySynth, function() { 
	    		
	    		
	    		_chai.expect(synth.voices.voices.length).equal(8);
	    		startNotes(synth, 4);
	    		const params = Object.getOwnPropertyNames(synth.running);
	    		_chai.expect(params.length).equal(4);
	    	});
			
		});

		it('Plays 12 notes on an 8-voice poly synth.', () => {

			const synth = new _synth.Synth(audioContext);
			synth.init(_patches.polySynth, function() { 
	    		
	    		
	    		_chai.expect(synth.voices.voices.length).equal(8);
	    		startNotes(synth, 12);
	    		const params = Object.getOwnPropertyNames(synth.running);
	    		_chai.expect(params.length).equal(8);

	    		for (var i = 4; i < 12; i++) {
	    			_chai.expect(synth.running["key" + i]).to.exist;
	    		}

	    		_chai.expect(synth.running["key13"]).to.not.exist;

	    	});
			
		});

		it('Plays, then stops, 12 notes on an 8-voice poly synth.', () => {

			const synth = new _synth.Synth(audioContext);
			synth.init(_patches.polySynth, function() { 
	    		
	    		
	    		_chai.expect(synth.voices.voices.length).equal(8);
	    		startNotes(synth, 12);
	    		stopNotes(synth, 12);
	    		const params = Object.getOwnPropertyNames(synth.running);
	    		_chai.expect(params.length).equal(0);
	    	});
			
		});

	});


});

