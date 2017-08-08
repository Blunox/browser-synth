const _fs = require('fs');
const _url = require('url');
const _path = require('path');


function loadFile(spec, audioContext, audioBuffers) {

	const resolved = _path.resolve(__dirname, spec.url);

	var p = new Promise((resolve, reject) => {

			_fs.readFile(resolved, function (err, data) {
			resolve(data)
		});
	}).then((data) => {
		
		return new Promise((resolve, reject) => {

  			audioContext.decodeAudioData(
				toArrayBuffer(data),
				function(buffer) {

					audioBuffers[spec.id] = buffer;
					resolve();
				}    
			)
		});
	});

	return p;
}



const initAudioBuffers = function(audioContext, specList, audioBuffers, callback) {


	var promises = [];

	for (var spec of specList) {
		
		promises.push(loadFile(spec, audioContext, audioBuffers));
	}

	Promise.all(promises).then(()=> { callback() });
}

module.exports.initAudioBuffers = initAudioBuffers;

function toArrayBuffer(buf) {

    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}