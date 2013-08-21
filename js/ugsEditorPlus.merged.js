/**
  * This library implments the editor functions, bridging the page UI and scriptasaurus methods.
  * @module  UkeGeeksScriptasaurus Editor+
  * @namespace  ugsEditorPlus
  * @class ugsEditorPlus
  */
var ugsEditorPlus = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * attaches event handlers, preps variables, and runs UGS
	 * @method init
	 * @private
	 * @param isLegacyIe {bool} pre-IE 9 versions
	 */
	var init = function(isLegacyIe){
		// ukeGeeks.tumblr.opts.diagramResizeTo = 1;
		ukeGeeks.settings.opts.retainBrackets = false;

		ukeGeeks.scriptasaurus.init(isLegacyIe);

		ugsEditorPlus.actions.init(isLegacyIe);
		ugsEditorPlus.topMenus.init();
		ugsEditorPlus.submenuUi.init(ugsEditorPlus.actions.doAction);
		ugsEditorPlus.optionsDlg.init(ugsEditorPlus.actions.doAction);

		ugsEditorPlus.actions.run();
	};

	/**
	 * wraps the private Init method for modern browsers
	 * @method attach
	 * @public
	 */
	_public.attach = function(){
		init(false);
	};

	/**
	 * wraps the private Init method, required for Legacy Internet Exploere (pre-9)
	 * @method attach
	 * @public
	 */
	_public.attachIe = function(){
		init(true);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);

