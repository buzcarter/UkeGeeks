/**
 * Defines chords and provides simple lookup (find) tools.
 * @class definitions
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.definitions = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

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
	_public.instrument = {
		sopranoUke: 0, // GCEA
		baritoneUke: 5 // DGBA -- Baritone's "A" fingering is the Soprano's "D"
	};
	
	/* PUBLIC METHODS
	------------------------------------ */
	/**
	 * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
	 * @method addInstrument
	 * @param definitions {mixed} (Either string or array of strings) Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
	 * @return {void}
	 */
	_public.addInstrument = function(definitions) {
		if (typeof definitions === 'object') {
			// flatten the array
			definitions = definitions.join("\n");
		}
		_instruments.push(definitions);
	};

	/**
	 * Choose which instrument's chord dictionary you want used for the chord 
	 * diagrams. NOTE: .
	 * @method useInstrument
	 * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
	 * @return {void}
	 */
	_public.useInstrument = function(offset) {
		offset = (arguments.length > 0) ? offset : _public.instrument.sopranoUke;
		_offset = parseInt(offset, 10);
		if (_offset > 0){
			_map = ukeGeeks.transpose.retune(_offset);
		}
		_public.setChords(ukeGeeks.chordImport.runBlock(_instruments[0]).chords);
	};
	
	/**
	 * Returns expanded ChordObject for requested "chord"
	 * @method get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	_public.get = function(chordName) {
		var i, c, chrd, name;

		// try User Defined chords first
		for (i = 0; i < _userChords.length; i++) {
			if (chordName == _userChords[i].name){
				return _userChords[i];
			}
		}
		// next: built-in chords:
		if (_offset < 1){
			return _get(chordName);
		}

			// user has retuned the chords, need to find chord name "as-is",
			// but get the fingering from the mapping
		name = _getAlias(chordName);
		for (i in _map) {
			if (name == _map[i].original) {
				c = _get(_map[i].transposed);
				if (c) {
					chrd = new ukeGeeks.data.expandedChord(chordName);
					chrd.dots = c.dots;
					chrd.muted = c.muted;
						return chrd;
					}
				}
			}

		return null;
	};

	// local substitions (replacements for identical chord shapes)
	var _aliases = {
		'A#': 'Bb',
		'Db': 'C#',
		'D#': 'Eb',
		'Gb': 'F#',
		'Ab': 'G#'
	};

	/**
	 * A chord name normalizer: We don't store any chord definitions for A#, Db, D#, Gb, or Ab. Instead
	 * definitions of the more common notes are stored instead. So for the A# fingering we return the
	 * Bb fingering and so on.
	 *
	 * Returns original chord name if there is no defined alias.
	 *
	 * @method _getAlias
	 * @param  {string} chordName [
	 * @return {string}
	 */
	var _getAlias = function(chordName) {
		var n = chordName.substr(0, 2);
		return !_aliases[n] ? chordName : _aliases[n] + chordName.substr(2);
	};

	/**
	 * Pass in "standard" chord name, returns match from defined chords or null if not found
	 * @private
	 * @method _get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	var _get = function(chordName){
		var i, chrd,
			name = _getAlias(chordName);
		for (i = 0; i < _chords.length; i++) {
			if (name == _chords[i].name) {
				chrd = new ukeGeeks.data.expandedChord(chordName);
				chrd.dots = _chords[i].dots;
				chrd.muted = _chords[i].muted;
			return chrd;
		}
		}
		return null;
	};
	
	/**
	 * @method add
	 * @param data {array} array of expanded chord objects
	 * @return {int}
	 */
	_public.add = function(data) {
		if (data.length){
			for (var i=0; i < data.length; i++){
				_userChords.push(data[i]);
			}
		}
		return _userChords.length;
	};

	/**
	 * @method replace
	 * @param data {array} array of expanded chord objects
	 * @return {int}
	 */
	_public.replace = function(data) {
		_userChords = [];
		return _public.add(data);
	};

	/**
	 * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
	 * @method getChords
	 * @return {arrayChords}
	 */
	_public.getChords = function() {
		return _chords;
	};
	
	_public.setChords = function(value) {
		_chords = value;
	};
	
	return _public;
}());