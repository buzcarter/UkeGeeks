/**
 * Draws large chord diagram grid (aka "reference" diagrams) on canvas
 * @class chordPainter
 * @namespace ukeGeeks
 */
ukeGeeks.chordPainter = function(){

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * ukeGeeks.canvas object handle
	 * @property _brush
	 * @type ukeGeeks.chordBrush instance handle
	 * @private
	 */
	var _brush = null;

	/**
	 * keep an array of missing chords (strings)
	 * @property _errors
	 * @type array
	 * @private
	 */
	var _errors = [];

	var _handles = null;

	/**
	 * If ignoreCommonChords option is true then this will contain list of
	 * matched chords: ones defined in the ignore list that were also found in the song
	 * @property _ignoreMatchList
	 * @type {Array}
	 * @private
	 */
	var _ignoreMatchList = [];

		/**
	 * Ignore "tacet" or "no chord" chords
	 * @property _tacet
	 * @type {RegExp}
	 * @private
	 */
	var _tacet = /^(n.?\/?c.?|tacet)$/i;

	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @param htmlHandles {ukeGeeks.data.htmlHandles} DOM Element object
	 * @return {void}
	 */
	_public.init = function(htmlHandles) {
		_brush = new ukeGeeks.chordBrush();
		_brush.init();
		_handles = htmlHandles;
	};

	/**
		 * Checks whether speicified chord (name) is on the ignore list.
	 * @method ignoreChord
		 * @param  {string} chord Chord name
		 * @return {boolean}	return TRUE if "chord" is on ignore list.
		 */
	var ignoreChord = function(chord){
		for (var i = 0; i < ukeGeeks.settings.commonChords.length; i++) {
			if (chord == ukeGeeks.settings.commonChords[i]){
				return true;
			}
		}
		return false;
	};

	/**
	 * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
	 * @method show
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	_public.show = function(chords) {
		_handles.diagrams.innerHTML = '';
		_errors = [];
		_ignoreMatchList = [];

		if (ukeGeeks.settings.opts.sortAlphabetical) {
		chords.sort();
		}

		for (var i=0; i < chords.length; i++){
			if (_tacet.test(chords[i])) {
				continue;
			}
			if (ukeGeeks.settings.opts.ignoreCommonChords && ignoreChord(chords[i])){
				if ((typeof Array.prototype.indexOf === 'function') && (_ignoreMatchList.indexOf(chords[i]) == -1)) {
				_ignoreMatchList.push(chords[i]);
				}
				continue;
			}
			var chord = ukeGeeks.definitions.get(chords[i]);
			if (!chord) {
				_errors.push(chords[i]);
				continue;
			}
			_brush.plot(_handles.diagrams, chord, ukeGeeks.settings.fretBox);
		}

		if (_ignoreMatchList.length > 0) {
			var para = document.createElement('p');
			para.className = 'ugsIgnoredChords';
			para.innerHTML = 'Also uses: ' + _ignoreMatchList.sort().join(', ');
			_handles.diagrams.appendChild(para);
		}
	};

	/**
	 * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;.
	 * When found adds canvas element and draws chord named in data-chordName attribute
	 * @method showInline
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	_public.showInline = function(chords) {
		var e = _handles.text.getElementsByTagName('code');
		if (e.length < 1) {
			return;
		}
		for (var i=0; i < chords.length; i++){
			var chord = ukeGeeks.definitions.get(chords[i]);
			if (!chord) {
				/* TODO: error reporting if not found */
				// _errors.push(chords[i]);
				continue;
			}
			for (var j=0; j < e.length; j++){
				if (e[j].getAttribute('data-chordName') == chord.name) {
					_brush.plot(e[j], chord, ukeGeeks.settings.inlineFretBox, ukeGeeks.settings.inlineFretBox.fonts);
				}
			}
		}
	};

	/**
	 * returns array of unknown chords
	 * @method getErrors
	 * @return {array}
	 */
	_public.getErrors = function() {
		return _errors;
	};

	/**
	 * List of chords excluded from the master chord diagrams
	 * @method getIgnoredChords
	 * @return {array} array of strings
	 */
	_public.getIgnoredChords = function() {
		return _ignoreMatchList;
	};

	/* return our public interface
	 */
	return _public;
};