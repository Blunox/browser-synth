const _chai = require('chai');
const _synth = require('../src/poly-synth');
require ('web-audio-mock');
const _patches = require('./patches');

describe('Synth initialization', () => {

	var audioContext;

	before(function() {
		audioContext = new AudioContext();
	});

	describe('Instantiate synth', () => {

		it('Instantiates a synth object given an AudioContext.', () => {

			const synth = new _synth.Synth(audioContext);
			_chai.expect(synth).to.exist;
		});

	});

	describe('Initialize synth', () => {

		it('Initializes a synth object given an patch definition.', (done) => {

			const synth = new _synth.Synth(audioContext);

			synth.init(_patches.p1, function() { 
	    		
	    		done();
	    	});
		});

	});
});

