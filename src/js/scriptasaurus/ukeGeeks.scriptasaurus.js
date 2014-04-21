/**
 * Finds page HTML elements & creates ukeGeek objects;
 * Reads song text, parses, draws choard diagrams.
 *
 * @class scriptasaurus
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.scriptasaurus = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Preps this class for running
	 * @method init
	 * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
	 * @return {void}
	 */
	_public.init = function(isIeFamily) {
		var defs = ukeGeeks.definitions;

		ukeGeeks.settings.environment.isIe = isIeFamily;
		// TODO: known problem -- need to preload Sorprano chord libarary then we can retune if needed
		defs.addInstrument(defs.sopranoUkuleleGcea);
		defs.useInstrument(defs.instrument.sopranoUke);
		if (ukeGeeks.settings.defaultInstrument != defs.instrument.sopranoUke) {
			defs.useInstrument(ukeGeeks.settings.defaultInstrument);
		}
	};

	/**
	 * Runs all Scriptasaurus methods using the element Ids defined in the settings class.
	 * This is your "Do All". See data.song for structure.
	 * @method run
	 * @return {songObject}
	 */
	_public.run = function() {
		//console.log('run (Classic Mode)');
		var handles = _getHandlesFromId();
		if (!handles || !handles.diagrams || !handles.text || !handles.wrap) {
			return null;
		}
		_errList = [];
		var song = _runSong(handles);
		showErrors(_errList[0]);
		return song;
	};

	/**
	 * Same as "run" except runs using class names, this allows you to have multiple songs on a single page.
	 * @method runByClasses
	 * @return {Array of songObject}
	 */
	_public.runByClasses = function() {
		var songs = [];
		var songWraps = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.wrap);
		for(var i = 0; i < songWraps.length; i++){
			var handles = _getHandlesFromClass(songWraps[i]);
			if (handles === null) {
				continue;
			}
			songs.push(_runSong(handles));
		}
		return songs;
	};

	/**
	 * Is this really nececessary?
	 * @method setTuningOffset
	 * @param offset {int} (optional) default 0. Number of semitones to shift the tuning. See ukeGeeks.definitions.instrument.
	 */
	_public.setTuningOffset = function(offset) {
		ukeGeeks.definitions.useInstrument(offset);
	};

	var _errList = [];
	// song

	/**
	 *
	 * @method _runSong
	 * @private
	 * @param handles {ukeGeeks.data.htmlHandles}
	 * @return {songObj}
	 */
	var _runSong = function(handles){
		// console.log('run Song');

		// read Music, find chords, generate HTML version of song:
		var cpm = new ukeGeeks.cpmParser();
		cpm.init();
		var song = cpm.parse(handles.text.innerHTML);
		ukeGeeks.definitions.replace(song.defs);

		var chrdPrsr = new ukeGeeks.chordParser();
		chrdPrsr.init();
		handles.text.innerHTML = chrdPrsr.parse(song.body);
		song.chords = chrdPrsr.getChords();

		// Draw the Chord Diagrams:
		var painter = new ukeGeeks.chordPainter();
		painter.init(handles);
		painter.show(song.chords);
		// Show chord diagrams inline with lyrics
		if (ukeGeeks.settings.inlineDiagrams){
			ukeGeeks.toolsLite.addClass(handles.wrap, 'ugsInlineDiagrams');
			painter.showInline(song.chords);
		}

		// Do Tablature:
		var tabs = new ukeGeeks.tabs();
		tabs.init();
		tabs.replace(handles.text);

		// error reporting:
		_errList.push(painter.getErrors());

		var container = handles.wrap;
		if (container){
			ukeGeeks.toolsLite.setClass(container, 'ugsNoChords', !song.hasChords);
		}

		if (ukeGeeks.settings.opts.autoFixOverlaps){
			ukeGeeks.overlapFixer.Fix(handles.text);
		}

		// done!
		return song;
	};

	/**
	 * Shows a JavaScript alert box containing list of unknown chords.
	 * @method showErrors
	 * @return {void}
	 */
	var showErrors = function(errs){
		if (errs.length < 1) {
			return;
		}

		//console.log(typeof(errs[0]));
		var s = '';
		for(var i = 0; i < errs.length; i++){
			s += (s.length > 0) ? ', ' : '';
			s += errs[i];
		}
		alert('Forgive me, but I don\'t know the following chords: ' + s);
	};

	/**
	 *
	 * @method _getHandlesFromClass
	 * @private
	 * @param wrap {domElement}
	 * @return {ukeGeeks.data.htmlHandles}
	 */
	var _getHandlesFromClass = function(wrap){
		var diagrams = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.diagrams, wrap);
		var text = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.text, wrap);
		if ((diagrams === undefined) || (diagrams.length < 1) || (text === undefined) || (text.length < 1)) {
			return null;
		}
		return new ukeGeeks.data.htmlHandles(wrap, diagrams[0], text[0]);
	};

	/**
	 *
	 * @method _getHandlesFromId
	 * @private
	 * @return {ukeGeeks.data.htmlHandles}
	 */
	var _getHandlesFromId = function(){
		return new ukeGeeks.data.htmlHandles(
			document.getElementById(ukeGeeks.settings.ids.container),
			document.getElementById(ukeGeeks.settings.ids.canvas),
			document.getElementById(ukeGeeks.settings.ids.songText)
		);
	};

	return _public;
}());