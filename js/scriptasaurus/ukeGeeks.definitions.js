/**
 * SINGLETON: Defines chords and provides simple lookup (find) tools.
 * @class definitions
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.definitions = new function(){
	/**
	 * Array of "user" defined chords, in compactChord format. Use "Add" method.
	 * @property _userChords
	 * @type array
	 * @private
	 */
	var _userChords = [];

	var _chords = [];
	
	var _instruments = [];
	
	var _offset = 0;
	var _map = [];

	/**
	 * Enum (simple JSON name/value pairs) defining instrument tunings (offsets from standard Soprano Ukulele)
	 * @property instrument
	 * @type JSON
	 */
	this.instrument = {
		sopranoUke: 0, // GCEA
		baritoneUke : 7 // DGBA
	};
	
	/* PUBLIC METHODS
	------------------------------------ */
	/**
	 * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
	 * @method addInstrument
	 * @param text {string} Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
	 * @return {void}
	 */
	this.addInstrument = function(text){
		_instruments.push(text);
	};

	/**
	 * Choose which instrument's chord dictionary you want used for the chord 
	 * diagrams. NOTE: .
	 * @method useInstrument
	 * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
	 * @return {void}
	 */
	this.useInstrument = function(offset){
		var offset = (arguments.length > 0) ? arguments[0] : this.instrument.sopranoUke;
		_offset = parseInt(offset);
		if (_offset > 0){
			_map = ukeGeeks.transpose.retune(_offset);
		}
		this.setChords(ukeGeeks.chordImport.runBlock(_instruments[0]).chords);
	};
	
	/**
	 * Returns expanded ChordObject for requested "chord"
	 * @method get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	this.get = function(chordName){
		// try User Defined chords first
		for (var i = 0; i < _userChords.length; i++){
			if (chordName == _userChords[i].name){
				return _userChords[i];
			}
		}
		// next: built-in chords:
		if (_offset < 1){
			return _get(chordName);
		}
		else{
			// user has retuned the chords, need to find chord name "as-is",
			// but get the fingering from the mapping
			for(var i in _map){
				if (chordName == _map[i].original){
					var x = _get(_map[i].transposed);
					if (x){
						var chrd = new ukeGeeks.data.expandedChord(chordName);
						chrd.dots = x.dots;
						return chrd;
					}
				}
			}
		}
		return null;
	};

	// local substitions (replacements for identical chord shapes)
	var _subs = {'A#' : 'Bb', 'Db' : 'C#', 'D#' : 'Eb', 'Gb' : 'F#', 'Ab' : 'G#'};
	/**
	 * todo:
	 * @private
	 * @method _get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	var _get = function(chordName){
		var n = chordName.substr(0,2);
		var s = _subs[n];
		if (s){
			var c = _get(s + chordName.substr(2));
			if (!c){
				return null;
			}
			var chrd = new ukeGeeks.data.expandedChord(chordName);
			chrd.dots = c.dots;
			return chrd;
		}
		for (var i = 0; i <_chords.length; i++){
			if (chordName == _chords[i].name){
				return _chords[i];
			}
		}
		return null;
	};
	
	/**
	 * @method add
	 * @param data {type} array of expanded chord objects
	 * @return {int}
	 */
	this.add = function(data){
		if (data.length){
			for (var i=0; i < data.length; i++){
				_userChords.push(data[i]);
			}
		}
		return _userChords.length;
	};

	/**
	 * @method replace
	 * @param data {type} array of expanded chord objects
	 * @return {int}
	 */
	this.replace = function(data){
		_userChords = [];
		return this.add(data);
	};

	/**
	 * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
	 * @method getChords
	 * @return {arrayChords}
	 */
	this.getChords = function(){
		return _chords;
	};
	
	this.setChords = function(value){
		_chords = value;
	};
	
};