;/**
 * Does the work by providing "doAction" method to respond to events (does not
 * attach event handlers); Modifes some page elements -- adjust CSS classes on page,
 * runs Scriptasaurus, etc.
 * @class actions
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.actions = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	// legacy IE flag
	var _isCrap = false;

	/**
	 * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
	 * @property _ele
	 * @type {JSON}
	 */
	var _ele = {};

	// misc
	var _song = null;
	//
	var _sourceOriginal = null;
	var _originalChords = [];

	var _re = {
		safe: /^([A-G][#b]?)(m|m6|7|m7|dim|maj7|6|sus2|sus4|aug|9)?$/
	};

	/**
	 * associative array/JSON of last click value used; intended to be used to prevent
	 * rerunning more expensize operations unnecessailry (when the value didn't actually change)
	 * @property _prevValues
	 * @type {JSON}
	 */
	var _prevValues = {
		//'colors' : 'normal',
		//'layout' : 'left',
		//'tuning' : 'soprano',
		'placement' : 'above',
		'transpose' : 'up_0'
	};

	/**
	 * Sets up this class; modifies form elements; attaches event handlers, etc
	 * @method init
	 * @public
	 * @param isLegacyIe {bool} true if using pre-Internet Explorer v8 or 9 (sorry, I've forgotten or don't care)
	 */
	_public.init = function(isLegacyIe){
		_isCrap = isLegacyIe;

		_ele = {
			songText : document.getElementById('ukeSongText'),
			songContainer : document.getElementById('ukeSongContainer'),
			cpmSource : document.getElementById('chordProSource'),
			scalableArea : document.getElementById('scalablePrintArea')
		};

	};

	/* ----------------------------------------------------------------------------------- *|
	|* Common "All Powerful" Helper Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Executes the requested Action using passed in Value
	 * @method doAction
	 * @public
	 * @param action {string} Action's name; must match one of those defined in the switch below
	 * @param value {string} Value used by Action (OK, a couple methods assume this is boolean/falsy)
	 */
	_public.doAction = function(action, value){
		switch (action){
			case 'zoomFonts':
				zoomFonts(value);
				break;
			case 'zoomDiagrams':
				zoomDiagrams(value);
				break;
			case 'layout':
				doLayout(value);
				break;
			case 'placement':
				doPlacement(value);
				break;
			case 'tuning':
				doTuning(value);
				break;
			case 'colors':
				doColors(value);
				break;
			case 'transpose':
				doTranspose(value);
				break;
			case 'paper':
				doSetPageWidth(value);
				break;
			case 'showEnclosures':
				setEnclosureVisible(value);
				break;
			case 'hideCommonChords':
				setIgnoreCommon(value);
				break;
			case 'setCommonChords':
				setetCommonChordsList(value);
				break;
			case 'update':
				doUpdate();
				break;
			default:
				console.log('Unrecognized ' + action + ' > ' + value);
		}
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
			if (isDoBackup || (_sourceOriginal == null)){
				_sourceOriginal = _ele.cpmSource.value;
				_originalChords = _song.chords;
				resetTranspose(_song.chords.length < 1 ? '' : _song.chords[0]);
			}
		}
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Zoom Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * Zooms (scales) fonts
	 * @method zoomFonts
	 * @private
	 * @param value {string} point-size; value of the clicked value item
	 */
	var zoomFonts = function(value){
		var pt = parseFloat(value, 10);
		_ele.scalableArea.style.fontSize = pt + 'pt';
	};

	/**
	 * Zooms (scales) chord diagrams
	 * @method zoomDiagrams
	 * @private
	 * @param value {string} percentage, integer between 0 and, well, 100?; value of the clicked value item
	 */
	var zoomDiagrams = function(value){
		var prct = parseInt(value, 10) / 100;
		// apologies for the magic number...
		var columnWidth = Math.round(prct * 225);

		var s = ugsEditorPlus.styles.getSheet('ugsEditorCss');
		var m = s.Find('.scalablePrintArea .ugs-diagrams-wrap canvas');
		m.style.width = Math.round(prct * ukeGeeks.settings.fretBox.width) +'px';
		m.style.height = Math.round(prct * ukeGeeks.settings.fretBox.height) +'px';

		m = s.Find('.scalablePrintArea .ugs-diagrams-wrap');
		m.style.width = columnWidth +'px';

		m = s.Find('.scalablePrintArea .ugs-source-wrap');
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
	 * Chord Name placement (&amp; "Mini-chord diagrams")
	 * @method doPlacement
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doPlacement = function(value){
		ukeGeeks.toolsLite.setClass(_ele.songContainer, 'ugsInline', (value == 'inline'));

		// NOTE: ugs already adds the "chord diagrams above" class based on setting,
		// BUT does NOT remove it!!!!
		var isMiniDiagrams = (value == 'miniDiagrams');
		if (!isMiniDiagrams){
			ukeGeeks.toolsLite.removeClass(_ele.songContainer, 'ugsInlineDiagrams');
		}

		if (isMiniDiagrams || (_prevValues.placement == 'miniDiagrams')){
			ukeGeeks.settings.inlineDiagrams = isMiniDiagrams;
			_public.run();
		}
		else if (!isMiniDiagrams && (_prevValues.placement != 'miniDiagrams')) {
			// we're jumping between "above" and "inline", either way we need to
			// manually fix the overlaps
			ukeGeeks.overlapFixer.Fix(_ele.songText);
		}

		_prevValues.placement = value;
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Color Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * available color schemes
	 * @property _colorSchemes
	 * @type {JSON-Object}
	 */
	var _colorSchemes = {
		'reversed' : {
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

		'normal' : {
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
		}
	};

	/**
	 * Change the color scheme -- requires changing CSS Class and reruning (to regenerate reference chord diagrams)
	 * @method doColors
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doColors = function(value){
		$('body').toggleClass('reversed', value == 'reversed');

		var c = _colorSchemes[value];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;

		_public.run();
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
		var tuning = (value == 'baritone')
			? ukeGeeks.definitions.instrument.baritoneUke
			: ukeGeeks.definitions.instrument.sopranoUke;

		ukeGeeks.scriptasaurus.setTuningOffset(tuning);
		_public.run();
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
		var safeChords = [];
		var bad = '';
		for(var i = 0; i < _originalChords.length; i++){
			if (_re.safe.test(_originalChords[i])){
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
		var s = _sourceOriginal;
		var r;

		for(var i = 0; i < safeChords.length; i++){
			r = new RegExp('\\[' + safeChords[i] + '\\]', 'g');
			s = s.replace(r, '[ugsxx_' + i + ']');
		}

		for(var i = 0; i < newChords.length; i++){
			r = new RegExp('\\[ugsxx_' + i + '\\]', 'g');
			s = s.replace(r, '[' + newChords[i] + ']');
		}

		_ele.cpmSource.value = s;
		_public.run();

	};

 /**
	 * Sets Transpose menu's selected value to "Original"; adds example chord names
	 * @method resetTranspose
	 * @private
	 * @param chord {string}
	 */
	var resetTranspose = function(chord){
		var ul = document.getElementById('transposeOptions');
		var items = ul.getElementsByTagName('li');
		var sample;
		var steps = -6;

		_prevValues['transpose'] = 'up_0';

		ugsEditorPlus.submenuUi.resetTransposeLabel();

		for (i = 0; i < items.length; i++){
			ukeGeeks.toolsLite.removeClass(items[i], 'checked');
			sample = (chord.length < 1) ? '' : ukeGeeks.transpose.shift(chord, steps);
			items[i].getElementsByTagName('em')[0].innerHTML = sample;
			if (steps == 0){
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
		_public.run();
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method setIgnoreCommon
	 * @private
	 * @param isIgnore {bool}
	 */
	var setIgnoreCommon = function(isIgnore){
		ukeGeeks.settings.opts.ignoreCommonChords = isIgnore;
		_public.run();
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * and _possible_ rerun
	 * @method setetCommonChordsList
	 * @private
	 * @param chordCsvList {string} comma seperated values list of chord names
	 * @return {void}
	 */
	var setetCommonChordsList = function(chordCsvList){
		var inputList = chordCsvList.split(/[ ,]+/);
		var cleanList = [];

		for (var i = 0; i < inputList.length; i++) {
			var c = ukeGeeks.toolsLite.trim(inputList[i]);
			if (c.length > 0){
				cleanList.push(c);
			}
		};

		ukeGeeks.settings.commonChords = cleanList;

		if (ukeGeeks.settings.opts.ignoreCommonChords){
			_public.run();
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);

;/**
 * Handles transfering the easy text bits of a Song -- title, artist, etc -- to the page.
 * @class songUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songUi = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
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
 */
ugsEditorPlus.styles = new function(){
	var _sheet = null;
	this.Rules = null;

	this.getSheet = function(title){
		_sheet = _getSheet(title);
		this.Rules = getRules();
		return this;
	};

	var _getSheet = function(title){
		for (var i = 0; i < document.styleSheets.length; i++){
			if (document.styleSheets[i].title == title){
				return document.styleSheets[i];
				break;
			}
		}
		return null;
	};

	var getRules = function(){
		if (_sheet == null){
			return [];
		}
		return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
	};

	this.Find = function(selector){
		selector = selector.toLowerCase();
		for (var i = 0; i < this.Rules.length; i++) {
			if (!this.Rules[i].selectorText){
				continue;
			}
			if (this.Rules[i].selectorText.toLowerCase() == selector){
				return this.Rules[i];
				break;
			}
		}
		return null;
	};
};

;/**
 * UI mechanics of the Other Options dialog
 * @class options
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * borrow the "doAction" method from Actions class
	 * @property _doAction
	 * @type {function}
	 */
	var _doAction = null;

	// DOM handles (mostly for options dialog elements only)
	var _ele = {};

	/**
	 * Sets up this class by attaching event handlers to form elements;
	 * @method init
	 * @public
	 * @param doAction {function} handle to method to actually DO the job
	 */
	_public.init = function(doAction){
		_doAction = doAction;

		_ele = {
			inputIgnoreList : document.getElementById('commonChordList'),
			chkIgnore : document.getElementById('chkIgnoreCommon'),
			//pageWidth : document.getElementById('pageWidth'),
			chkEnclosures : document.getElementById('chkEnclosures')
		};

		restoreDefaults();

		// button clicks
		document.getElementById('updateBtn').onclick = function(){onUpdateBtnClick(); return false;};

		//_ele.pageWidth.onchange = function(){doSetWidth(this.value); };
		_ele.chkEnclosures.onclick = function(){onSetEnclosureClick(!this.checked); };
		_ele.inputIgnoreList.onchange = function(){onCommonChordFieldChange(); };
		_ele.chkIgnore.onclick = function(){onIgnoreCommonClick(this.checked); };

		// ugh! Event bubbling!
		$('.checkboxBlock label, input[type=checkbox]').click(function(e){e.stopPropagation();});
		//$('#helpDlg a').click(function(e){console.log('anchor click');});

		$('.overlay').draggable({
			handle : 'hgroup',
			//containParent: true
    });
	};

	var restoreDefaults = function(){
		// initialize the common list
		_ele.inputIgnoreList.value = ukeGeeks.settings.commonChords.join(", ");
		//_ele.pageWidth.value = 'letter';
		_ele.chkIgnore.checked = ukeGeeks.settings.opts.ignoreCommonChords;
		_ele.chkEnclosures.checked = !ukeGeeks.settings.opts.retainBrackets;
	};

	var onUpdateBtnClick = function(){
		_doAction( 'update', null);
	};

	/**
	 * (option dialog) change whether to show/hide the bracket characters
	 * @method onSetEnclosureClick
	 * @private
	 * @param isVisible {bool}
	 */
	var onSetEnclosureClick = function(isVisible){
		_doAction( 'showEnclosures', isVisible);
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method onIgnoreCommonClick
	 * @private
	 * @param isIgnore {bool}
	 */
	var onIgnoreCommonClick = function(isIgnore){
		_doAction( 'hideCommonChords', isIgnore);
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * and _possible_ rerun
	 * @method onCommonChordFieldChange
	 * @private
	 * @return {void}
	 */
	var onCommonChordFieldChange = function(){
		_doAction( 'setCommonChords', _ele.inputIgnoreList.value);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);

;var ugsEditorPlus = window.ugsEditorPlus || {};

/**
 *
 * @class reformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.reformat = new function(){
	var _this = this;

	var _hasChords = false;

	/**
	 *
	 * @class _enums
	 */
	var _enums = {
		lineTypes : {
			blank : 0,
			chords : 1,
			lyrics : 2,
			tabs : 3
		}
	}

	/**
	 * Line Object Class Definition (sets defaults)
	 * @class lineObj
	 */
	var lineObj = function(){
		this.source = '';
		this.wordCount = 0;
		this.spaceCount = 0;
		this.words = [];
		this.chordCount = 0;
		this.lineType = _enums.lineTypes.blank;
	};

	var _re = {
		words : /\b(\S+)\b/gi,
		spaces : /(\s+)/g,
		leadingSpace : /(^\s+)/,
		chordNames : /\b[A-G][#b]?(m|m6|m7|m9|dim|dim7|maj7|sus2|sus4|aug|6|7|9|add9|7sus4)?\b/,
		chrdBlock : /\b(\S+\s*)/g,
		tabs : /^\s*(\|{0,2}[A-Gb]?\|{0,2}[-x0-9|:]{4,})/
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
	 * @method reformat
	 * @param text {string} songstring
	 * @return {string} ChordPro format text block
	 */
	this.run = function(text){
		_hasChords = false;
		var lines = read(text);
		return merge(lines);
	};

	/**
	 * TRUE if one or more chord lines detected
	 * @method hasChords
	 * @return {bool}
	 */
	this.hasChords = function(){
		return _hasChords;
	};

	/**
	 * Accepts a text block
	 * @method read
	 * @param text {string} string RAW song
	 * @return {array of Lines}
	 */
	var read = function(text){
		var lineAry = [];
		text = text.replace('	', '    ');
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var words = lines[i].match(_re.words);
			var l = new lineObj;
			l.source = lines[i];
			if ((words != null) && (words.length > 0)){
				l.wordCount = words.length;
				l.words = words;
				l.chordCount = countChords(words);
			}
			var spaces = lines[i].match(_re.spaces);
			if ((spaces != null) && (spaces.length > 0)){
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
	var toLineType = function(line){
		if ((line.spaceCount + line.wordCount) < 1){
			return _enums.lineTypes.blank;
		}

		var tabs = line.source.match(_re.tabs);
		if (tabs != null){
			return _enums.lineTypes.tabs;
		}

		var t = _enums.lineTypes.lyrics;
		if ((line.chordCount > 0) && (line.wordCount == line.chordCount)){
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
	var countChords = function(words){
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
	var merge = function(lines){
		var s = '';
		var thisLine, nextLine;
		for (var i = 0; i < lines.length; ) {
			thisLine = lines[i];
			nextLine = lines[i+1];
			i++;
			// If this line's blank or its the last line...
			if (!nextLine || (thisLine.lineType == _enums.lineTypes.blank)){
				s += thisLine.source + '\n';
				continue;
			}

			// OK, we've complicated things a bit by adding tabs, so we'll handle this in a helper...
			if ((thisLine.lineType == _enums.lineTypes.tabs) && isTabBlock(lines, i)){
				s += '{start_of_tab}\n'
					+ thisLine.source.replace(_re.leadingSpace, '') + '\n'
					+ nextLine.source.replace(_re.leadingSpace, '') + '\n'
					+ lines[i+1].source.replace(_re.leadingSpace, '') + '\n'
					+ lines[i+2].source.replace(_re.leadingSpace, '') + '\n'
					+ '{end_of_tab}\n';
				i+= 3;
				continue;
			}

			// finally, look for a "mergable" pair: this line is chords and the next is lyrics -- if not this we'll just output the current line
			if ((thisLine.lineType != _enums.lineTypes.chords) || (nextLine.lineType != _enums.lineTypes.lyrics)){
				s += (thisLine.lineType == _enums.lineTypes.chords)
					? wrapChords(thisLine.source) + '\n'
					: thisLine.source + '\n';
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
	var isTabBlock = function(lines, index){
		if (index + 3 >= lines.length){
			return false;
		}
		for (var i = index; i < index + 3; i++){
			if (lines[i].lineType != _enums.lineTypes.tabs){
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
	var mergeLines = function(chordLine, lyricsLine){
		while (lyricsLine.length < chordLine.length){
			lyricsLine += ' ';
		}
		var s = '';
		var blocks = chordLine.match(_re.chrdBlock);
		var lead = chordLine.match(_re.leadingSpace);
		var offset = 0;
		if (lead){
			s += lyricsLine.substr(offset, lead[0].length);
			offset = lead[0].length;
		}
		for (var j = 0; j < blocks.length; j++) {
			s += '[' + blocks[j].replace(_re.spaces, '') + ']' + lyricsLine.substr(offset, blocks[j].length);
			offset += blocks[j].length;
		}
		if (offset < lyricsLine.length){
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
	var wrapChords = function(chordLine){
		var chords = chordLine.replace(_re.spaces, ' ').split(' ');
		var s = '';
		for (var i = 0; i < chords.length; i++) {
			if (chords[i].length > 0){
				s += '[' + chords[i] + '] ';
			}
		}
		return s;
	};

};

;/**
 *
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.autoReformat = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
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

	_public.run = function(elements){
		if (_isDisabled){
			return;
		}
		_ele = elements;
		_ele.reformatTextBox = document.getElementById('reformatSource');
		_ele.reformatDlg = document.getElementById('reformatDlg');

		document.getElementById('reformatYesBtn').onclick = function(){ doOk(); return false; };
		document.getElementById('reformatNoBtn').onclick = function(){ doClose(); return false; };

		// need to reset on reload
		var chk = document.getElementById('reformatDisable');
		chk.checked = false;
		chk.onclick = function(){ doDisable(this.checked); };

		runNow();
	};

	var doOk = function(){
		_ele.cpmSource.value = _formatted;
		doClose();
		ugsEditorPlus.actions.run(true);
	};

	var doClose = function(){
		ukeGeeks.toolsLite.addClass(_ele.reformatDlg, 'isHidden');
	};

	var doDisable = function(isDisabled){
		_isDisabled = isDisabled;
	};

	var runNow = function(){
		_formatted = ugsEditorPlus.reformat.run(_ele.cpmSource.value);
		_ele.reformatTextBox.innerHTML = _formatted;

		if (!ugsEditorPlus.reformat.hasChords()){
			return;
		}

		ukeGeeks.toolsLite.removeClass(_ele.reformatDlg, 'isHidden');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
;
/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function(){
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * attaches events...
	 * @method init
	 * @return {void}
	 */
	_public.init = function(){
		// $('#ugsAppToolbar > ul a')
		$('#ugsAppToolbar > ul  li').not('[data-dialog]').children('a').click(onMenuItemClick);
  	$('.showOptionsBox a').click(onShowOptionsClick);

		$('#ugsAppToolbar > ul  li[data-dialog]').click(onShowDlgBtnClick);
		$('.closeBtn').click(onCloseBtnClick);
		$('.resizeBtn').click(onResizeBtnClick);

 	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method onMenuItemClick
	 * @return {void}
	 */
	var onMenuItemClick = function(){
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
	 * DESCRIPTION
	 * @method _makeAllInactive
	 * @private
	 * @return {void}
	 */
	var _makeAllInactive = function(){
		$('#ugsAppToolbar > ul > li').removeClass('active');
	};

	/**
	 * handles nav menu/toolbar click event. The data-dialog="X" attribute
	 * on the element assocaites the menu item with the dialog box (the
	 * box's id)
	 * @method onShowDlgBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var onShowDlgBtnClick = function(e){
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();
		// prevent event bubbling
		return false;
	};

	/**
	 * dialog box's close button's click handler. Hides the first parent
	 * with class.
	 * @method onCloseBtnClick
	 * @private
	 * @param e {event}
	 * @return {bool} false to kill event bubbling
	 */
	var onCloseBtnClick = function(e){
		$(this).parents('.overlay').fadeOut();
		// prevent event bubbling
		return false;
	};

	var onResizeBtnClick = function(e){
		var dlg = $(this).parents('.overlay');
		ugsEditorPlus.resize.toggle(dlg);
		return false;
	};

	/**
	 * display a "tooltip" options dialog
	 * @method onShowOptionsClick
	 * @param  {[type]} e [description]
	 * @return {bool} false to kill event bubbling
	 */
	var onShowOptionsClick = function(e){
		var id = $(this).attr('href');
		$('.arrowBox').not(id).hide();
		var $dlg = $(id);
		$dlg.find('dd').hide();
		$dlg.fadeToggle();

		ugsEditorPlus.submenuUi.reset($dlg);

		// prevent event bubbling
		return false;
	};

	_public.makeAllInactive = _makeAllInactive;

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
;
/**
 * Wires up all the "pseudo-selects" (aka "dropdownlists") on a Tooltip-Dialog boxes on
 * the page; assumes consistent HTML (hello, jQuery)
 * TODO: Refactor -- quite brittle!
 * @class submenuUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.submenuUi = (function(){
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	var _open = null;

	/**
	 * borrow the "doAction" method from Actions class
	 * @property _doAction
	 * @type {function}
	 */
	var _doAction = null;

	/**
	 * attaches event handlers
	 * @method init
	 * @return {[type]} [description]
	 */
	_public.init = function(doAction){
		_doAction = doAction;

		$('.enablePseudoSelects label').click(onLabelClick);
		$('.pseudoSelect li').click(onOptionClick);
		$('body').bind('click', closeAll);
		$('.arrowBox').click(doCollapseAllLists);
	};

	/**
	 * a list item has been clicked
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onOptionClick = function(e){
		var $optionItem = $(this);
		var hrefValue = stripHash($optionItem.children().attr('href'));

		// the element holding the "pseudo-select"
		var $select = $optionItem.parents('dd');
		var id = $select.attr('id');
		var actionName = $select.data('action');

		// a selection's been made so we reset ("uncheck" all items) and hide the select list
		$('#'+id)
			.hide()
			.find('li').removeClass('checked');

		// check ("highlight") this selected item
		$optionItem.addClass('checked');

		onListActive(this, false);
		_open = null;

		// now bubble out the info -- update display to show selected value ...
		$('label[for=' + id + '] span').text(getLabelText(actionName, hrefValue, $optionItem));
		$('label[for=' + id + ']').parents('dt').removeClass('active');

		// lastly, execute the action
		_doAction(actionName, hrefValue);

		// prevent event bubbling
		return false;
	};

	/**
	 * Label has been clicked, show associated options dialog box.
	 * Watch for 2-clicks on same label (should hide on second click)
	 * @param  {event} e
	 * @return {bool} false to kill event bubbling
	 */
	var onLabelClick = function(e){
		var $thisLabel = $(this);
		var id = $thisLabel.attr('for');
		setActiveLabel($thisLabel);
		$('#'+id).show();
		onListActive(this, true);
		if (_open != null){
			$('#' + _open.id).hide();
		}
		if (_open != null && _open.id == id){
			_open = null;
		}
		else
		{
		 _open = { "id" : id };
		}

		// prevent event bubbling
		return false;
	};

	_public.reset = function($dlg){
		$dlg.find('dt').removeClass('active');
		$dlg.find('.event-userSelecting').removeClass('event-userSelecting');
	};

	var clearActiveLabels = function($parent){
		$parent.closest('dl').children('dt').removeClass('active');
	};

	var setActiveLabel = function($label){
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
	var onListActive = function(ele, isInUse){
		$(ele).parents('.enablePseudoSelects').toggleClass('event-userSelecting', isInUse);
	};

	/**
	 * @method  doCollapseAllLists
	 * @param  {event} e
	 * @return bool
	 */
	var doCollapseAllLists = function(e){
		if ($(e.target).is('a')){
			return;
		}
		//console.log('doCollapseAllLists');
		//console.log();
		$(this).find('dd').hide();
		_open = null;
		return false;
	};


	/**
	 * user clicked off the current dialog -- close 'em all
	 * @medhod closeAll
	 * @param  {event} e
	 */
	var closeAll = function(e){
		$('.arrowBox').fadeOut(270);
		ugsEditorPlus.topMenus.makeAllInactive();
	};

	var stripHash = function(value){
		return (value[0] == '#') ? value.substr(1) : value;
	};

	/* ----------------------------------------------------------------------------------- *|
	|* Display Text Methods
	|* ----------------------------------------------------------------------------------- */

	/**
	 * used to construct the descriptions for current values
	 * @private
	 * @type {JSON}
	 */
	var _desriptions = {
		'zoomDiagrams' : ['Tiny', 'Small', 'Medium', 'Large', 'Stupid Large'],
		'layout' : ['Reference diagrams on left', 'Reference diagrams at top', 'No reference diagrams'],
		'placement' : ['Chord names inline with lyrics', 'Chord names above lyrics', 'Names & diagrams above lyrics'],
		'colors' : ['Normal colors (white paper)', 'Reversed colors (for projectors)'],
		'tuning' : ['Soprano (GCEA) tuning', 'Baritone (DBEA) tuning']
	};

	/**
	 * Builds a descriptor string of the current values for the pseudo-select labels
	 * @medhod getLabelText
	 * @param  {string} action
	 * @param  {string} value
	 * @param  {jQueryElement} $ele jQuery element that ...
	 * @return string
	 */
	var getLabelText = function(action, value, $ele){
		var index = $ele.index();

		switch (action){
			case 'paper':
				return 'Width ' + $ele.text();
			case 'zoomFonts':
				return 'Font size ' + value + 'pt';
			case 'zoomDiagrams':
				return _desriptions.zoomDiagrams[index] + ' diagrams';
			case 'transpose':
				if (value == 'up_0'){
					return 'Original key';
				}
				var txt = $ele.text();
				return txt.replace(' ', ' steps - "') + '"';
			default:
			 return _desriptions[action][index];
		}
	};

	_public.resetTransposeLabel = function(){
		$('label[for=transposePicker] span').text('Original key');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
;/**
 * Creates a new song via AJAX.
 * Dependencies: jQuery
 * @class newSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.newSong = (function() {
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	var _ajaxUri = '';

	_public.init = function(ajaxUri) {
		_ajaxUri = ajaxUri;

		$('#newSongBtn').click(function(e) {
			if(doValidate(this)) {
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

		$spinner = $( "#loadingSpinner" );
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
			if(data.HasErrors) {
				return;
			}
			document.location.href = data.ContinueUri;
		};

	var doPost = function() {
			if (_isUpdating){
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
			if(hasErrors) {
				$err.show().html(message);
				$('#songTitle').focus();
			} else {
				$err.hide();
			}
		};

	var closeDlg = function(e) {
		$('#newSongForm').fadeOut();
	};

	var resetFields = function(){
		$('#songTitle, #songArtist').val('');
	};

	var onEscape = function(e){
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
	 * @type {Object}
	 */
	var _public = {};

	var _ajaxUri = '';
	var _filename = '';

	/**
	 * Name / Value pairs for jQuery selectors of HTML elements to be manipulated
	 * @type {JSON}
	 */
	var _selectors = {
		messageBox : '#messageBox',
		message : '#sourceFeedback',
		button : '#saveBtn',
		spinner : '#loadingSpinner',
		song : '#chordProSource'
	};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
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

	var showBusy = function(){
		$(_selectors.message).hide().html();
		$(_selectors.messageBox).slideDown('fast');
		$(_selectors.spinner).show();
	};

	var showMessage = function(message){
		$(_selectors.spinner).hide();
		$(_selectors.message).show().html(message);
	};

	var hideMessage = function(){
		$(_selectors.messageBox).delay(3000).fadeOut('slow');
	};

	var doUpdate = function() {
		if (_isUpdating){
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
			contentType:"application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function(data) {
				doAjaxOk(data);
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
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.typeahead = function(){
	/**
	 * attach public members to this object
	 * @type {Object}
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
	 * @return {[type]} [description]
	 */
	var listFromHtml = function(){

		$( 'li' ).each(function( index ) {
			var $this = $(this);

			var plainText = crushText($this.text());
			plainText = plainText.toLowerCase();

			var href = $this.children('a').attr('href');
			var key = href.toLowerCase();

			var html = $this.children('a').html();
			html = html.replace('<strong class="', '<span class="bigger ').replace('</strong>', '</span>');

			_keysToDetailsDict[key] = {
				// content displayed in drop down list
				html : html,
				// what we'll match against
				searchText : plainText,
				// unique key/id
				code : key,
				// when a selection is made this is the location we'll launch
				href : href
			};
			_keysList.push(key);
		});

	};

	var crushText = function(value){
		return value
			.toLowerCase()
    	.replace(_re.noise, '')
    	.replace(_re.common, ' ')
    	.replace(_re.space, ' ')
    	.trim();
	}

	var _ta_source = function (query, process) {
		_scrubbedQuery = crushText(query);
		_words = _scrubbedQuery.split(' ');
		var regGroup = '';
		for (var i = 0; i < _words.length; i++) {
			_words[i] = _words[i].trim();
			if (_words[i].length > 0){
				regGroup += (regGroup.length > 0 ? '|' : '') + _words[i];
			}
		};
		_regex = new RegExp( '(' + regGroup + ')', 'gi');
		process(_keysList);
	};

	var _ta_updater = function (item) {
		window.location = _keysToDetailsDict[item].href;
		return _keysToDetailsDict[item].searchText;
	};

	var _ta_matcher = function (item) {
		var detailed = _keysToDetailsDict[item];
		for (var i = 0; i < _words.length; i++) {
			if (detailed.searchText.indexOf(_words[i]) == -1) {
				return false;
			}
		}
		return true;
	};

	var _ta_sorter = function (items) {
		return items.sort(function(a, b) {
			return (_keysToDetailsDict[a].searchText > _keysToDetailsDict[b].searchText);
		});
	};

	var _ta_highligher = function (item) {
		var $temp = $('<div/>').html(_keysToDetailsDict[item].html);

		$('em, .bigger', $temp).each(function( index ){
			var $ele = $(this);
			var text = $ele.html();
			$ele.html(text.replace( _regex, "<strong>$1</strong>" ))
		});
		return $temp.html();
	};

	_public.initialize = function(){
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
ugsEditorPlus.resize = (function(){
	var _public = {};

	/**
	 * the "Safe" position and dimensions to avoid going over the top menu
	 * @type {JSON}
	 */
	var safe = {
		top: 45,
		edge: 10,
		width: 450
	};

	var $w, $dlg;

	/**
	 * Hold the current state of the dialog, we'll store this on the element in "data-sized" attribute
	 * @type {Boolean}
	 */
	var isBig = false;

	/**
	 * Returns a snapshot of current positions and dimensions
	 * @method measure
	 * @private
	 * @return {JSON}
	 */
	var measure = function(){
		return {
			width: $w.width(),
			height: $w.height(),
			position: $dlg.position()
		};
	};

	/**
	 * Initializer: preps handles and sets state varables.
	 * @method setup
	 * @private
	 * @return {void}
	 */
	var setup = function(dlgElement){
		$w = $(window);
		$dlg = $(dlgElement);
		isBig = $dlg.data('sized') == true;
		$dlg.data('sized', isBig);
		// console.log($dlg.data('initialPos'));
	}

	/**
	 * Expands overlay to fill (reasonably) available area
	 * @method max
	 * @private
	 * @return {void}
	 */
	var max = function(){
		var info = measure();
		$dlg
			.css({left: info.position.left + "px"})
			.animate({left: safe.edge, right: safe.edge, top: safe.top, width: (info.width - 30)}, 800);
	};

	/**
	 * Restores overlay to original position(-ish -- not finished)
	 * @method reset
	 * @private
	 * @return {void}
	 */
	var reset = function(){
		//measure();
		$dlg.css({'left': 'auto'}).animate({right: safe.edge, width: safe.width}, 800);
	};

	/**
	 * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
	 * @method toggle
	 * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
	 * @return {void}
	 */
	_public.toggle = function(dlgElement){
		setup(dlgElement);
		if (isBig){
			reset();
		}
		else{
			max();
		}
		$dlg.data('sized', !isBig);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
