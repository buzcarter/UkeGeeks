/**
 * Does the work by providing "doAction" method to respond to events (does not
 * attach event handlers); Modifes some page elements -- adjust CSS classes on page,
 * runs Scriptasaurus, etc.
 * @class actions
 * @namespace ugsEditorPlus
 * @module ugsEditorPlus
 */
ugsEditorPlus.actions = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
	 * @property _ele
	 * @private
	 * @type {JSON}
	 */
	var _ele = {};

	// misc
	var _song = null;
	//
	var _originalSource = null;
	var _originalChords = [];

	var _regEx = {
		safe: /^([A-G][#b]?)(m|m6|7|m7|dim|maj7|6|sus2|sus4|aug|9)?$/
	};

	/**
	 * associative array/JSON of last click value used; intended to be used to prevent
	 * rerunning more expensize operations unnecessailry (when the value didn't actually change)
	 * @property _prevValues
	 * @type {JSON}
	 */
	var _prevValues = {
		'placement' : 'above',
		'transpose' : 'up_0'
	};

	/**
	 * Sets up this class; modifies form elements; attaches event handlers, etc
	 * @method init
	 * @public
	 */
	_public.init = function() {
		_ele = {
			songText : document.getElementById('ukeSongText'),
			songContainer : document.getElementById('ukeSongContainer'),
			cpmSource : document.getElementById('chordProSource'),
			scalableArea : document.getElementById('scalablePrintArea')
		};

		$(document).on('option:click', function(e, data) {
			doAction(data.action, data.value);
		});

		syncOptions(ugsEditorPlus.options);
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Common "All Powerful" Helper Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Executes the requested Action using passed in Value
	 * @method doAction
	 * @private
	 * @param action {string} Action's name; must match one of those defined in the switch below
	 * @param value {string} Value used by Action (OK, a couple methods assume this is boolean/falsy)
	 */
	var doAction = function(action, value) {
		// actions that modify song's HTML or reference diagrams require rerunning Scriptasaurus
		var runRequired = false;

		switch (action){
			case 'zoomFonts':
				doSetFontSize(value);
				break;
			case 'zoomDiagrams':
				doSetDiagramSize(value);
				break;
			case 'layout':
				doLayout(value);
				break;
			case 'placement':
				runRequired = doPlacement(value);
				break;
			case 'tuning':
				doTuning(value);
				runRequired = true;
				break;
			case 'colors':
				doSetTheme(value);
				runRequired = true;
				break;
			case 'transpose':
				doTranspose(value);
				break;
			case 'paper':
				doSetPageWidth(value);
				break;
			case 'showEnclosures':
				setEnclosureVisible(value);
				runRequired = true;
				break;
			case 'hideCommonChords':
				setIgnoreCommon(value);
				runRequired = true;
				break;
			case 'sortAlphabetical':
				setSortAlphabetical(value);
				runRequired = true;
				break;
			case 'setCommonChords':
				setCommonChordsList(value);
				runRequired = ukeGeeks.settings.opts.ignoreCommonChords;
				break;
			case 'update':
				doUpdate();
				break;
			default:
				console.log('Unrecognized ' + action + ' > ' + value);
		}

		if (runRequired) {
			_public.run();
		}
	};

	var syncOptions = function(options) {
		// direct menus
		doSetFontSize(options.fontSize);
		doSetDiagramSize(options.diagramSize);
		doLayout(options.diagramPosition);
		doSetPageWidth(options.paper);
		doSetTheme(options.theme);
		doTuning(options.tuning);
		doPlacement(options.lyricStyle);

		// advanced options
		setEnclosureVisible(!options.hideChordEnclosures);
		setIgnoreCommon(options.ignoreCommonChords);
		setCommonChordsList(options.commonChords);
		setSortAlphabetical(options.sortAlphabetical);
	};

	/**
	 * Rerun for new song text; updates UI
	 * @method doUpdate
	 * @private
	 */
	var doUpdate = function(){
		_public.run(true);
	};

	/**
	 * Rebuilds song, info, chord diagrams using current settings.
	 * @method run
	 * @param isDoBackup {bool} true forces backup; optional, default false.
	 */
	_public.run = function(isDoBackup){
		isDoBackup = (arguments.length > 0) && isDoBackup;
		_ele.songText.innerHTML = '<pre>' + _ele.cpmSource.value + '</pre>';
		_song = ukeGeeks.scriptasaurus.run();

		if (_song.chords.length < 1){
			ugsEditorPlus.autoReformat.run(_ele);
		}

		if (_song){
			ugsEditorPlus.songUi.update(_song);

			// maintains last copy of USER edited song -- used for transpose etc
			if (isDoBackup || (_originalSource === null)) {
				_originalSource = _ele.cpmSource.value;
				_originalChords = _song.chords;
				var key = _song.key !== '' ? _song.key : (_song.chords.length < 1 ? '' : _song.chords[0]);
				resetTranspose(key);
			}
		}
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Zoom Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Zooms (scales) fonts
	 * @method doSetFontSize
	 * @private
	 * @param value {string} point-size; value of the clicked value item
	 */
	var doSetFontSize = function(value) {
		var pt = parseFloat(value, 10);
		_ele.scalableArea.style.fontSize = pt + 'pt';
	};

	/**
	 * Zooms (scales) chord diagrams
	 * @method doSetDiagramSize
	 * @private
	 * @param value {string} percentage, integer between 0 and, well, 100?; value of the clicked value item
	 */
	var doSetDiagramSize = function(value) {
		var prct = parseInt(value, 10) / 100;
		// apologies for the magic number...
		var columnWidth = Math.round(prct * 225);

		var s = ugsEditorPlus.styles.getSheet('ugsEditorCss');
		var m = s.find('.scalablePrintArea .ugs-diagrams-wrap canvas');
		m.style.width = Math.round(prct * ukeGeeks.settings.fretBox.width) +'px';
		m.style.height = Math.round(prct * ukeGeeks.settings.fretBox.height) +'px';

		m = s.find('.scalablePrintArea .ugs-diagrams-wrap');
		m.style.width = columnWidth +'px';

		m = s.find('.scalablePrintArea .ugs-source-wrap');
		m.style.marginLeft = (25 + columnWidth) +'px';
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Layout (Reference Diagram Position) Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Changes positions for Reference Chord Diagrams -- handled entirely via CSS classes
	 * @method doLayout
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doLayout = function(value){
		$('body')
			.toggleClass('diagramsOnTop', value == 'top')
			.toggleClass('diagramsOnSide', value == 'left')
			.toggleClass('ugsHideDiagrams', value == 'none');
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Chord Name Placement Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Chord Name placement (&amp; "Mini-chord diagrams"). Returns true if Scriptasaurus should be rerun.
	 * @method doPlacement
	 * @private
	 * @param value {string} value of the clicked value item
	 * @return {Boolean}
	 */
	var doPlacement = function(value){
		var isRunRequired = false;
		ukeGeeks.toolsLite.setClass(_ele.songContainer, 'ugsInline', (value == 'inline'));

		// NOTE: ugs already adds the "chord diagrams above" class based on setting,
		// BUT does NOT remove it!!!!
		var isMiniDiagrams = (value == 'miniDiagrams');
		if (!isMiniDiagrams){
			ukeGeeks.toolsLite.removeClass(_ele.songContainer, 'ugsInlineDiagrams');
		}

		if (isMiniDiagrams || (_prevValues.placement == 'miniDiagrams')){
			ukeGeeks.settings.inlineDiagrams = isMiniDiagrams;
			isRunRequired = true;
		}
		else if (!isMiniDiagrams && (_prevValues.placement != 'miniDiagrams')) {
			// we're jumping between "above" and "inline", either way we need to
			// manually fix the overlaps
			ukeGeeks.overlapFixer.Fix(_ele.songText);
		}

		_prevValues.placement = value;

		return isRunRequired;
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Color Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Change the color scheme -- requires changing CSS Class and reruning (to regenerate reference chord diagrams)
	 * @method doSetTheme
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doSetTheme = function(value) {
		 ugsEditorPlus.themes.set(value);
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Page Width Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * (option dialog) changes body class, moving the right page edge
	 * @method doSetPageWidth
	 * @private
	 * @param value {string} currently selected option value
	 */
	var doSetPageWidth = function(value){
		var opts = ['letter', 'a4', 'screen'];
		var $body = $('body');
		for(var i = 0; i < opts.length; i++){
			$body.removeClass('pageWidth_' + opts[i]);
		}
		$body.addClass('pageWidth_' + value);
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Instrument & Tuning Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Change the instrument (tuning)
	 * @method doTuning
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doTuning = function(value){
		var tuning = ukeGeeks.definitions.instrument.sopranoUke,
			msg = 'Standard <strong>GCEA</strong> Soprano Ukulele';

		if (value == 'baritone') {
			tuning = ukeGeeks.definitions.instrument.baritoneUke;
			msg = 'Standard <strong>DGBE</strong> Baritone Ukulele';
		}

		$('#footTuningInfo').html(msg);
		ukeGeeks.scriptasaurus.setTuningOffset(tuning);
	};

	/**
	 * Parses Value to decide number of steps "up" or "down", then fires off transpose
	 * @method doTranspose
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doTranspose = function(value){
		var sign = value[0] == 'u' ? 1 : -1;
		var steps = parseInt(value[value.length - 1], 10);
		transpose(sign * steps);
	};

	/**
	 * Rebuilds song as "run", but first transposes chords
	 * @method transpose
	 * @param steps {int} number of semitones, +/-6
	 */
	var transpose = function(steps){
		var safeChords = [],
			bad = '',
			i;

		// find "shiftable" chords
		for (i = 0; i < _originalChords.length; i++) {
			if (_regEx.safe.test(_originalChords[i])) {
				safeChords.push(_originalChords[i]);
			}
			else {
				bad += _originalChords[i] + ', ';
			}
		}

		if (bad.length > 0){
			if (!confirm('Sorry, but some of your chords can\'t be transposed:\n' + bad + '\n\nDo you want to continue anyway?')){
				return;
			}
		}

		var newChords = ukeGeeks.transpose.shiftChords(safeChords, steps);
		var s = _originalSource;
		var rEx;

		// "safe" (temp) rename chords (prepend noise "ugsxx_" so a renamed G will be distinguisable from a new G)
		for (i = 0; i < safeChords.length; i++) {
			rEx = new RegExp('\\[' + safeChords[i] + '\\]', 'g');
			s = s.replace(rEx, '[ugsxx_' + i + ']');
		}

		// final rename; placeholder names to desired names
		for (i = 0; i < newChords.length; i++) {
			rEx = new RegExp('\\[ugsxx_' + i + '\\]', 'g');
			s = s.replace(rEx, '[' + newChords[i] + ']');
		}

		// find & replace {key} command (if present)
		rEx = /^\s*\{\s*(key|k)\s*:\s*(\S*?)\s*\}\s*$/im;
		if (rEx.test(s)) {
			var m = s.match(rEx);
			var key = m[2];
			if ((key !== '') && _regEx.safe.test(key)) {
				s = s.replace(rEx, m[0].replace(key, ukeGeeks.transpose.shift(key, steps)));
			}
		}

		// manipulations done, ready to...
		_ele.cpmSource.value = s;
		_public.run();

	};

 /**
	 * Sets Transpose menu's selected value to "Original"; adds example chord names
	 * @method resetTranspose
	 * @private
	 * @param keyChord {string}
	 */
	var resetTranspose = function(keyChord) {
		var ul = document.getElementById('transposeOptions');
		var items = ul.getElementsByTagName('li');
		var sample;
		var steps = -6;

		_prevValues['transpose'] = 'up_0';

		ugsEditorPlus.submenuUi.resetTransposeLabel();

		for (var i = 0; i < items.length; i++) {
			ukeGeeks.toolsLite.removeClass(items[i], 'checked');
			sample = (keyChord.length < 1) ? '' : ukeGeeks.transpose.shift(keyChord, steps);
			items[i].getElementsByTagName('em')[0].innerHTML = sample;
			if (steps === 0) {
				ukeGeeks.toolsLite.addClass(items[i], 'checked');
			}
			steps++;
		}
	};

	/* ----------------------------------------------------------------------------------- *|
	|* "Other Options" Methods
	|* ----------------------------------------------------------------------------------- */
	// a grab bag of single, odd switches... mea culpa

	/**
	 * (option dialog) change whether to show/hide the bracket characters
	 * @method setEnclosureVisible
	 * @private
	 * @param isVisible {bool}
	 */
	var setEnclosureVisible = function(isVisible){
		ukeGeeks.settings.opts.retainBrackets = isVisible;
	};

	/**
	 * (option dialog) change whether reference diagrams are sorted alphabetically or by their "song order"
	 * @method setSortAlphabetical
	 * @private
	 * @param isAlphabetical {bool}
	 */
	var setSortAlphabetical = function(isAlphabetical) {
		ukeGeeks.settings.opts.sortAlphabetical = isAlphabetical;
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method setIgnoreCommon
	 * @private
	 * @param isIgnore {bool}
	 */
	var setIgnoreCommon = function(isIgnore){
		ukeGeeks.settings.opts.ignoreCommonChords = isIgnore;
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * @method setCommonChordsList
	 * @private
	 * @param chordList {mixed} Either string, as comma seperated values list, or array of chord names
	 * @return {void}
	 */
	var setCommonChordsList = function(chordList) {
		if (typeof chordList == 'string') {
			var inputList = chordList.split(/[ ,]+/);
		var cleanList = [];

		for (var i = 0; i < inputList.length; i++) {
			var c = ukeGeeks.toolsLite.trim(inputList[i]);
			if (c.length > 0){
				cleanList.push(c);
			}
		}

			chordList = cleanList;
		}

		ukeGeeks.settings.commonChords = chordList;
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());