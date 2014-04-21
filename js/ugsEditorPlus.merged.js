/**
 * <ul>
 * <li>Project: UkeGeeks' Song-a-matic Editor</li>
 * <li>Homepage: http://ukegeeks.com</li>
 * <li>Project Repository: https://github.com/buzcarter/UkeGeeks</li>
 * <li>Author: Buz Carter</li>
 * <li>Contact: buz@ukegeeks.com</li>
 * <li>Copyright: Copyright 2010-2014 Buz Carter.</li>
 * <li>License GNU General Public License (http://www.gnu.org/licenses/gpl.html)</li>
 * </ul>
 *
 * <h3>Overview</h3>
 * This library implments the UkeGeeks Scriptasaurus Song-a-matic editor functions, bridging the page UI and scriptasaurus methods.
 *
 * @module ugsEditorPlus
 * @main ugsEditorPlus
 **/
var ugsEditorPlus = window.ugsEditorPlus || {};
;/**
 * Options (Features) you can turn on or off. Where available defaults to values defined in UkeGeeks.settings
 *
 * @class options
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.options = {
	/**
	 * If true attempts compatibility for versions of Microsoft Internet Explorer prior to IE9
	 * @example
	 *  Allowed values: true, false
	 * @property useLegacyIe
	 * @type Boolean
	 * @default false
	 */
	useLegacyIe: false,

	/**
	 * If true the Edit Song box is shown when the page loads; false hides it.
	 * @example
	 *  Allowed values: true, false
	 * @property showEditOnLoad
	 * @type Boolean
	 * @default true
	 */
	showEditOnLoad: true,

	/**
	 * Lyric's font size (pts)
	 * @example
	 *  Allowed values: 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 13, 14
	 * @property fontSize
	 * @type Number
	 * @default 12
	 */
	fontSize: 12,

	/**
	 * Reference diagram size expressed as a percentage (100% being max)
	 * @example
	 *  Allowed values: 40 ("tiny"), 65 ("small"), 80 ("medium"), 90 ("large"), 100 ("x-large")
	 * @property diagramSize
	 * @type Integer
	 * @default 100
	 */
	diagramSize: 100,

	/**
	 * Specify where reference diagrams should be show
	 * @example
	 *  Allowed values: left, top, or none
	 * @property diagramPosition
	 * @type Text
	 * @default left
	 */
	diagramPosition: "left",

	/**
	 * Specify how chord names within lyrics should be shown
	 * @example
	 *  Allowed values: inline, above, or miniDiagrams
	 * @property lyricStyle
	 * @type Text
	 * @default above
	 */
	lyricStyle: "above",

	/**
	 * Specify page width (mock paper)
	 * @example
	 *  Allowed values: letter, a4, screen
	 * @property paper
	 * @type Text
	 * @default letter
	 */
	paper: "letter",

	/**
	 * Theme shortname applied on page load.
	 * @example
	 *  Allowed values: frosty, jellyBean, justBlack, krampus, normal, notebook, pumpkin, reversed, western, zombie
	 * @property theme
	 * @type Text
	 * @default normal
	 */
	theme: "normal",

	/**
	 * Ukulele tuning ("instrument") for drawing diagrams.
	 * @example
	 *  Allowed values: soprano or baritone
	 * @property tuning
	 * @type Text
	 * @default soprano
	 */
	tuning: "soprano",

	/**
	 * Show/hide the square brackets around chord names within lyrics, ex: [Am]
	 * @example
	 *  Allowed values: true, false
	 * @property hideChordEnclosures
	 * @type Boolean
	 * @default see UkeGeeks.settings
	 */
	hideChordEnclosures: false,

	/**
	 * Order in which reference diagrams are sorted, either alphabetically (true) or order
	 * in which they appear within the song (false).
	 * @example
	 * Allowed values: true, false
	 * @property sortAlphabetical
	 * @type Boolean
	 * @default see UkeGeeks.settings
	 */
	sortAlphabetical: false,

	/**
	 * If TRUE chords in the "commonChords" list will be ignored (excluded from reference chord diagrams)
	 * @example
	 * Allowed values: true, false
	 * @property ignoreCommonChords
	 * @type Boolean
	 * @default see UkeGeeks.settings
	 */
	ignoreCommonChords: false,

	/**
	 * Array of chords to be ignored when drawing reference diagrams (if "ignoreCommonChords" is enabled)
	 * @example
	 *  (string or array of strings): as an  array of strings: ["A", "G"] or comma delimited list: "A, G"
	 * @property commonChords
	 * @type mixed
	 * @default see UkeGeeks.settings
	 */
	commonChords: []
};
;/**
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
		'placement': 'above',
		'transpose': 'up_0'
	};

	/**
	 * Sets up this class; modifies form elements; attaches event handlers, etc
	 * @method init
	 * @public
	 */
	_public.init = function() {
		_ele = {
			songText: document.getElementById('ukeSongText'),
			songContainer: document.getElementById('ukeSongContainer'),
			cpmSource: document.getElementById('chordProSource'),
			scalableArea: document.getElementById('scalablePrintArea')
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

		switch (action) {
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
	var doUpdate = function() {
		_public.run(true);
	};

	/**
	 * Rebuilds song, info, chord diagrams using current settings.
	 * @method run
	 * @param isDoBackup {bool} true forces backup; optional, default false.
	 */
	_public.run = function(isDoBackup) {
		isDoBackup = (arguments.length > 0) && isDoBackup;
		_ele.songText.innerHTML = '<pre>' + _ele.cpmSource.value + '</pre>';
		_song = ukeGeeks.scriptasaurus.run();

		if (_song.chords.length < 1) {
			ugsEditorPlus.autoReformat.run(_ele);
		}

		if (_song) {
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
		m.style.width = Math.round(prct * ukeGeeks.settings.fretBox.width) + 'px';
		m.style.height = Math.round(prct * ukeGeeks.settings.fretBox.height) + 'px';

		m = s.find('.scalablePrintArea .ugs-diagrams-wrap');
		m.style.width = columnWidth + 'px';

		m = s.find('.scalablePrintArea .ugs-source-wrap');
		m.style.marginLeft = (25 + columnWidth) + 'px';
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
	var doLayout = function(value) {
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
	var doPlacement = function(value) {
		var isRunRequired = false;
		ukeGeeks.toolsLite.setClass(_ele.songContainer, 'ugsInline', (value == 'inline'));

		// NOTE: ugs already adds the "chord diagrams above" class based on setting,
		// BUT does NOT remove it!!!!
		var isMiniDiagrams = (value == 'miniDiagrams');
		if (!isMiniDiagrams) {
			ukeGeeks.toolsLite.removeClass(_ele.songContainer, 'ugsInlineDiagrams');
		}

		if (isMiniDiagrams || (_prevValues.placement == 'miniDiagrams')) {
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
	var doSetPageWidth = function(value) {
		var opts = ['letter', 'a4', 'screen'];
		var $body = $('body');
		for (var i = 0; i < opts.length; i++) {
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
	var doTuning = function(value) {
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
	var doTranspose = function(value) {
		var sign = value[0] == 'u' ? 1 : -1;
		var steps = parseInt(value[value.length - 1], 10);
		transpose(sign * steps);
	};

	/**
	 * Rebuilds song as "run", but first transposes chords
	 * @method transpose
	 * @param steps {int} number of semitones, +/-6
	 */
	var transpose = function(steps) {
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

		if (bad.length > 0) {
			if (!confirm('Sorry, but some of your chords can\'t be transposed:\n' + bad + '\n\nDo you want to continue anyway?')) {
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
	var setEnclosureVisible = function(isVisible) {
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
	var setIgnoreCommon = function(isIgnore) {
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
				if (c.length > 0) {
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
;/**
 * Handles transfering the easy text bits of a Song -- title, artist, etc -- to the page.
 * @class songUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songUi = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * Sets an element's Inner HTML and sets visibility based on whether the value is empty (or not)
	 * @method trySet
	 * @private
	 * @param id {string} element's Id
	 * @param value {string} content value
	 */
	var trySet = function(id, value){
		var hasValue = value && (value.length > 0);
		var h = document.getElementById(id);
		if (!h){
			return;
		}
		h.innerHTML = hasValue ? value : "";
		h.style.display = hasValue ? 'block' : 'none';
	};

 /**
	 * Update various HTML parts (H1 &amp; H2 etc.) using TEXT values of Song
	 * @method updateUi
	 * @private
	 * @param song {Song(Object)}
	 */
	_public.update = function(song){
		var h = document.getElementById('songTitle');
		h.innerHTML = (song.title.length > 0) ? song.title : 'Untitled-Song';

		trySet('songArtist', song.artist);
		trySet('songAlbum', song.album);
		trySet('songSubtitle', song.st);

		h = document.getElementById('songMeta');
		if (!song.ugsMeta || (song.ugsMeta.length < 1)){
			h.style.display = 'none';
		}
		else {
			var s = '';
			for(var i = 0; i < song.ugsMeta.length; i++){
				s += '<p>' + song.ugsMeta[i] + '</p>';
			}
			h.innerHTML = s;
			h.style.display = 'block';
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);

;/**
 * from: http://www.javascriptkit.com/dhtmltutors/externalcss.shtml
 * @class styles
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.styles = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {
		Rules: null
	};

	var _sheet = null;

	_public.getSheet = function(title) {
		_sheet = _getSheet(title);
		_public.Rules = _getRules();
		return this;
	};

	var _getSheet = function(title) {
		for (var i = 0; i < document.styleSheets.length; i++) {
			if (document.styleSheets[i].title == title) {
				return document.styleSheets[i];
			}
		}
		return null;
	};

	var _getRules = function() {
		if (_sheet == null) {
			return [];
		}
		return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
	};

	_public.find = function(selector) {
		selector = selector.toLowerCase();
		for (var i = 0; i < _public.Rules.length; i++) {
			if (!_public.Rules[i].selectorText) {
				continue;
			}
			if (_public.Rules[i].selectorText.toLowerCase() == selector) {
				return _public.Rules[i];
			}
		}
		return null;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;/**
 * Changes the song's color scheme ("theme") by changing both the applied body class
 * and the UkeGeek settings used to draw the diagrams.
 * @class themes
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.themes = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * available color schemes (see UkeGeeks.settings)
	 * @property _colorSchemes
	 * @type {JSON-Object}
	 */
	var _colorSchemes = {
		'normal': {
			name: 'Normal (white paper)',
			selectText: 'Normal colors (white paper)',
			description: 'Simple, legible text on white paper',
			song: {
				fretLines: '#003366',
				dots: '#ff0000',
				dotText: '#ffffff',
				text: '#000000',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#999999',
				dots: '#eaeaea',
				text: '#000000'
			}
		},

		'reversed': {
			name: 'Reversed for projectors',
			selectText: 'Reversed colors (for projectors)',
			description: 'Light text on dark background',
			song: {
				fretLines: '#365F70',
				dots: '#FDD96F',
				dotText: '#000000',
				text: '#FF6040',
				fretText: '#999999'
			},
			tabs: {
				lines: '#365F70',
				dots: '#FDD96F',
				text: '#000000'
			}
		},

		'frosty': {
			name: 'Frostcicle',
			selectText: 'Frostcicle (cool blue)',
			description: 'Brrrr... icy cool blues',
			song: {
				fretLines: '#66B4CC',
				dots: '#332335',
				dotText: '#9FE1F9',
				text: '#0896FE',
				fretText: '#E3D8BA'
			},
			tabs: {
				lines: '#6699FF',
				dots: '#EFFCF9',
				text: '#00558E'
			}
		},

		'jellyBean': {
			name: 'Jelly Beans',
			selectText: 'Jelly Beans (vibrant)',
			description: 'Sugary, vibrant bowl of jelly beans!',
			song: {
				fretLines: '#49BC45',
				dots: '#FF9417',
				dotText: '#FCF49F',
				text: '#D20070',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#6699FF',
				dots: '#FFF9BA',
				text: '#75003E'
			}
		},

		'justBlack': {
			name: 'Just Black',
			selectText: 'Black (for laser printers)',
			description: 'No color, but black, best for B&W laser printers',
			song: {
				fretLines: '#cccccc',
				dots: '#000000',
				dotText: '#ffffff',
				text: '#000000',
				fretText: '#000000'
			},
			tabs: {
				lines: '#cccccc',
				dots: '#000000',
				text: '#ffffff'
			}
		},

		'krampus': {
			name: 'Gruss vom Krampus',
			selectText: 'Krampus (Ye Olde Christmas)',
			description: 'Seasons Greetin\'s, Happy Holidays, Merry Christmas, Krampus Nichte!',
			song: {
				fretLines: '#929867',
				dots: '#A22C27',
				dotText: '#EBD592',
				text: '#4F2621',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#B69C01',
				dots: '#E1EEC8',
				text: '#75003E'
			}
		},

		'western': {
			name: 'Out West',
			selectText: 'Out West (dust country)',
			description: 'Dusty Honky Tonk/Country/Western look',
			song: {
				fretLines: '#B5A679',
				dots: '#CF8300',
				dotText: '#ffffff',
				text: '#386571',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#697665',
				dots: '#F1E3C5',
				text: '#632424'
			}
		},

		'pumpkin': {
			name: 'Pumpkin Pie',
			selectText: 'Pumpkin Pie (fall colors)',
			description: 'Fall \'n Halloween \'n Jack o\'Lantern \'n Thanksgiving Fun',
			song: {
				fretLines: '#8E9A6C',
				dots: '#DA6328',
				dotText: '#FFEE4A',
				text: '#68391D',
				fretText: '#B14623'
			},
			tabs: {
				lines: '#BED379',
				dots: '#FFF4D8',
				text: '#B14623'
			}
		},

		'notebook': {
			name: 'Rock Notebook',
			selectText: 'Rock Notebook (marker)',
			description: 'A strong, hand-scrawled, and edgily unreliable look',
			song: {
				fretLines: '#747CAD',
				dots: '#1C0866',
				dotText: '#ffffff',
				text: '#B22000',
				fretText: '#A4A0B2'
			},
			tabs: {
				lines: '#A4A0B2',
				dots: '#F1E3C5',
				text: '#2E2ECC'
			}
		},

		'zombie': {
			name: 'Zombies!!!',
			selectText: 'Zombies!!!',
			description: 'Blood \'n gore for Halloween',
			song: {
				fretLines: '#9EB036',
				dots: '#E52501',
				dotText: '#FEDA79',
				text: '#798666',
				fretText: '#B14623'
			},
			tabs: {
				lines: '#602749',
				dots: '#F7F9EA',
				text: '#4F5F3E'
			}
		}

	};

	var setBody = function(themeName) {
		var $body = $('body');
		// see: http://stackoverflow.com/questions/921789/how-to-loop-through-javascript-object-literal-with-objects-as-members
		for (var key in _colorSchemes) {
			if (_colorSchemes.hasOwnProperty(key)) {
				$body.removeClass('theme-' + key);
			}
		}
		$body.addClass('theme-' + themeName);
	};

	/**
	 * Returns text to be deisplayed when the  specified theme is selected.
	 * @method  getDescription
	 * @param  {string} themeName
	 * @return {string}
	 */
	_public.getDescription = function(themeName) {
		return _colorSchemes[themeName].selectText;
	};

	/**
	 * Populates the UL (identified via CSS/jQuery selector) with the color scheme List Items (LIs)
	 * @method loadList
	 * @param {string} selector
	 * @param {string} selectedValue value that should be "checked"
	 */
	_public.loadList = function(selector, selectedValue) {
		var s = '';
		for (var key in _colorSchemes) {
			if (_colorSchemes.hasOwnProperty(key)) {
				var cssClass = (key == selectedValue) ? 'checked' : '';
				s += '<li class="' + cssClass + '"><a href="#' + key + '" title="' + _colorSchemes[key].description + '">' + _colorSchemes[key].name + '</a></li>';
			}
		}
		$(selector).html(s);
	};

	/**
	 * Sets body class and UkeGeeks settings to specified theme.
	 * @method set
	 * @param {string} themeName
	 */
	_public.set = function(themeName) {
		setBody(themeName);

		var c = _colorSchemes[themeName];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;/**
 * UI mechanics of the Other Options "dialog"'s checkboxes and input
 * fields (does NOT manage "pageWidth" since its standard submenu behavior
 * is already handled in that class)
 * @class optionsDlg
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * Sets up this class by attaching event handlers to form elements;
	 * @method init
	 * @public
	 */
	_public.init = function() {
		var ele,
			options = ugsEditorPlus.options;

		// Update Button
		document.getElementById('updateBtn').onclick = function() {
			triggerNotify('update', '');
			return false;
		};

		// show/hide square bracket (chord enclosure)
		ele = document.getElementById('chkEnclosures');
		ele.checked = options.hideChordEnclosures;
		ele.onclick = function() {
			// Boolean "isVisible"
			triggerNotify('showEnclosures', !this.checked);
		};

		// list of chord names to ignore
		ele = document.getElementById('commonChordList');
		ele.value = (typeof options.commonChords == 'string') ? options.commonChords : options.commonChords.join(", ");
		ele.onchange = function() {
			triggerNotify('setCommonChords', this.value);
		};

		// toggle order of reference diagrams
		ele = document.getElementById('chkSortAlpha');
		if (ele) {
			ele.checked = options.sortAlphabetical;
			ele.onclick = function() {
				triggerNotify('sortAlphabetical', this.checked);
			};
		}

		// toggle ignore common chords
		ele = document.getElementById('chkIgnoreCommon');
		ele.checked = options.ignoreCommonChords;
		ele.onclick = function() {
			// Boolean for "isIgnore"
			triggerNotify('hideCommonChords', this.checked);
		};

		// ugh! Event bubbling!
		$('.checkboxBlock label, input[type=checkbox]').click(function(e) {
			e.stopPropagation();
		});

		$('.overlay').draggable({
			handle: 'hgroup'
			//containParent: true
		});
	};

	var triggerNotify = function(action, value) {
		$.event.trigger('option:click', {
			action: action,
			value: value
		});
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;var ugsEditorPlus = window.ugsEditorPlus || {};

/**
 * TK
 * @class reformat
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.reformat = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _hasChords = false;

	/**
	 *
	 * @property _enums
	 * @private
	 */
	var _enums = {
		lineTypes: {
			blank: 0,
			chords: 1,
			lyrics: 2,
			tabs: 3
		}
	};

	/**
	 * Line Object Class Definition (sets defaults)
	 * @class reformat.LineObj
	 * @private
	 * @constructor
	 * @for reformat
	 */
	var LineObj = function() {
		this.source = '';
		this.wordCount = 0;
		this.spaceCount = 0;
		this.words = [];
		this.chordCount = 0;
		this.lineType = _enums.lineTypes.blank;
	};

	var _re = {
		words: /\b(\S+)\b/gi,
		spaces: /(\s+)/g,
		leadingSpace: /(^\s+)/,
		chordNames: /\b[A-G][#b]?(m|m6|m7|m9|dim|dim7|maj7|sus2|sus4|aug|6|7|9|add9|7sus4)?\b/,
		chrdBlock: /\b(\S+\s*)/g,
		tabs: /^\s*(\|{0,2}[A-Gb]?\|{0,2}[-x0-9|:]{4,})/
	};

	// Hal Leonard Uke Chord Finder:
	// + aug
	// o dim
	// -----------------
	// F Fm F+ Fdim
	// F5 Fadd9 Fm(add9) Fsus4
	// Fsus2 F6 Fm6 Fmaj7
	// Fmaj9 Fm7 Fm(maj7) Fm7b5
	// Fm9 Fm11 F7 Fsus4
	// F+7 F7b5 F9 F7#9
	// F7b9 F11 F13 Fdim7

	/**
	 * Accepts a text block, returns "ChordPro" text block with chord lines merged into lyric lines with chords enclosed in square-brackets (i.e. [Cdim])
	 * @method run
	 * @public
	 * @param text {string} songstring
	 * @return {string} ChordPro format text block
	 * @for reformat
	 */
	_public.run = function(text) {
		_hasChords = false;
		var lines = read(text);
		return merge(lines);
	};

	/**
	 * TRUE if one or more chord lines detected
	 * @method hasChords
	 * @return {bool}
	 */
	_public.hasChords = function() {
		return _hasChords;
	};

	/**
	 * Accepts a text block
	 * @method read
	 * @param text {string} string RAW song
	 * @return {array of Lines}
	 */
	var read = function(text) {
		var lineAry = [];
		text = text.replace('	', '    ');
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var words = lines[i].match(_re.words);
			var l = new LineObj();
			l.source = lines[i];
			if ((words != null) && (words.length > 0)) {
				l.wordCount = words.length;
				l.words = words;
				l.chordCount = countChords(words);
			}
			var spaces = lines[i].match(_re.spaces);
			if ((spaces != null) && (spaces.length > 0)) {
				l.spaceCount = spaces.length;
			}
			l.lineType = toLineType(l);
			lineAry.push(l);
		}
		return lineAry;
	};

	/**
	 * Guesses as to the line's tyupe --
	 * @method toLineType
	 * @param line {line}
	 * @return {_enums.lineTypes}
	 */
	var toLineType = function(line) {
		if ((line.spaceCount + line.wordCount) < 1) {
			return _enums.lineTypes.blank;
		}

		var tabs = line.source.match(_re.tabs);
		if (tabs != null) {
			return _enums.lineTypes.tabs;
		}

		var t = _enums.lineTypes.lyrics;
		if ((line.chordCount > 0) && (line.wordCount == line.chordCount)) {
			t = _enums.lineTypes.chords;
			_hasChords = true;
		}

		return t;
	};

	/**
	 * Looks for supported chords.
	 * @method countChords
	 * @param words {array of words}
	 * @return [int] number found
	 */
	var countChords = function(words) {
		var count = 0;
		for (var i = 0; i < words.length; i++) {
			if (words[i].match(_re.chordNames)) {
				count++;
			}
		}
		return count;
	};

	/**
	 * Return merged song -- chords embedded within lyrics
	 * @method merge
	 * @param lines {array of Lines}
	 * @return [string]
	 */
	var merge = function(lines) {
		var s = '';
		var thisLine, nextLine;
		for (var i = 0; i < lines.length;) {
			thisLine = lines[i];
			nextLine = lines[i + 1];
			i++;
			// If this line's blank or its the last line...
			if (!nextLine || (thisLine.lineType == _enums.lineTypes.blank)) {
				s += thisLine.source + '\n';
				continue;
			}

			// OK, we've complicated things a bit by adding tabs, so we'll handle this in a helper...
			if ((thisLine.lineType == _enums.lineTypes.tabs) && isTabBlock(lines, i)) {
				s += '{start_of_tab}\n' + thisLine.source.replace(_re.leadingSpace, '') + '\n' + nextLine.source.replace(_re.leadingSpace, '') + '\n' + lines[i + 1].source.replace(_re.leadingSpace, '') + '\n' + lines[i + 2].source.replace(_re.leadingSpace, '') + '\n' + '{end_of_tab}\n';
				i += 3;
				continue;
			}

			// finally, look for a "mergable" pair: this line is chords and the next is lyrics -- if not this we'll just output the current line
			if ((thisLine.lineType != _enums.lineTypes.chords) || (nextLine.lineType != _enums.lineTypes.lyrics)) {
				s += (thisLine.lineType == _enums.lineTypes.chords) ? wrapChords(thisLine.source) + '\n' : thisLine.source + '\n';
				continue;
			}

			// OK, if you're here it's because the current line is chords and the next lyrics, meaning, we're gonna merge them!
			i++;
			s += mergeLines(thisLine.source, nextLine.source) + '\n';
		}
		return s;
	};

	/**
	 * TRUE if we can make a Tab block using this and the following 3 linrd (we need a set of four tab lines followed by a non-tab line)
	 * @method isTabBlock
	 * @param lines {array of Lines}
	 * @param index {int} current line's index within line array
	 * @return [bool]
	 */
	var isTabBlock = function(lines, index) {
		if (index + 3 >= lines.length) {
			return false;
		}
		for (var i = index; i < index + 3; i++) {
			if (lines[i].lineType != _enums.lineTypes.tabs) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Return a single line
	 * @method mergeLines
	 * @param chordLine {string} the line containing the chord names
	 * @param lyricsLine {string} the line of lyrics
	 * @return [string] merged lines
	 */
	var mergeLines = function(chordLine, lyricsLine) {
		while (lyricsLine.length < chordLine.length) {
			lyricsLine += ' ';
		}
		var s = '';
		var blocks = chordLine.match(_re.chrdBlock);
		var lead = chordLine.match(_re.leadingSpace);
		var offset = 0;
		if (lead) {
			s += lyricsLine.substr(offset, lead[0].length);
			offset = lead[0].length;
		}
		for (var j = 0; j < blocks.length; j++) {
			s += '[' + blocks[j].replace(_re.spaces, '') + ']' + lyricsLine.substr(offset, blocks[j].length);
			offset += blocks[j].length;
		}
		if (offset < lyricsLine.length) {
			s += lyricsLine.substr(offset, lyricsLine.length);
		}
		return s;
	};

	/**
	 * Wraps the words on the line within square brackets " C D " is returned as "[C] [D]"
	 * @method wrapChords
	 * @param chordLine {string} the line containing the chord names
	 * @return [string] each word of input line gets bracketed
	 */
	var wrapChords = function(chordLine) {
		var chords = chordLine.replace(_re.spaces, ' ').split(' ');
		var s = '';
		for (var i = 0; i < chords.length; i++) {
			if (chords[i].length > 0) {
				s += '[' + chords[i] + '] ';
			}
		}
		return s;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;/**
 *
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.autoReformat = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
	 * @property _ele
	 * @type {JSON}
	 */
	var _ele = {};

	var _formatted;
	var _isDisabled = false;

	_public.run = function(elements) {
		if (_isDisabled) {
			return;
		}
		_ele = elements;
		_ele.reformatTextBox = document.getElementById('reformatSource');
		_ele.reformatDlg = document.getElementById('reformatDlg');

		document.getElementById('reformatYesBtn').onclick = function() {
			doOk();
			return false;
		};
		document.getElementById('reformatNoBtn').onclick = function() {
			doClose();
			return false;
		};

		// need to reset on reload
		var chk = document.getElementById('reformatDisable');
		chk.checked = false;
		chk.onclick = function() {
			doDisable(this.checked);
		};

		runNow();
	};

	var doOk = function() {
		_ele.cpmSource.value = _formatted;
		doClose();
		ugsEditorPlus.actions.run(true);
	};

	var doClose = function() {
		ukeGeeks.toolsLite.addClass(_ele.reformatDlg, 'isHidden');
	};

	var doDisable = function(isDisabled) {
		_isDisabled = isDisabled;
	};

	var runNow = function() {
		_formatted = ugsEditorPlus.reformat.run(_ele.cpmSource.value);
		_ele.reformatTextBox.innerHTML = _formatted;

		if (!ugsEditorPlus.reformat.hasChords()) {
			return;
		}

		ukeGeeks.toolsLite.removeClass(_ele.reformatDlg, 'isHidden');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function() {

	/**
	 * attaches events...
	 * @method _init
	 * @public
	 * @return {void}
	 */
	var _init = function() {
		// $('#ugsAppToolbar > ul a')
		$('#ugsAppToolbar > ul li').not('[data-dialog]').children('a').click(_onMenuItemClick);
		$('.showOptionsBox a').click(_onShowOptionsClick);

		$('#ugsAppToolbar > ul li[data-dialog]').click(_onShowDlgBtnClick);
		$('.closeBtn').click(_onCloseBtnClick);
		$('.resizeBtn').click(_onResizeBtnClick);
	};

	/**
	 * Click handler for nav items that are NOT attached to a dialog box.
	 * @method _onMenuItemClick
	 * @private
	 * @return {void}
	 */
	var _onMenuItemClick = function() {
		// the clicked anchor tag
		var $parent = $(this).parent();
		var isOpen = $parent.hasClass('active');
		_makeAllInactive();
		if (isOpen) {
			return;
		}
		$parent.addClass('active');
	};

	/**
	 * Deselects all items in app's top menu/nav bar (just removes active state from all items)
	 * @method _makeAllInactive
	 * @private
	 * @return {void}
	 */
	var _makeAllInactive = function() {
		$('#ugsAppToolbar > ul > li').removeClass('active');
	};

	/**
	 * Same as _makeAllInactive method PLUS closes any open drop down/arrow boxes.
	 * @method _closeAll
	 * @private
	 * @return {void}
	 */
	var _closeAll = function() {
		// hide any drop-down/arrow boxes currently open
		_makeAllInactive();
		$('.arrowBox').hide();
	};

	/**
	 * handles nav menu/toolbar click event. The data-dialog="X" attribute
	 * on the element assocaites the menu item with the dialog box (the
	 * box's id)
	 * @method _onShowDlgBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onShowDlgBtnClick = function(e) {
		_closeAll();

		// now show dialog associated with the clicked button
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();

		// prevent event bubbling
		return false;
	};

	/**
	 * dialog box's close button's click handler. Hides the first parent
	 * with class.
	 * @method _onCloseBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onCloseBtnClick = function(e) {
		$(this).parents('.overlay').fadeOut();
		// prevent event bubbling
		return false;
	};

	var _onResizeBtnClick = function(e) {
		_closeAll();
		var dlg = $(this).parents('.overlay');
		ugsEditorPlus.resize.toggle(dlg);
		return false;
	};

	/**
	 * display a "tooltip" options dialog
	 * @method _onShowOptionsClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var _onShowOptionsClick = function(e) {
		var id = $(this).attr('href');

		$('.arrowBox').not(id).hide();

		var $dlg = $(id);
		$dlg.find('dd').hide();
		$dlg.fadeToggle();

		ugsEditorPlus.submenuUi.reset($dlg);

		// prevent event bubbling
		return false;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return {
		init: _init,
		makeAllInactive: _makeAllInactive
	};

}());
;/**
 * Wires up all the "pseudo-selects" (aka "dropdownlists") on a Tooltip-Dialog boxes on
 * the page; assumes consistent HTML (hello, jQuery)
 * TODO: Refactor -- quite brittle!
 * @class submenuUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.submenuUi = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _open = null;

	/**
	 * attaches event handlers
	 * @method init
	 * @public
	 * @return {[type]} [description]
	 */
	_public.init = function() {
		ugsEditorPlus.themes.loadList('#colorPicker .pseudoSelect', ugsEditorPlus.options.theme);
		$('.enablePseudoSelects label').click(onLabelClick);
		$('.pseudoSelect li').click(onOptionClick);
		$('body').bind('click', closeAll);
		$('.arrowBox').click(doCollapseAllLists);

		syncOptions(ugsEditorPlus.options);
	};

	/**
	 * a list item has been clicked
	 * @method onOptionClick
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onOptionClick = function(e) {
		var $optionItem = $(this);
		var value = stripHash($optionItem.children().attr('href'));

		// the element holding the "pseudo-select"
		var $select = $optionItem.parents('dd');
		var id = $select.attr('id');
		var actionName = $select.data('action');

		// a selection's been made so we hide the (sub) select list
		$('#' + id).hide();
		// ...and reset ("uncheck") all items and check ("highlight") this selected item
		setChecked($optionItem);

		onListActive(this, false);
		_open = null;

		// now bubble out the info -- update display to show selected value ...
		$('label[for=' + id + '] span').text(getLabelText(actionName, value, $optionItem));
		$('label[for=' + id + ']').parents('dt').removeClass('active');

		// lastly, execute the action
		$.event.trigger('option:click', {
			action: actionName,
			value: value
		});

		// prevent event bubbling
		return false;
	};

	var setChecked = function($item) {
		if (!$item) {
			//console.log('item for option not found');
			return;
		}
		$item.siblings().removeClass('checked');
		$item.addClass('checked');
	};

	var syncOptions = function(options) {
		var $item, id,
			map = [{
				action: 'zoomFonts',
				value: options.fontSize
			}, {
				action: 'zoomDiagrams',
				value: options.diagramSize
			}, {
				action: 'layout',
				value: options.diagramPosition
			}, {
				action: 'paper',
				value: options.paper
			}, {
				action: 'colors',
				value: options.theme
			}, {
				action: 'tuning',
				value: options.tuning
			}, {
				action: 'placement',
				value: options.lyricStyle
			}];

		for (var i = map.length - 1; i >= 0; i--) {
			$item = $('[data-action=' + map[i].action + '] a[href=#' + map[i].value + ']').closest('li');
			id = $item.closest('dd').attr('id');
			setChecked($item);
			$('label[for=' + id + '] span').text(getLabelText(map[i].action, map[i].value, $item));
		}
	};

	/**
	 * Label has been clicked, show associated options dialog box.
	 * Watch for 2-clicks on same label (should hide on second click)
	 * @method onLabelClick
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onLabelClick = function(e) {
		var $thisLabel = $(this);
		var id = $thisLabel.attr('for');
		setActiveLabel($thisLabel);
		$('#' + id).show();
		onListActive(this, true);
		if (_open !== null) {
			$('#' + _open.id).hide();
		}
		if (_open !== null && _open.id == id) {
			_open = null;
		}
		else {
			_open = {
				"id": id
			};
		}

		// prevent event bubbling
		return false;
	};

	_public.reset = function($dlg) {
		$dlg.find('dt').removeClass('active');
		$dlg.find('.event-userSelecting').removeClass('event-userSelecting');
	};

	var setActiveLabel = function($label) {
		$label.closest('dl').children('dt').removeClass('active');
		$label.closest('dt').addClass('active');
	};

	/**
	 * trying prevent the options not being set from being too distractive --
	 * (trying and clearly failing)
	 * @method onListActive
	 * @param  {DOM-elemnt}  ele     [description]
	 * @param  {Boolean} isInUse [description]
	 * @return void
	 */
	var onListActive = function(ele, isInUse) {
		$(ele).parents('.enablePseudoSelects').toggleClass('event-userSelecting', isInUse);
	};

	/**
	 * @method  doCollapseAllLists
	 * @param  {event} e
	 * @return bool
	 */
	var doCollapseAllLists = function(e) {
		if ($(e.target).is('a')) {
			return;
		}
		$(this).find('dd').hide();
		_open = null;
		return false;
	};

	/**
	 * user clicked off the current dialog -- close 'em all
	 * @method closeAll
	 * @param  {event} e
	 */
	var closeAll = function(e) {
		$('.arrowBox').fadeOut(270);
		ugsEditorPlus.topMenus.makeAllInactive();
	};

	var stripHash = function(value) {
		return (value[0] == '#') ? value.substr(1) : value;
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Display Text Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * used to construct the descriptions for current values
	 * @property _descriptions
	 * @private
	 * @type {JSON}
	 */
	var _desriptions = {
		'zoomDiagrams': ['Tiny', 'Small', 'Medium', 'Large', 'Stupid Large'],
		'layout': ['Reference diagrams on left', 'Reference diagrams at top', 'No reference diagrams'],
		'placement': ['Chord names inline with lyrics', 'Chord names above lyrics', 'Names & diagrams above lyrics'],
		'tuning': ['Soprano (GCEA) tuning', 'Baritone (DBEA) tuning']
	};

	/**
	 * Builds a descriptor string of the current values for the pseudo-select labels
	 * @method getLabelText
	 * @param  {string} action
	 * @param  {string} value
	 * @param  {jQueryElement} $ele jQuery element that ...
	 * @return {string}
	 */
	var getLabelText = function(action, value, $ele) {
		var index = $ele.index();

		switch (action) {
			case 'paper':
				return 'Width ' + $ele.text();
			case 'zoomFonts':
				return 'Font size ' + value + 'pt';
			case 'zoomDiagrams':
				return _desriptions.zoomDiagrams[index] + ' diagrams';
			case 'colors':
				return ugsEditorPlus.themes.getDescription(value);
			case 'transpose':
				if (value == 'up_0') {
					return 'Original key';
				}
				var txt = $ele.text();
				return txt.replace(' ', ' steps - "') + '"';
			default:
				return _desriptions[action][index];
		}
	};

	_public.resetTransposeLabel = function() {
		$('label[for=transposePicker] span').text('Original key');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;/**
 * Creates a new song via AJAX.
 * Dependencies: jQuery
 * @class newSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.newSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 * @attribute _isUpdating
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	var _ajaxUri = '';

	_public.init = function(ajaxUri) {
		_ajaxUri = ajaxUri;

		$('#newSongBtn').click(function(e) {
			if (doValidate(this)) {
				doPost();
			}
		});

		$('#openNewDlgBtn').click(function(e) {
			resetFields();
			$('#newSongForm').fadeIn();
			$('#songTitle').focus();
		});

		$('#hideNewSongBtn').click(closeDlg);

		// handle escape key
		$('#newSongForm').bind('keydown', onEscape);

		var $spinner = $("#loadingSpinner");
		$spinner.hide();
		$(document)
			.ajaxStart(function() {
				$spinner.show();
				_isUpdating = true;
			})
			.ajaxStop(function() {
				$spinner.hide();
				_isUpdating = false;
			});
	};

	var doAjaxOk = function(data) {
		showErrors(data.HasErrors, data.Message);
		if (data.HasErrors) {
			return;
		}
		document.location.href = data.ContinueUri;
	};

	var doPost = function() {
		if (_isUpdating) {
			return;
		}

		var data = {
			'handler': 'ugs_new',
			'songTitle': $('#songTitle').val(),
			'songArtist': $('#songArtist').val()
		};

		$.ajax({
			url: _ajaxUri,
			type: "POST",
			dataType: 'json',
			data: JSON.stringify(data),
			success: function(data) {
				doAjaxOk(data);
			},
			error: function(data) {
				showErrors(true, 'Failed to create the song file.<br/>Please have your admin check the CPM directory permissions.');
			}
		});
	};

	var doValidate = function() {
		var $title = $('#songTitle');
		var title = $title.val().trim();
		$title.val(title);
		var ok = title.length > 2;
		showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later, must be at least 2 characters)</em>');
		return ok;
	};

	var showErrors = function(hasErrors, message) {
		var $err = $('#newSongForm .errorMessage');
		if (hasErrors) {
			$err.show().html(message);
			$('#songTitle').focus();
		}
		else {
			$err.hide();
		}
	};

	var closeDlg = function(e) {
		$('#newSongForm').fadeOut();
	};

	var resetFields = function() {
		$('#songTitle, #songArtist').val('');
	};

	var onEscape = function(e) {
		if (e.which == 27) {
			closeDlg();
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();
;/**
 * Updates an exising song via AJAX.
 * Dependencies: jQuery
 * @class updateSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.updateSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _ajaxUri = '';
	var _filename = '';

	/**
	 * Name / Value pairs for jQuery selectors of HTML elements to be manipulated
	 * @property _selectors
	 * @type {JSON}
	 */
	var _selectors = {
		messageBox: '#messageBox',
		message: '#sourceFeedback',
		button: '#saveBtn',
		spinner: '#loadingSpinner',
		song: '#chordProSource'
	};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 * @property _isUpdating
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	_public.init = function(ajaxUri, filename) {
		_ajaxUri = ajaxUri;
		_filename = filename;

		$(_selectors.button).click(function(event) {
			doUpdate();
			return false;
		});

		$(_selectors.messageBox).hide();
		$(document)
			.ajaxStart(function() {
				showBusy();
				_isUpdating = true;
			})
			.ajaxStop(function() {
				hideMessage();
				_isUpdating = false;
			});
	};

	var showBusy = function() {
		$(_selectors.message).hide().html();
		$(_selectors.messageBox).slideDown('fast');
		$(_selectors.spinner).show();
	};

	var showMessage = function(message) {
		$(_selectors.spinner).hide();
		$(_selectors.message).show().html(message);
	};

	var hideMessage = function() {
		$(_selectors.messageBox).delay(3000).fadeOut('slow');
	};

	var doUpdate = function() {
		if (_isUpdating) {
			return;
		}

		$(_selectors.message).show();

		var data = {
			'handler': 'ugs_update_81jr',
			'filename': _filename,
			'song': $(_selectors.song).val()
		};

		$.ajax({
			url: _ajaxUri,
			type: 'POST',
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function(data) {
				doAjaxOk(data);
			},
			error: function(data) {
				alert('Encountered a problem saving your Song. Please copy your song to another program until this issue is resolved.');
			}
		});
	};

	var doAjaxOk = function(data) {
		//if (data.HasErrors)
		showMessage(data.Message);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();
;/**
 * Search on the song list page for songs.
 * Dependencies: jQuery and Twitter Bootstrap's typeahead plugin
 * Based on tutorial:
 * http://tatiyants.com/how-to-use-json-objects-with-twitter-bootstrap-typeahead/
 * @class typeahead
 * @constructor
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.typeahead = function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	// private
	// ---------------------------
	var _keysList = [];
	var _keysToDetailsDict = {};

	var _scrubbedQuery = '';
	var _regex;
	var _words = [];

	var _re = {
		space: /\s{2,}/g,
		// everything except for alphanumeric gets nuked
		common: /([^a-z0-9]+)/gi,
		//treat quotes as invisible
		noise: /['`’-]/g
	};

	/**
	 * Scrapes HTML to build our list of
	 * keys, searchable text, and display text
	 * @method listFromHtml
	 */
	var listFromHtml = function() {

		$('li').each(function(index) {
			var $this = $(this);
			var plainText = crushText($this.text());
			var href = $this.children('a').attr('href');
			var key = href.toLowerCase();

			var html = $this.children('a').html();
			html = html.replace('<strong class="', '<span class="bigger ').replace('</strong>', '</span>');

			_keysToDetailsDict[key] = {
				// content displayed in drop down list
				html: html,
				// what we'll match against
				searchText: plainText,
				// unique key/id
				code: key,
				// when a selection is made this is the location we'll launch
				href: href
			};
			_keysList.push(key);
		});

	};

	var crushText = function(value) {
		return value
			.toLowerCase()
			.replace(_re.noise, '')
			.replace(_re.common, ' ')
			.replace(_re.space, ' ')
			.trim();
	};

	var _ta_source = function(query, process) {
		_scrubbedQuery = crushText(query);
		_words = _scrubbedQuery.split(' ');
		var regGroup = '';
		for (var i = 0; i < _words.length; i++) {
			_words[i] = _words[i].trim();
			if (_words[i].length > 0) {
				regGroup += (regGroup.length > 0 ? '|' : '') + _words[i];
			}
		}
		_regex = new RegExp('(' + regGroup + ')', 'gi');
		process(_keysList);
	};

	var _ta_updater = function(item) {
		window.location = _keysToDetailsDict[item].href;
		return _keysToDetailsDict[item].searchText;
	};

	var _ta_matcher = function(item) {
		var detailed = _keysToDetailsDict[item];
		for (var i = 0; i < _words.length; i++) {
			if (detailed.searchText.indexOf(_words[i]) == -1) {
				return false;
			}
		}
		return true;
	};

	var _ta_sorter = function(items) {
		return items.sort(function(a, b) {
			return (_keysToDetailsDict[a].searchText > _keysToDetailsDict[b].searchText);
		});
	};

	var _ta_highligher = function(item) {
		var $temp = $('<div/>').html(_keysToDetailsDict[item].html);

		$('em, .bigger', $temp).each(function(index) {
			var $ele = $(this);
			var text = $ele.html();
			$ele.html(text.replace(_regex, "<strong>$1</strong>"));
		});
		return $temp.html();
	};

	_public.initialize = function() {
		listFromHtml();

		$('#quickSearch')
			.typeahead({
				source: _ta_source,
				updater: _ta_updater,
				matcher: _ta_matcher,
				sorter: _ta_sorter,
				highlighter: _ta_highligher,
				minLength: 2,
				items: 50
			})
			.val('')
			.focus();
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
};
;/**
 * Resizes an overlay to fill the window (this is a 1.0, so "fill" is relative -- it gets much bigger)
 * @class resize
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.resize = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var $dlg = null;
	var $aceLayer = null;
	var $help = null;
	var editor = null;

	/**
	 * miliseconds to fade in/out editor
	 * @property FADE_SPEED
	 * @final
	 * @type {Number}
	 */
	var FADE_SPEED = 550;
	/**
	 * miliseconds to slide in/out sidebar (help) panel
	 * @property SLIDE_SPEED
	 * @final
	 * @type {Number}
	 */
	var SLIDE_SPEED = 400;

	/**
	 * Hold the current state of the dialog, we'll store this on the element in "data-sized" attribute
	 * @attribute isBig
	 * @type {Boolean}
	 */
	var isBig = false;

	var isHelpOpen = false;

	/**
	 * Initializer: preps handles and sets state varables.
	 * @method setup
	 * @private
	 * @return {void}
	 */
	var setup = function(dlgElement) {
		$dlg = $(dlgElement);
		$("body").append('<div id="aceHeader"><button class="aceSideBtn" title="Show options &amp; help"><span></span><span></span><span></span></button><strong>Edit Song</strong><a href="#exit-fullscreen">Exit fullscreen</a></div><div id="aceEditor"></div><div id="aceHelp"></div>');

		$aceLayer = $('#aceEditor');
		$aceLayer.fadeOut(1);

		$help = $('#aceHelp');

		$('#aceHeader a').click(function(e) {
			e.preventDefault();
			hideAce();
		});
		$('#aceHeader button').click(onShowHelpClicked);
	};

	var onShowHelpClicked = function(e) {
		e.preventDefault();
		showHelp(!isHelpOpen);
	};

	var showHelp = function(isShow) {
		isHelpOpen = isShow;

		if (isShow) {
			$help.animate({
				left: 0
			}, SLIDE_SPEED);
			$aceLayer.animate({
				left: '350px'
			}, SLIDE_SPEED);
		}
		else {
			$help.animate({
				left: '-350px'
			}, SLIDE_SPEED);
			$aceLayer.animate({
				left: 0
			}, SLIDE_SPEED);
		}
	};

	/**
	 * Returns the path of a linked script file (src) up to the starting position of fileName
	 * @method getPath
	 * @param  {string} fileName
	 * @return {string}
	 */
	var getPath = function(fileName) {
		var path = '',
			lower, pos;

		fileName = fileName.toLowerCase();

		$('script').each(function(index, item) {
			lower = item.src.toLowerCase();
			pos = lower.indexOf(fileName);
			if (pos > 0) {
				path = item.src.substr(0, pos);
			}
		});
		return path;
	};

	var showAce = function() {
		isBig = true;

		$('html').addClass('aceEditorActive');
		$('.overlay').fadeOut(300);

		if (editor !== null) {
			// editor has already been initialized, safe to continue
			copySongToAce();
			return;
		}

		// only execute this block once (thus the null check)
		var path = getPath('ugsEditorPlus');

		LazyLoad.js(path + '/ace/ace.js', function() {
			editor = ace.edit("aceEditor");
			editor.setTheme("ace/theme/idle_fingers");
			editor.getSession().setMode("ace/mode/chordpro");
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true
			});
			editor.completers = [ugsAce.chordCompleter];
			copySongToAce();

			$help.html(ugsAce.helpHtml);

		});
	};

	var copySongToAce = function() {
		$aceLayer.fadeIn(FADE_SPEED);
		editor.setValue($('#chordProSource').val());
		editor.gotoLine(1);
		$help.fadeIn(1);
	};

	/**
	 * Restores overlay to original position(-ish -- not finished)
	 * @method hideAce
	 * @private
	 * @return {void}
	 */
	var hideAce = function() {
		isBig = false;

		$dlg.show();
		$aceLayer.fadeOut(FADE_SPEED);
		$help.fadeOut(FADE_SPEED);
		if (editor !== null) {
			$('#chordProSource').val(editor.getValue());
		}

		$('html').removeClass('aceEditorActive');
		showHelp(false);
	};

	/**
	 * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
	 * @method toggle
	 * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
	 * @return {void}
	 */
	_public.toggle = function(dlgElement) {
		if ($dlg === null) {
			setup(dlgElement);
		}

		if (isBig) {
			hideAce();
		}
		else {
			showAce();
		}
		return false;
	};


	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;/**
 *
 * Dependencies: jQuery & ugsChordBuilder classes
 * @class chordBuilder
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.chordBuilder = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _builder = null;

	/**
	 * Standard event wire up and prep method. Handles "finding" the Builder's "Hand Cursor" based
	 * on the location of the background image used on the Finger Tool.
	 * @method  init
	 */
	_public.init = function() {
		var fingerToolImage = $('.fingerToolImage').css('background-image');
		ugsChordBuilder.settings.cursor.imageUri = fingerToolImage.replace(/url\("(.*)hand.png"\)/i, '$1hand-cursor.png');
		_builder = new ugsChordBuilder.editorUi();
		_builder.init();

		$('#cdBldOpenBtn').click(onShowDlgBtnClick);
	};

	/**
	 * Button/Link click handler (shows the Chord Builder Overlay)
	 * @method onShowDlgBtnClick
	 * @param  {event} evt
	 */
	var onShowDlgBtnClick = function(evt) {
		evt.preventDefault();
		_builder.reload();
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;/**
 * Exposes the only method required to attach UkeGeeks Scriptasaurus Song-a-matic editor functionality.
 *
 * @class songAmatic
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.songAmatic = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * attaches event handlers, preps variables, and runs UGS
	 * @method init
	 * @param options {OBJECT} (optional) Object/JSON with any of the ugsEditorPlus.options
	 * @return {void}
	 */
	_public.init = function(options) {
		var opts = mergeOptions(options);

		ukeGeeks.settings.opts.retainBrackets = !opts.hideChordEnclosures;
		$('#songSourceDlg').toggle(opts.showEditOnLoad);

		ukeGeeks.scriptasaurus.init(opts.useLegacyIe);

		ugsEditorPlus.actions.init();
		ugsEditorPlus.topMenus.init();
		ugsEditorPlus.submenuUi.init();
		ugsEditorPlus.optionsDlg.init();
		ugsEditorPlus.chordBuilder.init();
		ugsEditorPlus.actions.run();
	};

	var mergeOptions = function(options) {
		var opts = {
			hideChordEnclosures: !ukeGeeks.settings.opts.retainBrackets,
			sortAlphabetical: ukeGeeks.settings.opts.sortAlphabetical,
			ignoreCommonChords: ukeGeeks.settings.opts.ignoreCommonChords,
			commonChords: ukeGeeks.settings.commonChords
		};

		return $.extend(ugsEditorPlus.options, opts, (typeof options === "object") ? options : {});
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());
;/**
 * Library for an HTML5 WYSIWYG editor to build ChordPro chord define tags.
 * @module  ugsChordBuilder
 * @namespace ugsChordBuilder
 * @main  ugsChordBuilder
 */
var ugsChordBuilder = window.ugsChordBuilder || {};

/**
 * Entities (data containers) shared between the class libraries. Private
 * JSON objects used internally by a class are not included here.
 * @class entities
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.entities = {
	/**
	 * @class entities.BoundingBox
	 * @constructor
	 * @param  {Position} pos   Position (JSON) object
	 * @param  {JSON} dimensions JSON Object of form: {width: {int}, height: {int}}
	 */
	BoundingBox: function(pos, dimensions) {
		/**
		 * @property x
		 * @type {int}
		 */
		this.x = pos ? pos.x : 0;
		/**
		 * @property y
		 * @type {int}
		 */
		this.y = pos ? pos.y : 0;
		/**
		 * @property width
		 * @type {int}
		 */
		this.width = dimensions ? dimensions.width : 1;
		/**
		 * @property height
		 * @type {int}
		 */
		this.height = dimensions ? dimensions.height : 1;
	},

	/**
	 * Describes a fingering Dot on the fretboard
	 * @class entities.Dot
	 * @constructor
	 * @param  {int} string
	 * @param  {int} fret
	 * @param  {int} finger
	 */
	Dot: function(string, fret, finger) {
		/**
		 * String number, on sporano (GCEA), G is 0th string, and so on
		 * @property string
		 * @type {int}
		 */
		this.string = string;
		/**
		 * @property fret
		 * @type {int}
		 */
		this.fret = fret ? fret : 0;
		/**
		 * @property finger
		 * @type {int}
		 */
		this.finger = finger ? finger : 0;
	},

	/**
	 * @class entities.Position
	 * @constructor
	 * @param  {int} x
	 * @param  {int} y
	 */
	Position: function(x, y) {
		/**
		 * @property x
		 * @type {int}
		 */
		this.x = x ? x : 0;
		/**
		 * @property y
		 * @type {int}
		 */
		this.y = y ? y : 0;
	}
};

/**
 * "Properties, Options, Preferences" such as fretboard size and colors; dot attributes, the cursors, fonts etc.
 * @class settings
 * @namespace ugsChordBuilder
 * @static
 * @final
 * @singleton
 */
ugsChordBuilder.settings = (function() {
	// "Revealing Module Pattern"

	// dependencies:
	var ents = ugsChordBuilder.entities;

	//'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, sans-serif';
	/**
	 * San-serif font stack used when drawing text on Canvas.
	 * @property {String} FONT_STACK
	 * @final
	 * @constant
	 */
	var FONT_STACK = 'Arial, "Helvetica Neue", Helvetica, Verdana, sans-serif';

	/**
	 * Fretboard upper left hand corner position (pseudo-constants)
	 * @method anchorPos
	 * @type {Position}
	 * @static
	 */
	var anchorPos = {
		x: 75,
		y: 75
	};

	var cursor = {
		fillColor: 'rgba(220, 216, 73, 0.35)', // 'rgba(245, 127, 18, 0.3)',
		strokeWidth: 1,
		strokeColor: '#AAB444', // '#F57F12',
		radius: 9,
		imageUri: '/img/editor/hand-cursor.png'
	};

	var fretBoard = {
		numFrets: 5,
		maxFret: 16,
		stringNames: ['G', 'C', 'E', 'A'],
		strokeWidth: 4,
		strokeColor: '#8F8569',
		fretSpace: 35,
		stringSpace: 30
	};

	var dot = {
		fillColor: '#F68014',
		radius: 11,
		strokeWidth: 2,
		strokeColor: '#D56333',
		fontWeight: 'bold',
		fontFamily: FONT_STACK,
		fontSize: 16,
		fontColor: '#ffffff'
	};

	var fretLabel = {
		fontFamily: FONT_STACK,
		fontSize: 28, // Pixels
		color: '#6A6A63',
		lightColor: '#EAEAE8' //D6D6D6' //A4A4A3'
	};

	var stringLabel = {
		fontFamily: FONT_STACK,
		fontSize: 34, // Pixels
		color: '#DCD849' // #AAB444'//
	};

	var chord = {
		nameMaxLength: 20
	};

	/**
	 * Dimensions of a single target
	 * @method targetDimensions
	 * @return {JSON} {width: ?, height: ? }
	 */
	var targetDimensions = function() {
		return {
			height: fretBoard.fretSpace,
			width: fretBoard.stringSpace
		};
	};

	/**
	 * Top left-hand corner where Targets begin positioning
	 * @method targetAnchorPos
	 * @return {postion}
	 */
	var targetAnchorPos = function() {
		var dimensions = targetDimensions();
		return new ents.Position(
			anchorPos.x - 0.5 * dimensions.width,
			anchorPos.y - dimensions.height - 0.2 * fretBoard.strokeWidth
		);
	};

	/**
	 * re-centers the fretboard's anchor position
	 * @method centerFretboard
	 * @param  {element} canvas
	 * @return {void}
	 */
	var centerAnchor = function(canvas) {
		anchorPos.x = (0.5 * canvas.width) - (0.5 * (fretBoard.stringNames.length - 1) * fretBoard.stringSpace) - fretBoard.strokeWidth;
		anchorPos.y = (0.5 * canvas.height) - (0.5 * fretBoard.numFrets * fretBoard.stringSpace);
	};

	return {
		// Properties
		anchorPos: anchorPos,
		cursor: cursor,
		fretBoard: fretBoard,
		dot: dot,
		fretLabel: fretLabel,
		stringLabel: stringLabel,
		chord: chord,
		// Methods
		targetDimensions: targetDimensions,
		targetAnchorPos: targetAnchorPos,
		centerAnchor: centerAnchor
	};
}());

/**
 * Tracks curor position relative to fretboard's hot (clickable) regions
 * @class tracking
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.tracking = (function() {
	// dependencies:
	var ents = ugsChordBuilder.entities,
		settings = ugsChordBuilder.settings;

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var targetBox = null;

	var getTarget = function() {
		if (targetBox) {
			return targetBox;
		}

		var dimensions = settings.targetDimensions();
		dimensions.width = dimensions.width * settings.fretBoard.stringNames.length;
		dimensions.height = dimensions.height * (settings.fretBoard.numFrets + 1);
		targetBox = new ents.BoundingBox(settings.targetAnchorPos(), dimensions);

		return targetBox;
	};

	/**
	 * Returns TRUE if the two objects overlap
	 * @method  collision
	 * @param  {BoundingBox} object1
	 * @param  {BoundingBox} object2
	 * @return {bool}
	 */
	var collision = function(object1, object2) {
		return (object1.x < object2.x + object2.width) && (object1.x + object1.width  > object2.x) && (object1.y < object2.y + object2.height) && (object1.y + object1.height > object2.y);
	};

	/**
	 * Converts position (x,y) to the fret
	 * @method toDot
	 * @param  {position} pos
	 * @return {dot}
	 */
	_public.toDot = function(pos) {
		var cursorBox = new ents.BoundingBox(pos);
		var box = getTarget();
		if (!collision(cursorBox, box)) {
			return null;
		}

		var dimensions = settings.targetDimensions();
		return new ents.Dot(
			Math.floor((pos.x - box.x) / dimensions.width),
			Math.floor((pos.y - box.y) / dimensions.height)
		);
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());

/**
 * Did I overlook this or was it deliberate? Either case, the "fret" in the dot object is
 * merely the fret in the visible diagram -- that is, a value between 0 and maxFrets, not
 * the actual fret on the instrument... beware.
 *
 * Unless otherwise stated all "dot" parames are of type ugsChordBuilder.entities.dot
 * @class fretDots
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.fretDots = (function() {
	// dependencies:
	var ents = ugsChordBuilder.entities,
		anchor_pos = ugsChordBuilder.settings.anchorPos,
		opts_board = ugsChordBuilder.settings.fretBoard,
		opts_dot = ugsChordBuilder.settings.dot;

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	// locals
	var _dots = [];

	_public.getDots = function() {
		return _dots.slice();
	};

	_public.slide = function(numSteps) {
		if (!inRange(numSteps)) {
			return false;
		}
		for (var i = 0; i < _dots.length; i++) {
			_dots[i].fret = _dots[i].fret + numSteps;
		}
		return true;
	};

	var inRange = function(numSteps) {
		for (var i = 0; i < _dots.length; i++) {
			if ((_dots[i].fret + numSteps < 1) || (_dots[i].fret + numSteps > opts_board.numFrets)) {
				return false;
			}
		}
		return true;
	};

	_public.toggleDot = function(dot) {
		if (dot.fret == 0) {
			clearColumn(dot.string);
			return;
		}

		var index = find(dot);
		if (index < 0) {
			_dots.push(dot);
		}
		else {
			_dots.splice(index, 1);
		}
	};

	_public.toggleFinger = function(dot, finger) {
		var index = find(dot);
		if (index < 0) {
			return false;
		}

		_dots[index].finger = _dots[index].finger == finger ? 0 : finger;
		return true;
	};

	/**
	 * Clears all saved dots.
	 * @method reset
	 */
	_public.reset = function() {
		for (var i = 0; i < opts_board.stringNames.length; i++) {
			clearColumn(i);
		}
	};

	/**
	 * Returns index of Dot within _dots or -1 if not found.
	 * @method find
	 * @param  {entities.dot} dot
	 * @return {int}
	 */
	var find = function(dot) {
		for (var i = _dots.length - 1; i >= 0; i--) {
			if (_dots[i].string == dot.string && _dots[i].fret == dot.fret) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Clears all dots for a particular string.
	 * @method clearColumn
	 * @param string {int}
	 */
	var clearColumn = function(string) {
		for (var i = _dots.length - 1; i >= 0; i--) {
			if (_dots[i].string == string) {
				_dots.splice(i, 1);
			}
		}
	};

	var getPosition = function(dot) {
		return new ents.Position(
			anchor_pos.x + 0.47 * opts_board.strokeWidth + dot.string * opts_board.stringSpace,
			anchor_pos.y + 0.47 * opts_board.strokeWidth + (dot.fret - 0.5) * opts_board.fretSpace
		);
	};

	var drawDot = function(context, pos) {
		context.beginPath();
		context.arc(pos.x, pos.y, opts_dot.radius, 0, 2 * Math.PI, false);
		context.fillStyle = opts_dot.fillColor;
		context.fill();
		context.lineWidth = opts_dot.strokeWidth;
		context.strokeStyle = opts_dot.strokeColor;
		context.stroke();
	};

	var addLabel = function(context, pos, text) {
		context.font = opts_dot.fontWeight + ' ' + opts_dot.fontSize + 'px ' + opts_dot.fontFamily;
		context.textAlign = 'center';
		context.fillStyle = opts_dot.fontColor;
		context.fillText(text, pos.x, pos.y + 0.3 * opts_dot.fontSize);
	};

	_public.draw = function(context) {
		for (var i = _dots.length - 1; i >= 0; i--) {
			var pos = getPosition(_dots[i]);
			drawDot(context, pos);
			if (_dots[i].finger > 0) {
				addLabel(context, pos, _dots[i].finger);
			}
		}
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());

/**
 * Plots cursor moving across its own canvas context.
 * @class cursorCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.cursorCanvas = (function() {
	// dependencies
	var opts_cursor = ugsChordBuilder.settings.cursor,
		opts_dot = ugsChordBuilder.settings.dot;

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _context = null;

	var _handImage = null;
	var _imgOk = false;

	var _dotCursor = true;
	var _finger = 1;

	var _lastPos = {
		x: 0,
		y: 0
	};

	_public.init = function(ctx) {
		_context = ctx;
		loadImage();
	};

	var erase = function(pos) {
		var radius = opts_cursor.radius + opts_cursor.strokeWidth;
		// Need to allow for dot, image, and the finger number -- magic number for now:
		_context.clearRect(pos.x - radius, pos.y - radius, radius + 50, radius + 60);
		/*
		if (_imgOk) {
			_context.clearRect(pos.x - radius, pos.y - radius, radius + _handImage.width, radius + _handImage.height);
		} else {
			_context.clearRect(pos.x - radius, pos.y - radius, 2 * radius, 2 * radius);
		}
		*/
	};

	var drawHandCursor = function(pos) {
		_context.drawImage(_handImage, pos.x, pos.y);

		_context.font = opts_dot.fontWeight + ' ' + opts_dot.fontSize + 'px ' + opts_dot.fontFamily;
		_context.textAlign = 'left';
		_context.fillStyle = 'black'; //opts_dot.fontColor;
		_context.fillText(_finger, pos.x + 0.8 * _handImage.width, pos.y + _handImage.height);
		// not centering pos.x - 0.5 * _handImage.width, pos.y - 0.5 * _handImage.height);
	};

	var loadImage = function() {
		_handImage = new Image();
		_handImage.onload = function() {
			_imgOk = true;
		};
		_handImage.src = opts_cursor.imageUri;
	};

	var drawDotCursor = function(pos) {
		_context.beginPath();
		_context.arc(pos.x, pos.y, opts_cursor.radius, 0, 2 * Math.PI, false);
		_context.fillStyle = opts_cursor.fillColor;
		_context.fill();
		_context.lineWidth = opts_cursor.strokeWidth;
		_context.strokeStyle = opts_cursor.strokeColor;
		_context.stroke();
	};

	_public.setCursor = function(isDot, finger) {
		_dotCursor = isDot;
		_finger = finger;
	};

	_public.draw = function(pos) {
		erase(_lastPos);
		if (!_imgOk || _dotCursor) {
			drawDotCursor(pos);
		}
		else {
			drawHandCursor(pos);
		}
		_lastPos = pos;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());

/**
 * Plots chord diagram (fretboard with fret labels) on its canvas context.
 * @class chordCanvas
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.chordCanvas = (function() {

	// dependencies
	var ents = ugsChordBuilder.entities,
		center_anchor = ugsChordBuilder.settings.centerAnchor,
		anchor_pos = ugsChordBuilder.settings.anchorPos,
		opt_fLabel = ugsChordBuilder.settings.fretLabel,
		opt_sLabel = ugsChordBuilder.settings.stringLabel,
		opts_board = ugsChordBuilder.settings.fretBoard;

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _context = null,
		_canvas = null;

	_public.init = function(ctx, ele) {
		_context = ctx;
		_canvas = ele;
		center_anchor(_canvas);
	};

	var erase = function() {
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
	};

	var addLabel = function(text, color, pos) {
		_context.font = opt_fLabel.fontSize + 'px ' + opt_fLabel.fontFamily;
		_context.textAlign = 'right';
		_context.fillStyle = color;
		_context.fillText(text, pos.x, pos.y);
	};

	var addLabels = function(startingFret) {
		var pos = new ents.Position(
			anchor_pos.x - 0.3 * opt_fLabel.fontSize,
			anchor_pos.y + opt_fLabel.fontSize
		);
		var color = startingFret > 1 ? opt_fLabel.color : opt_fLabel.lightColor;
		for (var i = 0; i < opts_board.numFrets; i++) {
			addLabel(startingFret + i, color, pos);
			pos.y += opts_board.fretSpace;
			color = opt_fLabel.lightColor;
		}
	};

	var addStringName = function(text, pos) {
		_context.font = opt_sLabel.fontSize + 'px ' + opt_sLabel.fontFamily;
		_context.textAlign = 'center';
		_context.fillStyle = opt_sLabel.color;
		_context.fillText(text, pos.x, pos.y);
	};

	var addStringNames = function() {
		var pos = new ents.Position(
			anchor_pos.x + 0.5 * opts_board.strokeWidth,
			anchor_pos.y - 0.25 * opt_fLabel.fontSize
		);

		for (var i = 0; i < opts_board.stringNames.length; i++) {
			addStringName(opts_board.stringNames[i], pos);
			pos.x += opts_board.stringSpace;
		}
	};

	var drawFretboard = function() {
		var i, x, y;

		// width offset, a "subpixel" adjustment
		var offset = opts_board.strokeWidth / 2;
		// locals
		var stringHeight = opts_board.numFrets * opts_board.fretSpace;
		var fretWidth = (opts_board.stringNames.length - 1) * opts_board.stringSpace;
		// build shape
		_context.beginPath();
		// add "C" & "E" strings
		for (i = 1; i < (opts_board.stringNames.length - 1); i++) {
			x = anchor_pos.x + i * opts_board.stringSpace + offset;
			_context.moveTo(x, anchor_pos.y + offset);
			_context.lineTo(x, anchor_pos.y + stringHeight + offset);
		}
		// add frets
		for (i = 1; i < opts_board.numFrets; i++) {
			y = anchor_pos.y + i * opts_board.fretSpace + offset;
			_context.moveTo(anchor_pos.x + offset, y);
			_context.lineTo(anchor_pos.x + fretWidth + offset, y);
		}
		//
		_context.rect(anchor_pos.x + offset, anchor_pos.y + offset, fretWidth, stringHeight);
		// stroke shape
		_context.strokeStyle = opts_board.strokeColor;
		_context.lineWidth = opts_board.strokeWidth;
		_context.stroke();
		_context.closePath();
	};

	_public.draw = function(pos, startingFret) {
		erase();
		// ugsChordBuilder.debugTargets.drawTargets(_context);
		addLabels(startingFret);
		addStringNames();
		drawFretboard();
		ugsChordBuilder.fretDots.draw(_context);
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());

/**
 *
 * @class export
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.export = (function() {
	// dependencies
	var opts_board = ugsChordBuilder.settings.fretBoard,
		opts_chord = ugsChordBuilder.settings.chord;

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _fretOffset = null;

	/**
	 * Class for "reorganized" dots, think of this as a necklace where the
	 * thread, the instrument string, has zero or more beads, or dots -- fret plus finger
	 * @class  StringDots
	 * @constructor
	 * @private
	 * @param  {int} string
	 * @param  {dot_Array} dots
	 */
	var StringDots = function(string, dots) {
		this.string = string;
		this.dots = dots ? dots : [];
		//this.fingers = fingers ? fingers : [];
	};

	var getStringDots = function() {
		// initialize empty string array
		var stringNumber,
			aryStringDots = [];
		for (stringNumber = 1; stringNumber <= opts_board.stringNames.length; stringNumber++) {
			aryStringDots.push(new StringDots(stringNumber));
		}

		// add dots
		var dots = ugsChordBuilder.fretDots.getDots();
		for (stringNumber = aryStringDots.length - 1; stringNumber >= 0; stringNumber--) {
			for (var i = dots.length - 1; i >= 0; i--) {
				if (aryStringDots[stringNumber].string == dots[i].string + 1) {
					aryStringDots[stringNumber].dots.push(dots[i]);
				}
			}
		}

		return aryStringDots;
	};

	/**
	 * Returns the minimum & maximum fret found withing array (of dots)
	 * @method getMinMax
	 * @param  {dot_array} ary
	 * @return {JSON}
	 */
	var getMinMax = function(ary) {
		var max = 0;
		var min = 900;
		for (var i = ary.length - 1; i >= 0; i--) {
			if (ary[i].fret > max) {
				max = ary[i].fret;
			}
			if (ary[i].fret < min) {
				min = ary[i].fret;
			}
		}
		return {
			max: max,
			min: (min < 900) ? min : max
		};
	};

	/**
	 * Handles the offset, translates from fret (on the diagram's N frets) to the insturment's complete fretbaord
	 * @method  fretNumber
	 * @param  {int} fret
	 * @return {int}
	 */
	var fretNumber = function(fret) {
		return fret > 0 ? _fretOffset + fret : 0;
	};

	/**
	 * Not too surprisingly this finds "fret" within dots and returns finger. If there isn't a dot
	 * for fret returns zed.
	 * @method  getFinger
	 * @param  {array} dots
	 * @param  {int} fret
	 * @return {int}
	 */
	var getFinger = function(dots, fret) {
		for (var i = 0; i < dots.length; i++) {
			if (dots[i].fret == fret) {
				return dots[i].finger;
			}
		}
		return 0;
	};

	/**
	 * Returns an array of ints, one for each string, with the HIGHEST REAL fret appearing on that string.
	 * Default is zed per string.
	 * @method getPrimaryFrets
	 * @param  {int} startingFret
	 * @return {int}
	 */
	_public.getPrimaryFrets = function(startingFret) {
		_fretOffset = startingFret - 1;
		var dotsPerString = getStringDots();
		var primaries = [];
		for (var i = 0; i < dotsPerString.length; i++) {
			var minMax = getMinMax(dotsPerString[i].dots);
			primaries.push(fretNumber(minMax.max));
		}
		return primaries;
	};

	/**
	 * Returns complete ChordPro definition statement
	 * @method getDefinition
	 * @param  {string} chordName
	 * @param  {int} startingFret
	 * @return {string}
	 */
	_public.getDefinition = function(chordName, startingFret) {
		chordName = scrub(chordName);
		var name = (chordName && chordName.length > 0) ? chordName : 'CHORDNAME';
		var fretsStr = '';
		var fingersString = '';
		var addsString = '';

		_fretOffset = startingFret - 1;
		var dotsPerString = getStringDots();
		for (var i = 0; i < dotsPerString.length; i++) {
			var minMax = getMinMax(dotsPerString[i].dots);
			fretsStr += fretNumber(minMax.max) + ' ';
			fingersString += getFinger(dotsPerString[i].dots, minMax.max) + ' ';
			if (minMax.max != minMax.min) {
				addsString += ' add: string ' + dotsPerString[i].string + ' fret ' + fretNumber(minMax.min) + ' finger ' + getFinger(dotsPerString[i].dots, minMax.min);
			}
		}

		// no double spaces, no space before the closing "}"
		return ('{define: ' + name + ' frets ' + fretsStr + ' fingers ' + fingersString + addsString + '}').replace(/\s+/g, ' ').replace(' }', '}');
	};

	/**
	 * Returns "highlighted" (HTML-ified) ChordPro definition statement.
	 * @method getDefinition
	 * @param  {string} chordName
	 * @param  {int} startingFret
	 * @return {string}
	 */
	_public.getDefinitionHtml = function(chordName, startingFret) {
		chordName = scrub(chordName);
		// Keep regexs simple by a couple cheats:
		// First, using 'X07MX001' as my CSS clasname prefix to avoid collisions.
		// We temporarily remove the name, then put it back in the very last step.
		var html = _public.getDefinition(chordName, startingFret);
		html = html.replace(' ' + chordName, ' ' + 'X07Myq791wso01');
		html = html.replace(/\b(\d+)\b/g, '<span class="chordPro-X07MX001number">$1</span>');
		html = html.replace(/\b(frets?|fingers?|string)\b/g, '<span class="chordPro-X07MX001attribute">$1</span>');
		html = html.replace(/\b(define|add)\b/g, '<span class="chordPro-X07MX001keyword">$1</span>');
		return html
			.replace('X07Myq791wso01', '<span class="chordPro-string">' + chordName + '</span>')
			.replace(/X07MX001/g, '')
			.replace(/ +/g, ' ');
	};

	/**
	 * Returns "safe" version of chord name, removing disallowed characters and reserved names (such as "add:")
	 * @method scrub
	 * @param  {string} chordName
	 * @return {string}
	 */
	var scrub = function(name) {
		// paranoia protection: no reserved words (makes life easier for parsing)
		var disallow = /^(frets|fingers|add:)$/i;
		// trim leading & trailing spaces, internal spaces get smushed into single dash
		var cleaned = name.replace(/^\s*(.*?)\s*$/, '$1').replace(/\s+/g, '-');
		if (disallow.test(cleaned)) {
			cleaned = '';
		}
		return cleaned.substring(0, opts_chord.nameMaxLength);
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;/**
 *
 * @class chooserList
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.chooserList = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	// array of custom chords defined in this song
	var _chordDictionary = [];
	// handle to HTML UL element
	var _eleChordList = null;

	/**
	 * magic value for start a new chord (constant)
	 * @final
	 * @attribute C_NEW_CHORD
	 * @type {Int}
	 */
	var C_NEW_CHORD = -1;

	// next available Id used on LI's
	var _nextId = 0;

	// HTML element Ids
	var _ids = {
		// ChordPro Song -- the unmodified source
		source: 'chordProSource',
		// the UL where we'll be loading the chords
		chordList: 'cdBldPick',
		builderPanel: 'cdBldBuilderPanel',
		chooserPanel: 'cdBldChooserPanel'
	};

	/**
	 * Chord current sent to the editor.
	 * @attribute _currentChord
	 */
	var _currentChord = null;

	/**
	 * Handle to the chordBuilder (UI) "setChord" method
	 * @attribute _setChordMethod
	 */
	var _setChordMethod = function() {};

	/**
	 * Hanlde to instance of Scriptasaurus chord brush class, to paint the wee little
	 * chord diagrams onto the Chooser List.
	 * @attribute _ugsBrushTool
	 * @type {Object}
	 */
	var _ugsBrushTool = null;

	/**
	 * Required settings for the Chord Brush -- dimensions, fonts, and colors.
	 * @attribute _diagramSettings
	 * @type {JSON}
	 */
	var _diagramSettings = {
		dimensions: {
			showText: false,
			height: 50,
			width: 40,
			fretSpace: 9,
			stringSpace: 7,
			dotRadius: 3,
			lineWidth: 1,
			topLeftPos: {
				x: 10,
				y: 2
			},
			xWidth: 0.7 * 7,
			xStroke: 1.4 * 1
		},
		fonts: {
			dot: '8pt Arial',
			text: '8pt Arial',
			fret: '8pt Arial'
		},
		colors: {
			fretLines: '#EED18E',
			dots: '#551D00', //'#9A532D',
			dotText: '#ffffff',
			text: '#000000',
			fretText: '#EED18E',
			xStroke: '#551D00'
		}
	};

	/**
	 * entity for storing raw chord info; attached to the LI via id
	 * @class ChordDefinition
	 * @param {string} name
	 * @param {string} definition
	 */
	var ChordDefinition = function(name, definition) {
		this.id = _nextId++;
		this.name = name;
		this.definition = definition;
	};

	/**
	 * @method init
	 * @param  {function} setChordFunction
	 */
	_public.init = function(setChordFunction) {
		_setChordMethod = setChordFunction;
		_eleChordList = document.getElementById(_ids.chordList);
		// attach click handler to the UL avoids need to attach to individual LI items (these get added & deleted frequently)
		_eleChordList.addEventListener('click', onClick, false);
		_start();
	};

	var _start = function() {
		songGetDefinitions(document.getElementById(_ids.source).value);
		listLoad(_eleChordList, _chordDictionary);
	};

	_public.reset = function() {
		_chordDictionary = [];
		document.getElementById(_ids.chordList).innerHTML = '';
		_nextId = 0;
		_currentChord = null;
		_start();
	};

	/**
	 * Shows either the "Chooser" or "Chord Builder/Editor" panel.
	 * @method show
	 * @public
	 * @param {bool} isChooserPanel
	 */
	_public.show = function(isChooserPanel) {
		document.getElementById(_ids.chooserPanel).style.display = isChooserPanel ? 'block' : 'none';
		document.getElementById(_ids.builderPanel).style.display = !isChooserPanel ? 'block' : 'none';
		$('#' + _ids.chooserPanel).closest('.overlay').toggleClass('chordBuilderNarrow', isChooserPanel);
	};

	/**
	 * Returns TRUE if Save completed OK, false otherwise (duplicate name or unable to update)
	 * @method save
	 * @param  {JSON} data
	 * @return {bool}
	 */
	_public.save = function(data) {
		if (dictionaryFindDupes(_currentChord == null ? -1 : _currentChord.id, data.name) >= 0) {
			alert('Hey, this chord name is already being used.');
			return false;
		}
		var id = -1;
		if (_currentChord == null) {
			id = definitionAdd(data.name, data.definition);
			_currentChord = dictionaryFind(id);
			songAddDefinition(data.definition);
		}
		else {
			var i = dictionaryGetIndex(_currentChord.id);
			if (i < 0) {
				// console.log('error: not found');
				return false;
			}
			var oldDefinition = _chordDictionary[i].definition;
			_chordDictionary[i].name = data.name;
			_chordDictionary[i].definition = data.definition;
			id = _chordDictionary[i].id;
			songReplace(oldDefinition, _chordDictionary[i].definition);
		}
		listUpdate(id);
		_public.show(true);
		return true;
	};

	/**
	 * Handles confirming & removing a chord from the list and the song.
	 * @method doDelete description]
	 * @param  {ChordDefinition} chord
	 * @return {void}
	 */
	var doDelete = function(chord) {
		if (!confirm('Delete definition for "' + chord.name + '"?')) {
			return;
		}
		var item = listGetItem(chord.id);
		if (!item) {
			return;
		}
		_eleChordList.removeChild(item);
		songReplace(chord.definition, '');

	};

	/**
	 * ListItem click event handler
	 * @method onClick
	 * @param  {Event} evt
	 */
	var onClick = function(evt) {
		evt.preventDefault();
		_currentChord = dictionaryFind(evt.target.getAttribute('data-id'));
		if (evt.target.getAttribute('data-action') == 'delete') {
			doDelete(_currentChord);
			return;
		}

		var chord = null;
		if (_currentChord != null) {
			chord = ukeGeeks.chordImport.runLine(_currentChord.definition);
			if (hasMutedStrings(chord)) {
				alert('Uh-oh! This chord uses muted strings!\nCurrently the Chord Builder does not support muted strings -- \nsaving edits will result in mutes being lost.');
			}
		}
		_setChordMethod(chord);
		_public.show(false);
	};

	/**
	 * Checks whether any of the Chord's strings have been muted.
	 * @method hasMutedStrings
	 * @param  {ugs.chord}  chord
	 * @return {Boolean}
	 */
	var hasMutedStrings = function(chord) {
		if (chord.muted) {
			for (var i = 0; i < chord.muted.length; i++) {
				if (chord.muted[i]) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * updates an exiting HTML ListItem (LI) using the info stored for Id in
	 * the chord dictionary (array). Appends new ListItem if not found.
	 * @method listUpdate
	 * @param  {int} id
	 * @return {DOM_LI}
	 */
	var listUpdate = function(id) {
		var def = dictionaryFind(id);
		var item = listGetItem(id);
		if (!item) {
			item = listAddItem(id, def.name);
		}
		else {
			item.innerHTML = listHtmlString(id, def.name, true);
		}
		listAddDiagram(id);
		return item;
	};

	/**
	 * finds the HTML ListItem corresponding to Id
	 * @method listGetItem
	 * @param  {int} id
	 * @return {DOM_LI}
	 */
	var listGetItem = function(id) {
		var items = _eleChordList.getElementsByTagName('li');
		for (var i = 0; i < items.length; i++) {
			if (items[i].getAttribute('data-id') == ('' + id)) {
				return items[i];
			}
		}
		return null;
	};

	/**
	 * Returns HTML snippet for an LI
	 * @method listHtmlString
	 * @param  {int} id
	 * @param  {string} name
	 * @param  {bool} isInner (optional) if TRUE only reutrns the inner HTML part, otherwise returns complete LI tag
	 * @return {string}
	 */
	var listHtmlString = function(id, name, isInner) {
		isInner = (arguments.length > 2) ? isInner : false;
		var innerHtml = '<span class="deleteChord" data-id="' + id + '" data-action="delete" title="Remove this definition"></span>' + name;
		return isInner ? innerHtml : '<li data-id="' + id + '" title="Edit this definition" class="ugs-grouped">' + innerHtml + '</li>';
	};

	/**
	 * Clears and loads the HTML UL using currently values in Chord Dictionary
	 * @method listLoad
	 * @param {DOM_UL} ul
	 * @param {array} chordDefs
	 */
	var listLoad = function(ul, chordDefs) {
		var i, s = '';
		for (i = 0; i < chordDefs.length; i++) {
			s += listHtmlString(chordDefs[i].id, chordDefs[i].name);
		}
		ul.innerHTML = '<li data-id="' + C_NEW_CHORD + '" class="newChord">+ Add New Chord</li>' + s;

		var items = ul.getElementsByTagName('li');
		for (i = items.length - 1; i >= 0; i--) {
			if (i < 1) {
				continue;
			}
			listAddDiagram(items[i].getAttribute('data-id'));
		}
	};

	/**
	 * Appends a new HTML ListItem to our UL.
	 * @method listAddItem
	 * @param  {int} id
	 * @param  {string} name
	 */
	var listAddItem = function(id, name) {
		var temp = document.createElement('ul');
		temp.innerHTML = listHtmlString(id, name);
		_eleChordList.appendChild(temp.childNodes[0]);
	};

	/**
	 * Adds mini-chord diagram to the list item found by Id.
	 * @method listAddDiagram
	 */
	var listAddDiagram = function(id) {
		var element = listGetItem(id);
		var defintion = dictionaryFind(id);
		var chord = ukeGeeks.chordImport.runLine(defintion.definition);
		//var fretBox = ukeGeeks.settings.inlineFretBox;
		//var fontSettings = ukeGeeks.settings.inlineFretBox.fonts;
		if (_ugsBrushTool == null) {
			_ugsBrushTool = new ukeGeeks.chordBrush();
		}
		_ugsBrushTool.plot(element, chord, _diagramSettings.dimensions, _diagramSettings.fonts, _diagramSettings.colors);
	};

	/**
	 * Using just a bit of recursion performs as advertised: replaces all occurences of
	 * searchValue with newValue within text (haystack).
	 * DANGER: it is, of course, for this to get hung in an infinite loop if new value
	 * inclues complete search value. :D
	 * @method replaceAll
	 * @param  {string} text
	 * @param  {string} searchValue
	 * @param  {string} newValue
	 * @return {string}
	 */
	var replaceAll = function(text, searchValue, newValue) {
		var newText = text.replace(searchValue, newValue);
		return (newText == text) ? text : replaceAll(newText, searchValue, newValue);
	};

	/**
	 * Updates Source and Runs Scriptasaurus after updaint the definition
	 * @method songReplace
	 * @param  {string} oldDefinition
	 * @param  {string} newDefinition
	 * @return {void}
	 */
	var songReplace = function(oldDefinition, newDefinition) {
		var e = document.getElementById(_ids.source);
		e.value = replaceAll(e.value, oldDefinition, newDefinition);
		ugsEditorPlus.actions.run();
	};

	/**
	 * Loops over all lines in "text" and extracts any {define:...} statements, adding
	 * them to the ChordDictionary.
	 * @method songGetDefinitions
	 */
	var songGetDefinitions = function(text) {
		var defineRegEx = /\{define:\s*([^}]+?)\s+frets[^}]+?\}/im;
		var lines = text.split('\n');
		for (var i = lines.length - 1; i >= 0; i--) {
			if (!defineRegEx.test(lines[i])) {
				continue;
			}
			definitionAdd(lines[i].replace(defineRegEx, '$1'), lines[i]);
		}
	};

	/**
	 * Inserts the passed chord definition into the song (and reruns Sscriptasaurus).
	 * The chord insertion point is at the end of either the song meta tags or the
	 * existing chord defintion block. Determined by the _last_ "header" tag line.
	 * @method songAddDefinition
	 * @param {string} definition
	 */
	var songAddDefinition = function(definition) {
		var choProText = document.getElementById(_ids.source);
		var instructionRegEx = /\s*\{\s*(title|t|artist|subtitle|st|album|define):.*?\}/im;
		var lines = choProText.value.split('\n');
		var html = '';
		var inserted = false;
		for (var i = lines.length - 1; i >= 0; i--) {
			if (!inserted && instructionRegEx.test(lines[i])) {
				html = definition + '\n' + html;
				inserted = true;
			}
			html = lines[i] + '\n' + html;
		}
		if (!inserted) {
			html = definition + '\n' + choProText.value;
		}
		choProText.value = html;
		ugsEditorPlus.actions.run();
	};

	/**
	 * Returns Index of Id within the chord Dictionary or -1 if not found.
	 * @method dictionaryGetIndex
	 * @param  {int} id
	 * @return {int}
	 */
	var dictionaryGetIndex = function(id) {
		for (var i = 0; i < _chordDictionary.length; i++) {
			if ('' + _chordDictionary[i].id == id) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * Returns index of the duplicate chord name. Pass in Id of the chord to be ignored,
	 * (i.e. the one currently being edited). Comparison ignores case. Returns -1 if no
	 * dupe is found.
	 * @method dictionaryFindDupes
	 * @param  {int} id
	 * @param  {string} name
	 * @return {int}
	 */
	var dictionaryFindDupes = function(id, name) {
		var search = name.toLowerCase();
		for (var i = _chordDictionary.length - 1; i >= 0; i--) {
			if (('' + _chordDictionary[i].id != '' + id) && (_chordDictionary[i].name.toLowerCase() == search)) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Returns the entry for Id from Chord Dictionary
	 * @method dictionaryFind
	 * @param  {int} id
	 * @return {ChordDefinition}
	 */
	var dictionaryFind = function(id) {
		var i = dictionaryGetIndex(id);
		return i >= 0 ? _chordDictionary[i] : null;
	};

	/**
	 * Adds new chord definition to our Dictionary array. Returns the
	 * new item's Id (int).
	 * @method definitionAdd
	 * @param {string} name
	 * @param {string} definition
	 * @return {int}
	 */
	var definitionAdd = function(name, definition) {
		var chord = new ChordDefinition(name, definition);
		_chordDictionary.push(chord);
		return chord.id;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;/**
 * Doing
 * @class editorUi
 * @constructor
 * @namespace ugsChordBuilder
 */
ugsChordBuilder.editorUi = function() {

	var _ids = {
		// top-most container, the "master drawing surface"
		container: 'cdBldEditorSurface',
		// stacked canvas elements
		cursorCanvas: 'cdBldCursorCanvas',
		diagramCanvas: 'cdBldDiagramCanvas',
		// chord definition meta: name & fret
		startingFret: 'cdBldStartingFret',
		chordName: 'cdBldChordName',
		// container wrapping sliding toolbox pallet
		toolbox: 'cdBldToolbox',
		// toolbox buttons:
		dotsBtn: 'cdBldDotsBtn',
		fingersBtn: 'cdBldFingersBtn',
		slideUpBtn: 'toolboxSlideUpBtn',
		slideDownBtn: 'toolboxSlideDownBtn',
		// display on "Hand" toolbox button
		btnFingerName: 'cdBldBtnFingerName',
		btnHandPic: 'cdBldBtnDiagram',
		// container for generated chordPro "define" tag (colorized)
		output: 'cdBldOutput',
		// show/hide definition output & container where we'll stuff the colorized definition
		showOutputBtn: 'cdBldShowOutputBtn',
		outputBox: 'cdBldOutputBox',
		cancelBtn: 'cdBldCancelBtn',
		saveBtn: 'cdBldSaveBtn'
		// openBtn: 'cdBldOpenBtn'
	};

	var _cursorCanvas = null,
		_eleDotsBtn = null,
		_eleFingerBtn = null;

	var _startingFret = 1;
	var _currentName = '';

	var _isDotToolActive = true;
	var _finger = 0;

	/**
	 * A "reverse Enum" dictionary of finger number to description
	 * @attribute _fingerNames
	 * @type {JSON}
	 */
	var _fingerNames = {
		0: 'None',
		1: 'Index finger',
		2: 'Middle finger',
		3: 'Ring finger',
		4: 'Pinkie'
	};

	/**
	 * Returns FALSE if canvas is not supported
	 * @method init
	 * @return {bool}
	 */
	this.init = function() {
		_cursorCanvas = document.getElementById(_ids.cursorCanvas);
		if (!_cursorCanvas.getContext) {
			return false;
		}

		var cursorContext = _cursorCanvas.getContext('2d');
		var diagramContext = document.getElementById(_ids.diagramCanvas).getContext('2d');

		var ele = document.getElementById(_ids.startingFret);
		addStartingFretOptions(ele);
		ele.addEventListener('change', onFretChange, false);

		document.getElementById(_ids.chordName).addEventListener('keyup', onNameChange, false);

		_eleDotsBtn = document.getElementById(_ids.dotsBtn);
		_eleFingerBtn = document.getElementById(_ids.fingersBtn);
		_eleDotsBtn.addEventListener('click', toggleTool, false);
		_eleFingerBtn.addEventListener('click', toggleTool, false);

		document.getElementById(_ids.showOutputBtn).addEventListener('click', showOutputBox, false);
		document.getElementById(_ids.cancelBtn).addEventListener('click', onCancelClick, false);
		document.getElementById(_ids.saveBtn).addEventListener('click', onSaveClick, false);

		document.getElementById(_ids.slideUpBtn).addEventListener('click', slide, false);
		document.getElementById(_ids.slideDownBtn).addEventListener('click', slide, false);

		updateFinger();

		document.getElementById(_ids.container).addEventListener('mousemove', onMouseMove, false);
		_cursorCanvas.addEventListener('click', onMouseClick, false);

		ugsChordBuilder.chordCanvas.init(diagramContext, _cursorCanvas);
		ugsChordBuilder.cursorCanvas.init(cursorContext);

		redraw();
		exportDefinition();

		ugsChordBuilder.chooserList.init(setChord);

		return true;
	};

	/**
	 * Successively clicking the Finger tool cycles through index to pinky, then none, and so on.
	 * This method automatically increments the "currently active finger" (odd sentence, that)
	 * and updates the toolbox UI.
	 * Note: changing the cursor is not handled here.
	 * @method updateFinger
	 * @private
	 * @return {void}
	 */
	var updateFinger = function() {
		_finger++;
		if (_finger > 4) {
			_finger = 0;
		}
		document.getElementById(_ids.btnFingerName).innerHTML = _fingerNames[_finger] + ' (' + _finger + ')';
		document.getElementById(_ids.btnHandPic).className = 'fingerToolImage finger' + _finger;
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var showOutputBox = function(evt) {
		setClass(document.getElementById(_ids.outputBox), 'collapseOutput', !evt.target.checked);
	};

	/**
	 * Cancel button's click event handler
	 * @method onCancelClick
	 */
	var onCancelClick = function(evt) {
		evt.preventDefault();
		reset();
		ugsChordBuilder.chooserList.show(true);
	};

	/**
	 * Save button's click event handler
	 * @method onSaveClick
	 */
	var onSaveClick = function(evt) {
		evt.preventDefault();
		var d = {
			name: _currentName,
			startingFret: _startingFret,
			dots: ugsChordBuilder.fretDots.getDots(),
			definition: ugsChordBuilder.export.getDefinition(_currentName, _startingFret)
		};
		if (!ugsChordBuilder.chooserList.save(d)) {
			var e = document.getElementById(_ids.chordName);
			e.focus();
			e.select();
		}
	};

	/**
	 * DANGER!! this is really a public method! A reference to this is passed to the
	 * scrapper during its initialization. Used to load ths Chord Builder
	 * @method setChord
	 * @param {Chord} chord
	 */
	var setChord = function(chord) {
		var isNew = chord == null;
		if (isNew) {
			reset();
			return;
		}

		var maxFret = findMaxFret(chord.dots);
		var startingFret = (maxFret > ugsChordBuilder.settings.fretBoard.numFrets) ? maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1 : 1;
		reset(chord.name, startingFret, convertDots(startingFret, chord.dots), false);
	};

	/**
	 * Converts standard scriptasaurus Dot array to chordBuilder dot array (fret changes)
	 * @method convertDots
	 * @param {int} startingFret
	 * @param  {array} builderDots
	 * @return {array}
	 */
	var convertDots = function(startingFret, builderDots) {
		var offset = startingFret - 1;
		var ugsDots = [];
		for (var i = 0; i < builderDots.length; i++) {
			var fret = builderDots[i].fret - offset;
			ugsDots.push(new ugsChordBuilder.entities.Dot(builderDots[i].string, (fret < 0 ? 0 : fret), builderDots[i].finger));
		}
		return ugsDots;
	};

	/**
	 * Loops over dots to find the largest fret value
	 * @method findMaxFret
	 * @param  {array} dots
	 * @return {ing}
	 */
	var findMaxFret = function(dots) {
		var max = 0;
		for (var i = 0; i < dots.length; i++) {
			if (dots[i].fret > max) {
				max = dots[i].fret;
			}
		}
		return max;
	};

	/**
	 * Updates the "standard form-like inputs"
	 * @method resetInputs
	 * @param {string} name
	 * @param {int} startingFret
	 * @param {bool} isNew
	 * @return {void}
	 */
	var resetInputs = function(name, startingFret, isNew) {
		_currentName = (name && name.length > 0) ? name : 'CHORDNAME';
		document.getElementById(_ids.chordName).value = _currentName;

		_startingFret = startingFret ? startingFret : 1;
		document.getElementById(_ids.startingFret).value = _startingFret;

		document.getElementById(_ids.showOutputBtn).checked = false;
		setClass(document.getElementById(_ids.outputBox), 'collapseOutput', true);

		document.getElementById(_ids.saveBtn).value = isNew ? 'Add' : 'Update';
	};

	/**
	 * Updates the Toolbox's current tool to be "Add Dot"; sets properties required for cursor, etc.
	 * @method resetCurrentTool
	 */
	var resetCurrentTool = function() {
		// restore current drawing tool (this is lame-o)
		// -----------------------------------------------
		_isDotToolActive = true;
		_finger = 0;
		updateFinger();
		setClass(_eleDotsBtn, 'selected', _isDotToolActive);
		setClass(_eleFingerBtn, 'selected', !_isDotToolActive);
		setClass(document.getElementById(_ids.toolbox), 'open', !_isDotToolActive);
		ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
	};

	/**
	 * Does a complete UI reset (if no values provided in params), otherwise this is kinda a "set"
	 * @method reset
	 * @param {string} name Chord name
	 * @param {int} startingFret
	 * @param {array} dots
	 * @param {bool} isNew Used to set the button text
	 */
	var reset = function(name, startingFret, dots, isNew) {
		isNew = arguments.length > 3 ? isNew : true;
		// fire cleanup on other classes...
		// -----------------------------------------------
		ugsChordBuilder.fretDots.reset();

		// easy elements back to default...
		// -----------------------------------------------
		resetInputs(name, startingFret, isNew);

		resetCurrentTool();

		if (dots && dots.length > 0) {
			for (var i = 0; i < dots.length; i++) {
				ugsChordBuilder.fretDots.toggleDot(dots[i]);
			}
		}

		// ok, probably done
		// -----------------------------------------------
		redraw();
		exportDefinition();
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var toggleTool = function(evt) {
		evt.preventDefault();
		var useDotTool = evt.currentTarget.href.indexOf('#dots') >= 0;
		if (useDotTool == _isDotToolActive) {
			if (!useDotTool) {
				updateFinger();
				ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
			}
			return;
		}

		setClass(_eleDotsBtn, 'selected', useDotTool);
		setClass(_eleFingerBtn, 'selected', !useDotTool);
		setClass(document.getElementById(_ids.toolbox), 'open', !useDotTool);

		_isDotToolActive = useDotTool;
		ugsChordBuilder.cursorCanvas.setCursor(_isDotToolActive, _finger);
	};

	/**
	 * Yet another poor man's jQuery envying add/remove CSS class method.
	 * @method
	 * @private
	 * @return {void}
	 */
	var setClass = function(element, className, isSet) {
		var hasClass = element.className.indexOf(className) >= 0;
		if (isSet && !hasClass) {
			// add
			element.className += ' ' + className;
		}
		else if (!isSet && hasClass) {
			// remove
			element.className = element.className.replace(className, '').replace(/\s+/g, ' ');
		}
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var addStartingFretOptions = function(ele) {
		var s = '';
		var lastValue = ugsChordBuilder.settings.fretBoard.maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1;
		for (var i = 1; i <= lastValue; i++) {
			s += '<option value="' + i + '">' + i + '</option>';
		}
		ele.innerHTML = s;
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var onNameChange = function(evt) {
		_currentName = this.value;
		exportDefinition();
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var onFretChange = function(evt) {
		_startingFret = parseInt(this.value, 10);
		exportDefinition();
		redraw();
	};

	/**
	 * Needs to watch for closed chords!
	 * @method
	 * @private
	 * @return {void}
	 */
	var slide = function(evt) {
		evt.preventDefault();
		var moveAllowed = false;
		var numSteps = evt.target.getAttribute('data-direction') == 'up' ? -1 : +1;
		if (ugsChordBuilder.fretDots.slide(numSteps)) {
			moveAllowed = true;
		}
		else {
			var newStart = _startingFret + numSteps;
			var lastValue = ugsChordBuilder.settings.fretBoard.maxFret - ugsChordBuilder.settings.fretBoard.numFrets + 1;
			if ((newStart >= 1) && (newStart <= lastValue)) {
				_startingFret = newStart;
				document.getElementById(_ids.startingFret).value = newStart;
				moveAllowed = true;
			}
		}

		if (moveAllowed) {
			redraw();
			exportDefinition();
		}
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var onMouseMove = function(evt) {
		ugsChordBuilder.cursorCanvas.draw(getPosition(this, evt));
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var onMouseClick = function(evt) {
		var pos = getPosition(_cursorCanvas, evt);
		var dot = ugsChordBuilder.tracking.toDot(pos);
		if (!dot) {
			return;
		}

		if (_isDotToolActive) {
			ugsChordBuilder.fretDots.toggleDot(dot);
			redraw(pos);
			exportDefinition();
		}
		else if (ugsChordBuilder.fretDots.toggleFinger(dot, _finger)) {
			redraw(pos);
			exportDefinition();
		}
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var getPosition = function(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return new ugsChordBuilder.entities.Position(
			evt.clientX - rect.left,
			evt.clientY - rect.top
		);
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var redraw = function(pos) {
		pos = pos || new ugsChordBuilder.entities.Position(0, 0);
		ugsChordBuilder.chordCanvas.draw(pos, _startingFret);
	};

	/**
	 * @method
	 * @private
	 * @return {void}
	 */
	var exportDefinition = function() {
		document.getElementById(_ids.output).innerHTML = ugsChordBuilder.export.getDefinitionHtml(_currentName, _startingFret);
	};

	this.reload = function() {
		reset();
		ugsChordBuilder.chooserList.reset();
		ugsChordBuilder.chooserList.show(true);
	};

};
;/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

/**
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

@module lazyload
@class LazyLoad
@static
*/

LazyLoad = (function (doc) {
  // -- Private Variables ------------------------------------------------------

  // User agent and feature test information.
  var env,

  // Reference to the <head> element (populated lazily).
  head,

  // Requests currently in progress, if any.
  pending = {},

  // Number of times we've polled to check whether a pending stylesheet has
  // finished loading. If this gets too high, we're probably stalled.
  pollCount = 0,

  // Queued requests.
  queue = {css: [], js: []},

  // Reference to the browser's list of stylesheets.
  styleSheets = doc.styleSheets;

  // -- Private Methods --------------------------------------------------------

  /**
  Creates and returns an HTML element with the specified name and attributes.

  @method createNode
  @param {String} name element name
  @param {Object} attrs name/value mapping of element attributes
  @return {HTMLElement}
  @private
  */
  function createNode(name, attrs) {
    var node = doc.createElement(name), attr;

    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        node.setAttribute(attr, attrs[attr]);
      }
    }

    return node;
  }

  /**
  Called when the current pending resource of the specified type has finished
  loading. Executes the associated callback (if any) and loads the next
  resource in the queue.

  @method finish
  @param {String} type resource type ('css' or 'js')
  @private
  */
  function finish(type) {
    var p = pending[type],
        callback,
        urls;

    if (p) {
      callback = p.callback;
      urls     = p.urls;

      urls.shift();
      pollCount = 0;

      // If this is the last of the pending URLs, execute the callback and
      // start the next request in the queue (if any).
      if (!urls.length) {
        callback && callback.call(p.context, p.obj);
        pending[type] = null;
        queue[type].length && load(type);
      }
    }
  }

  /**
  Populates the <code>env</code> variable with user agent and feature test
  information.

  @method getEnv
  @private
  */
  function getEnv() {
    var ua = navigator.userAgent;

    env = {
      // True if this browser supports disabling async mode on dynamically
      // created script nodes. See
      // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
      async: doc.createElement('script').async === true
    };

    (env.webkit = /AppleWebKit\//.test(ua))
      || (env.ie = /MSIE|Trident/.test(ua))
      || (env.opera = /Opera/.test(ua))
      || (env.gecko = /Gecko\//.test(ua))
      || (env.unknown = true);
  }

  /**
  Loads the specified resources, or the next resource of the specified type
  in the queue if no resources are specified. If a resource of the specified
  type is already being loaded, the new request will be queued until the
  first request has been finished.

  When an array of resource URLs is specified, those URLs will be loaded in
  parallel if it is possible to do so while preserving execution order. All
  browsers support parallel loading of CSS, but only Firefox and Opera
  support parallel loading of scripts. In other browsers, scripts will be
  queued and loaded one at a time to ensure correct execution order.

  @method load
  @param {String} type resource type ('css' or 'js')
  @param {String|Array} urls (optional) URL or array of URLs to load
  @param {Function} callback (optional) callback function to execute when the
    resource is loaded
  @param {Object} obj (optional) object to pass to the callback function
  @param {Object} context (optional) if provided, the callback function will
    be executed in this object's context
  @private
  */
  function load(type, urls, callback, obj, context) {
    var _finish = function () { finish(type); },
        isCSS   = type === 'css',
        nodes   = [],
        i, len, node, p, pendingUrls, url;

    env || getEnv();

    if (urls) {
      // If urls is a string, wrap it in an array. Otherwise assume it's an
      // array and create a copy of it so modifications won't be made to the
      // original.
      urls = typeof urls === 'string' ? [urls] : urls.concat();

      // Create a request object for each URL. If multiple URLs are specified,
      // the callback will only be executed after all URLs have been loaded.
      //
      // Sadly, Firefox and Opera are the only browsers capable of loading
      // scripts in parallel while preserving execution order. In all other
      // browsers, scripts must be loaded sequentially.
      //
      // All browsers respect CSS specificity based on the order of the link
      // elements in the DOM, regardless of the order in which the stylesheets
      // are actually downloaded.
      if (isCSS || env.async || env.gecko || env.opera) {
        // Load in parallel.
        queue[type].push({
          urls    : urls,
          callback: callback,
          obj     : obj,
          context : context
        });
      } else {
        // Load sequentially.
        for (i = 0, len = urls.length; i < len; ++i) {
          queue[type].push({
            urls    : [urls[i]],
            callback: i === len - 1 ? callback : null, // callback is only added to the last URL
            obj     : obj,
            context : context
          });
        }
      }
    }

    // If a previous load request of this type is currently in progress, we'll
    // wait our turn. Otherwise, grab the next item in the queue.
    if (pending[type] || !(p = pending[type] = queue[type].shift())) {
      return;
    }

    head || (head = doc.head || doc.getElementsByTagName('head')[0]);
    pendingUrls = p.urls.concat();

    for (i = 0, len = pendingUrls.length; i < len; ++i) {
      url = pendingUrls[i];

      if (isCSS) {
          node = env.gecko ? createNode('style') : createNode('link', {
            href: url,
            rel : 'stylesheet'
          });
      } else {
        node = createNode('script', {src: url});
        node.async = false;
      }

      node.className = 'lazyload';
      node.setAttribute('charset', 'utf-8');

      if (env.ie && !isCSS && 'onreadystatechange' in node && !('draggable' in node)) {
        node.onreadystatechange = function () {
          if (/loaded|complete/.test(node.readyState)) {
            node.onreadystatechange = null;
            _finish();
          }
        };
      } else if (isCSS && (env.gecko || env.webkit)) {
        // Gecko and WebKit don't support the onload event on link nodes.
        if (env.webkit) {
          // In WebKit, we can poll for changes to document.styleSheets to
          // figure out when stylesheets have loaded.
          p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
          pollWebKit();
        } else {
          // In Gecko, we can import the requested URL into a <style> node and
          // poll for the existence of node.sheet.cssRules. Props to Zach
          // Leatherman for calling my attention to this technique.
          node.innerHTML = '@import "' + url + '";';
          pollGecko(node);
        }
      } else {
        node.onload = node.onerror = _finish;
      }

      nodes.push(node);
    }

    for (i = 0, len = nodes.length; i < len; ++i) {
      head.appendChild(nodes[i]);
    }
  }

  /**
  Begins polling to determine when the specified stylesheet has finished loading
  in Gecko. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  Thanks to Zach Leatherman for calling my attention to the @import-based
  cross-domain technique used here, and to Oleg Slobodskoi for an earlier
  same-domain implementation. See Zach's blog for more details:
  http://www.zachleat.com/web/2010/07/29/load-css-dynamically/

  @method pollGecko
  @param {HTMLElement} node Style node to poll.
  @private
  */
  function pollGecko(node) {
    var hasRules;

    try {
      // We don't really need to store this value or ever refer to it again, but
      // if we don't store it, Closure Compiler assumes the code is useless and
      // removes it.
      hasRules = !!node.sheet.cssRules;
    } catch (ex) {
      // An exception means the stylesheet is still loading.
      pollCount += 1;

      if (pollCount < 200) {
        setTimeout(function () { pollGecko(node); }, 50);
      } else {
        // We've been polling for 10 seconds and nothing's happened. Stop
        // polling and finish the pending requests to avoid blocking further
        // requests.
        hasRules && finish('css');
      }

      return;
    }

    // If we get here, the stylesheet has loaded.
    finish('css');
  }

  /**
  Begins polling to determine when pending stylesheets have finished loading
  in WebKit. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  @method pollWebKit
  @private
  */
  function pollWebKit() {
    var css = pending.css, i;

    if (css) {
      i = styleSheets.length;

      // Look for a stylesheet matching the pending URL.
      while (--i >= 0) {
        if (styleSheets[i].href === css.urls[0]) {
          finish('css');
          break;
        }
      }

      pollCount += 1;

      if (css) {
        if (pollCount < 200) {
          setTimeout(pollWebKit, 50);
        } else {
          // We've been polling for 10 seconds and nothing's happened, which may
          // indicate that the stylesheet has been removed from the document
          // before it had a chance to load. Stop polling and finish the pending
          // request to prevent blocking further requests.
          finish('css');
        }
      }
    }
  }

  return {

    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.

    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css: function (urls, callback, obj, context) {
      load('css', urls, callback, obj, context);
    },

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.

    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js: function (urls, callback, obj, context) {
      load('js', urls, callback, obj, context);
    }

  };
})(this.document);
