var Rxjs = require('rxjs');

const notes = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const frequencyTable = { };
const notesTable = {};
const noteToNumber = {};

module.exports.frequencyTable = frequencyTable;
module.exports.notesTable = notesTable;
module.exports.noteToNumber = noteToNumber;


const baseFreq = 16.35;
const a = Math.pow(2, 1.0/12.0)

// Initialize frequenceyTable
var n = 0;
for (var range = 0; range < 9; range++) {
    for (var note = 0; note < 12; note++) {
        frequencyTable[n] = baseFreq * Math.pow(a, n);
        notesTable[n] = notes[note] + "" + range;
        noteToNumber[notesTable[n]] = n;
        n++;
    }
}

const kbMap1 = {

    "z":[0,0],
    "x":[1,0],
    "c":[2,0],
    "v":[3,0],
    "b":[4,0],
    "n":[5,0],
    "m":[6,0],
    ",":[7,0],
    ".":[8,0],
    "/":[9,0],

    "a":[3,0],
    "s":[4,0],
    "d":[5,0],
    "f":[6,0],
    "g":[7,0],
    "h":[8,0],
    "j":[9,0],
    "k":[10,0],
    "l":[11,0],
    ";":[0,1],
    "'":[1,1],

    "q":[6,0],
    "w":[7,0],
    "e":[8,0],
    "r":[9,0],
    "t":[10,0],
    "y":[11,0],
    "u":[0,1],
    "i":[1,1],
    "o":[2,1],
    "p":[3,1],
    "[":[4,1],
    "]":[5,1],

    "1":[9,0],
    "2":[10,0],
    "3":[11,0],
    "4":[0,1],
    "5":[1,1],
    "6":[2,1],
    "7":[3,1],
    "8":[4,1],
    "9":[5,1],
    "0":[6,1],
    "-":[7,1],
    "=":[8,1]
}

const kbMap2 = {

    "z":[3,0],
    "x":[5,0],
    "c":[7,0],
    "v":[9,0],
    "b":[11,0],
    "n":[1,1],
    "m":[3,1],
    ",":[5,1],
    ".":[7,1],
    "/":[9,1],

    "a":[2,0],
    "s":[4,0],
    "d":[6,0],
    "f":[8,0],
    "g":[10,0],
    "h":[0,1],
    "j":[2,1],
    "k":[4,1],
    "l":[6,1],
    ";":[8,1],
    "'":[10,1],

    "q":[1,0],
    "w":[3,0],
    "e":[5,0],
    "r":[7,0],
    "t":[9,0],
    "y":[11,0],
    "u":[1,1],
    "i":[3,1],
    "o":[5,1],
    "p":[7,1],
    "[":[9,1],
    "]":[11,1],

    "1":[0,0],
    "2":[2,0],
    "3":[4,0],
    "4":[6,0],
    "5":[8,0],
    "6":[10,0],
    "7":[0,1],
    "8":[2,1],
    "9":[4,1],
    "0":[6,1],
    "-":[8,1],
    "=":[10,1]

}

const kbMap = kbMap1;

function getKey(event) {

    if (event.key === undefined) {

        if (event.which == null) {
            return String.fromCharCode(event.keyCode).toLowerCase();    // old IE
        } else if (event.which != 0) {
            return String.fromCharCode(event.which).toLowerCase();

        } else {
            return "";
        }

    } else {
        return event.key;
    }
}

function DistinctCaller(synth) {

    this.synth = synth;
    this.lastEvent = "";
    this.lastKey = "";
    this.eventForKey = {};
}
DistinctCaller.prototype.handleEvent = function(event, key) {

    if ((event != this.lastEvent) || (key != this.lastKey)) {

        if (this.eventForKey[key] != event) {

            //console.log(`Native: distinct event ${event} ${key}`);

            const val = kbMap[key];
            if (val != null) {

                const noteNum = val[0] + (12 * (val[1] + 3));

                if (event === "keypress") {

                    synth.start(frequencyTable[noteNum], key, 0);

                } else if (event === "keyup") {

                    synth.stop(frequencyTable[noteNum], key, 0);
                }
            }
            this.lastEvent = event;
            this.lastKey = key;
            this.eventForKey[key] = event;
        }
    }
}

const setupPlayerManual = function (synth) {

    var distinctCaller = new DistinctCaller(synth);

    document.addEventListener("keypress", function(event) {

        const key = getKey(event);
        //console.log("Got key press: " + key);
        distinctCaller.handleEvent("keypress", key);
    });
    document.addEventListener("keyup", function(event) {

        const key = getKey(event);
        //console.log("Got keyup: " + key);
        distinctCaller.handleEvent("keyup", key);
    })
}


const setupPlayer = function (synth) {


    const keypres$ = Rxjs.Observable.fromEvent(document, "keypress");
    const keyup$ = Rxjs.Observable.fromEvent(document, "keyup");
    
    const master$ = keypres$.merge(keyup$)
    .groupBy(event => {

        if (event.key === undefined) {
            if (event.which == null)
                event.key = String.fromCharCode(event.keyCode).toLowerCase();    // old IE
            else if (event.which != 0)
                event.key = String.fromCharCode(event.which).toLowerCase();
        }

        return event.key;
    })
    .do(value$ => {

        value$
        .distinctUntilChanged((now, past) => now.type === past.type)
        .subscribe(event => {

           // console.log(`distinct event ${event.type} ${event.key}`);

            const val = kbMap[event.key];
            if (val != null) {

                const noteNum = val[0] + (12 * (val[1] + 3));

                if (event.type === "keypress") {

                    synth.start(frequencyTable[noteNum], event.key, 0);

                } else if (event.type === "keyup") {

                    synth.stop(frequencyTable[noteNum], event.key, 0);
                }
            }
        });
    })
    .subscribe({})

}

module.exports.setupPlayer = setupPlayer;


module.exports.getFrequencyFromCents = function(startFreq, cents) {


    return startFreq * Math.pow(2, cents/1200)
}


// Webaudio API's implementation is buggy and doesn't work on IE
module.exports.setValueCurveAtTime = function setValueCurveAtTime(param, values, startTime, duration, msg) {

    const divisor = duration * 20;
    var current = values[0];
    const diff = (values[1] - values[0]) / divisor;

    const timeDiff = duration / divisor;

    for (var i = 0; i <= divisor ; i++) {

    	//console.log("set " + current + " at " + startTime + " " + msg)
        param.setValueAtTime(current, startTime);
        current += diff;
        startTime += timeDiff;
    }
}

