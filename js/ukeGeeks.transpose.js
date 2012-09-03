ukeGeeks.transpose = new function(){
	var re = /^([A-G][#b]?)(.*)/;
	var tones = {
		'A' : 0, 
		'A#' : 1, 'Bb' : 1,
		'B' : 2,
		'C' : 3,
		'C#' : 4, 'Db' : 4,
		'D' : 5,
		'D#' : 6, 'Eb' : 6,
		'E' : 7,
		'F' : 8,
		'F#' : 9, 'Gb' : 9,
		'G' : 10,
		'G#' : 11, 'Ab' : 11
	};

	/**
	 * Pass in a chord name returns new chord name for the original chord shifted by "steps" semitones.
	 * @method shift
	 * @param name (string) chord name, should be in chord dictionary
	 * @param steps (int) number of semitones to transpose
	 * @return {areinf}
	 */
	this.shift = function(name, steps){
		var t = getTone(name);
		if (t == null){
			return null;
		}
		var tone = t.tone + steps;
		if (tone > 11){
			tone = tone - 12;
		}
		// TODO: negative steps are allowed!!!
		for(var key in tones){
			if (tone == tones[key]){
				return key + t.suffix;
			}
		}
		return null;
	};
	
	/**
	 * 
	 * @method NAME
	 * @param NAME (TYPE) 
	 * @return {TYPE}
	 */
	var getTone = function(name){
		var m = name.match(re);
		if (m.length < 1){
			return null;
		}
		return {
			tone: parseInt(tones[m[1]]),
			prefix: m[1],
			suffix: m[2]
		};
	};


	/**
	 * DESCR
	 * @method NAME
	 * @param NAME (TYPE) 
	 * @return {TYPE}
	 */
	this.transpose = function(name, steps){
		if (steps == 0){
			return name;
		}
		return '';
	};
	
	/**
	 * Returns a mapping -- an array of JSON with "original" chord name and "transposed" chord names.
	 * @method retune
	 * @param offset (int) optional
	 * @return {array}
	 */
	this.retune = function(){
		var offset = (arguments.length > 0) ? arguments[0] : 0;
		var chords = ukeGeeks.definitions.getChords();
		var s = [];
		if (offset == 0){
			for(var i in chords){
				s.push({original: chords[i].name, transposed: chords[i].name});
			}
		}
		else{
			for(var i in chords){
				s.push({original: chords[i].name, transposed: ukeGeeks.transpose.shift(chords[i].name, offset)});
			}
		}
		return s;
	};
};