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
		ugsEditorPlus.chordBuilder.init();
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
	 * Change the color scheme -- requires changing CSS Class and reruning (to regenerate reference chord diagrams)
	 * @method doColors
	 * @private
	 * @param value {string} value of the clicked value item
	 */
	var doColors = function(value){
		 ugsEditorPlus.themes.set(value);
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
 * Changes the song's color scheme ("theme") by changing both the applied body class
 * and the UkeGeek settings used to draw the diagrams.
 * @class themes
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.themes = new function() {

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
	this.getDescription = function(themeName) {
		return _colorSchemes[themeName].selectText;
	};


	/**
	 * Populates the UL (identified via CSS/jQuery selector) with the color scheme List Items (LIs)
	 * @method loadList
	 * @param  {string} selector
	 */
	this.loadList = function(selector) {
		var s = '';
		for (var key in _colorSchemes) {
			if (_colorSchemes.hasOwnProperty(key)) {
				var cssClass = (key == 'normal') ? 'checked' : '';
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
	this.set = function(themeName) {
		setBody(themeName);

		var c = _colorSchemes[themeName];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;
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
;/**
 * Handles Top Menu UI -- includes the show/hide dialogs (why? cuz they're attached to top menu buttons)
 * Shows (a) dialongs (such as Edit) and (b) those tool-tippy options thingies.
 * @class topMenus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.topMenus = (function() {
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
	_public.init = function() {
		// $('#ugsAppToolbar > ul a')
		$('#ugsAppToolbar > ul li').not('[data-dialog]').children('a').click(onMenuItemClick);
		$('.showOptionsBox a').click(onShowOptionsClick);

		$('#ugsAppToolbar > ul li[data-dialog]').click(onShowDlgBtnClick);
		$('.closeBtn').click(onCloseBtnClick);
		$('.resizeBtn').click(onResizeBtnClick);

	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method onMenuItemClick
	 * @return {void}
	 */
	var onMenuItemClick = function() {
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
	var _makeAllInactive = function() {
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
	var onShowDlgBtnClick = function(e) {
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
	var onCloseBtnClick = function(e) {
		$(this).parents('.overlay').fadeOut();
		// prevent event bubbling
		return false;
	};

	var onResizeBtnClick = function(e) {
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
	var onShowOptionsClick = function(e) {
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

}());
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
		ugsEditorPlus.themes.loadList('#colorPicker .pseudoSelect');
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
			case 'colors':
				return ugsEditorPlus.themes.getDescription(value);
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

;/**
 *
 * Dependencies: jQuery & ugsChordBuilder classes
 * @class chordBuilder
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.chordBuilder = (function() {
	/**
	 * attach public members to this object
	 * @type {Object}
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
	var onShowDlgBtnClick = function(evt){
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
 * @namespace ugsChordBuilder
 */
var ugsChordBuilder = window.ugsChordBuilder || {};

/**
 * Entities (data containers) shared between the class libraries. Private
 * JSON objects used internally by a class are not included here.
 * @class entities
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.entities = new function() {
	this.boundingBox = function(pos, dimensions) {
		this.x = pos ? pos.x : 0;
		this.y = pos ? pos.y : 0;
		this.width = dimensions ? dimensions.width : 1;
		this.height = dimensions ? dimensions.height : 1;
	};

	this.dot = function(string, fret, finger) {
		this.string = string;
		this.fret = fret ? fret : 0;
		this.finger = finger ? finger : 0;
	};

	this.postion = function(x, y) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	};

};

/**
 * "Properties, Options, Preferences" such as fretboard size and colors; dot attributes, the cursors, fonts etc.
 * @class
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.settings = new function() {
	/**
	 * Fretboard upper left hand corner position
	 * @type {position}
	 */
	this.anchorPos = {
		x: 75,
		y: 75
	};

	//'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, sans-serif';
	var sanSerifFontStack = 'Arial, "Helvetica Neue", Helvetica, Verdana, sans-serif';

	this.cursor = {
		fillColor: 'rgba(220, 216, 73, 0.35)', // 'rgba(245, 127, 18, 0.3)',
		strokeWidth: 1,
		strokeColor: '#AAB444', // '#F57F12',
		radius: 9,
		imageUri: '/img/editor/hand-cursor.png'
	};

	this.fretBoard = {
		numFrets: 5,
		maxFret: 16,
		stringNames: ['G', 'C', 'E', 'A'],
		strokeWidth: 4,
		strokeColor: '#8F8569',
		fretSpace: 35,
		stringSpace: 30
	};

	this.dot = {
		fillColor: '#F68014',
		radius: 11,
		strokeWidth: 2,
		strokeColor: '#D56333',
		fontWeight: 'bold',
		fontFamily: sanSerifFontStack,
		fontSize: 16,
		fontColor: '#ffffff'
	};

	this.fretLabel = {
		fontFamily: sanSerifFontStack,
		fontSize: 28, // Pixels
		color: '#6A6A63',
		lightColor: '#EAEAE8' //D6D6D6' //A4A4A3'
	};

	this.stringLabel = {
		fontFamily: sanSerifFontStack,
		fontSize: 34, // Pixels
		color: '#DCD849' // #AAB444'//
	};

	this.chord = {
		nameMaxLength: 20
	};

	/**
	 * Dimensions of a single target
	 * @return {JSON} {width: ?, height: ? }
	 */
	this.targetDimensions = function() {
		return {
			height: ugsChordBuilder.settings.fretBoard.fretSpace,
			width: ugsChordBuilder.settings.fretBoard.stringSpace
		};
	};

	/**
	 * Top left-hand corner where Targets begin positioning
	 * @return {postion}
	 */
	this.targetAnchorPos = function() {
		var dimensions = this.targetDimensions();
		return new ugsChordBuilder.entities.postion(
			ugsChordBuilder.settings.anchorPos.x - 0.5 * dimensions.width,
			ugsChordBuilder.settings.anchorPos.y - dimensions.height - 0.2 * ugsChordBuilder.settings.fretBoard.strokeWidth
		);
	};

	/**
	 * re-centers the fretboard's anchor position
	 * @method centerFretboard
	 * @param  {element} canvas
	 * @return {void}
	 */
	this.centerAnchor = function(canvas) {
		var x = (0.5 * canvas.width) - (0.5 * (this.fretBoard.stringNames.length - 1) * this.fretBoard.stringSpace) - this.fretBoard.strokeWidth;
		var y = (0.5 * canvas.height) - (0.5 * this.fretBoard.numFrets * this.fretBoard.stringSpace);
		this.anchorPos = new ugsChordBuilder.entities.postion(x, y);
	};

};

/**
 * Tracks curor position relative to fretboard's hot (clickable) regions
 * @class
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.tracking = new function() {
	var targetBox = null;

	var getTarget = function() {
		if (targetBox) {
			return targetBox;
		}

		var dimensions = ugsChordBuilder.settings.targetDimensions();
		dimensions.width = dimensions.width * ugsChordBuilder.settings.fretBoard.stringNames.length;
		dimensions.height = dimensions.height * (ugsChordBuilder.settings.fretBoard.numFrets + 1);
		targetBox = new ugsChordBuilder.entities.boundingBox(ugsChordBuilder.settings.targetAnchorPos(), dimensions);

		return targetBox;
	};

	/**
	 * Returns TRUE if the two objects overlap
	 * @method  collision
	 * @param  {boundingBox} object1
	 * @param  {boundingBox} object2
	 * @return {bool}
	 */
	var collision = function(object1, object2) {
		return (object1.x < object2.x + object2.width) && (object1.x + object1.width  > object2.x) && (object1.y < object2.y + object2.height) && (object1.y + object1.height > object2.y);
	};

	/**
	 * Converts position (x,y) to the fret
	 * @method toDot
	 * @param  {position} pos
	 * @return {dot}
	 */
	this.toDot = function(pos) {
		var cursorBox = new ugsChordBuilder.entities.boundingBox(pos);
		var box = getTarget();
		if (!collision(cursorBox, box)) {
			return null;
		}

		var dimensions = ugsChordBuilder.settings.targetDimensions();
		return new ugsChordBuilder.entities.dot(
			Math.floor((pos.x - box.x) / dimensions.width),
			Math.floor((pos.y - box.y) / dimensions.height)
		);
	};
};

/**
 * Did I overlook this or was it deliberate? Either case, the "fret" in the dot object is
 * merely the fret in the visible diagram -- that is, a value between 0 and maxFrets, not
 * the actual fret on the instrument... beware.
 *
 * Unless otherwise stated all "dot" parames are of type ugsChordBuilder.entities.dot
 * @class fretDots
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.fretDots = new function() {
	var _dots = [];

	this.getDots = function() {
		return _dots.slice();
	};

	this.slide = function(numSteps) {
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
			if ((_dots[i].fret + numSteps < 1) || (_dots[i].fret + numSteps > ugsChordBuilder.settings.fretBoard.numFrets)) {
				return false;
			}
		}
		return true;
	};

	this.toggleDot = function(dot) {
		if (dot.fret == 0) {
			clearColumn(dot.string);
			return;
		}

		var index = find(dot);
		if (index < 0) {
			_dots.push(dot);
		} else {
			_dots.splice(index, 1);
		}
	};

	this.toggleFinger = function(dot, finger) {
		var index = find(dot);
		if (index < 0) {
			return false;
		}

		_dots[index].finger = _dots[index].finger == finger ? 0 : finger;
		return true;
	};

	/**
	 * Clears all saved dots.
	 * @method: reset
	 */
	this.reset = function() {
		for (var i = 0; i < ugsChordBuilder.settings.fretBoard.stringNames.length; i++) {
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
		};

		return -1;
	};

	/**
	 * Clears all dots for a particular string.
	 * @param string {int}
	 */
	var clearColumn = function(string) {
		for (var i = _dots.length - 1; i >= 0; i--) {
			if (_dots[i].string == string) {
				_dots.splice(i, 1);
			}
		};
	};

	var getPosition = function(dot) {
		return new ugsChordBuilder.entities.postion(
			ugsChordBuilder.settings.anchorPos.x + 0.47 * ugsChordBuilder.settings.fretBoard.strokeWidth + dot.string * ugsChordBuilder.settings.fretBoard.stringSpace,
			ugsChordBuilder.settings.anchorPos.y + 0.47 * ugsChordBuilder.settings.fretBoard.strokeWidth + (dot.fret - 0.5) * ugsChordBuilder.settings.fretBoard.fretSpace
		);
	};

	var drawDot = function(context, pos) {
		var opts = ugsChordBuilder.settings.dot;

		context.beginPath();
		context.arc(pos.x, pos.y, opts.radius, 0, 2 * Math.PI, false);
		context.fillStyle = opts.fillColor;
		context.fill();
		context.lineWidth = opts.strokeWidth;
		context.strokeStyle = opts.strokeColor;
		context.stroke();
	};

	var addLabel = function(context, pos, text) {
		var opts = ugsChordBuilder.settings.dot;

		context.font = opts.fontWeight + ' ' + opts.fontSize + 'px ' + opts.fontFamily;
		context.textAlign = 'center';
		context.fillStyle = opts.fontColor;
		context.fillText(text, pos.x, pos.y + 0.3 * opts.fontSize);

	};

	this.draw = function(context) {
		for (var i = _dots.length - 1; i >= 0; i--) {
			var pos = getPosition(_dots[i]);
			drawDot(context, pos);
			if (_dots[i].finger > 0) {
				addLabel(context, pos, _dots[i].finger);
			}
		};
	}
};

/**
 *
 * @class
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.cursorCanvas = new function() {
	var _context = null;

	var _handImage = null;
	var _imgOk = false;

	var _dotCursor = true;
	var _finger = 1;

	var _lastPos = {
		x: 0,
		y: 0
	};

	this.init = function(ctx) {
		_context = ctx;
		loadImage();
	};

	var erase = function(pos) {
		var radius = ugsChordBuilder.settings.cursor.radius + ugsChordBuilder.settings.cursor.strokeWidth;
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

		var opts = ugsChordBuilder.settings.dot;

		_context.font = opts.fontWeight + ' ' + opts.fontSize + 'px ' + opts.fontFamily;
		_context.textAlign = 'left';
		_context.fillStyle = 'black'; //opts.fontColor;
		_context.fillText(_finger, pos.x + 0.8 * _handImage.width, pos.y + _handImage.height);
		// not centering pos.x - 0.5 * _handImage.width, pos.y - 0.5 * _handImage.height);
	};

	var loadImage = function() {
		_handImage = new Image();
		_handImage.onload = function() {
			_imgOk = true;
		};
		_handImage.src = ugsChordBuilder.settings.cursor.imageUri;
	};

	var drawDotCursor = function(pos) {
		var opts = ugsChordBuilder.settings.cursor;

		_context.beginPath();
		_context.arc(pos.x, pos.y, opts.radius, 0, 2 * Math.PI, false);
		_context.fillStyle = opts.fillColor;
		_context.fill();
		_context.lineWidth = opts.strokeWidth;
		_context.strokeStyle = opts.strokeColor;
		_context.stroke();
	};

	this.setCursor = function(isDot, finger) {
		_dotCursor = isDot;
		_finger = finger;
	};

	this.draw = function(pos) {
		erase(_lastPos);
		if (!_imgOk || _dotCursor) {
			drawDotCursor(pos);
		} else {
			drawHandCursor(pos);
		}
		_lastPos = pos;
	};
};

/**
 *
 * @class
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.chordCanvas = new function() {
	var _context = null,
		_canvas = null;

	this.init = function(ctx, ele) {
		_context = ctx;
		_canvas = ele;
		ugsChordBuilder.settings.centerAnchor(_canvas);
	};

	var erase = function() {
		_context.clearRect(0, 0, _canvas.width, _canvas.height);
	};

	var addLabel = function(text, color, pos) {
		_context.font = ugsChordBuilder.settings.fretLabel.fontSize + 'px ' + ugsChordBuilder.settings.fretLabel.fontFamily;
		_context.textAlign = 'right';
		_context.fillStyle = color;
		_context.fillText(text, pos.x, pos.y);
	};

	var addLabels = function(startingFret) {
		var pos = new ugsChordBuilder.entities.postion(
			ugsChordBuilder.settings.anchorPos.x - 0.3 * ugsChordBuilder.settings.fretLabel.fontSize,
			ugsChordBuilder.settings.anchorPos.y + ugsChordBuilder.settings.fretLabel.fontSize
		);
		var color = startingFret > 1 ? ugsChordBuilder.settings.fretLabel.color : ugsChordBuilder.settings.fretLabel.lightColor;
		for (var i = 0; i < ugsChordBuilder.settings.fretBoard.numFrets; i++) {
			addLabel(startingFret + i, color, pos);
			pos.y += ugsChordBuilder.settings.fretBoard.fretSpace;
			color = ugsChordBuilder.settings.fretLabel.lightColor;
		};
	};

	var addStringName = function(text, pos) {
		_context.font = ugsChordBuilder.settings.stringLabel.fontSize + 'px ' + ugsChordBuilder.settings.stringLabel.fontFamily;
		_context.textAlign = 'center';
		_context.fillStyle = ugsChordBuilder.settings.stringLabel.color;
		_context.fillText(text, pos.x, pos.y);
	};

	var addStringNames = function() {
		var opts = ugsChordBuilder.settings.fretBoard;

		var pos = new ugsChordBuilder.entities.postion(
			ugsChordBuilder.settings.anchorPos.x + 0.5 * opts.strokeWidth,
			ugsChordBuilder.settings.anchorPos.y - 0.25 * ugsChordBuilder.settings.fretLabel.fontSize
		);

		for (var i = 0; i < opts.stringNames.length; i++) {
			addStringName(opts.stringNames[i], pos);
			pos.x += opts.stringSpace;
		}
	};

	var drawFretboard = function() {
		// shorthand handles:
		var anchor = ugsChordBuilder.settings.anchorPos;
		var fretBox = ugsChordBuilder.settings.fretBoard;

		// width offset, a "subpixel" adjustment
		var offset = fretBox.strokeWidth / 2;
		// locals
		var stringHeight = fretBox.numFrets * fretBox.fretSpace;
		var fretWidth = (fretBox.stringNames.length - 1) * fretBox.stringSpace;
		// build shape
		_context.beginPath();
		// add "C" & "E" strings
		for (var i = 1; i < (fretBox.stringNames.length - 1); i++) {
			var x = anchor.x + i * fretBox.stringSpace + offset;
			_context.moveTo(x, anchor.y + offset);
			_context.lineTo(x, anchor.y + stringHeight + offset);
		}
		// add frets
		for (var i = 1; i < fretBox.numFrets; i++) {
			var y = anchor.y + i * fretBox.fretSpace + offset;
			_context.moveTo(anchor.x + offset, y);
			_context.lineTo(anchor.x + fretWidth + offset, y);
		}
		//
		_context.rect(anchor.x + offset, anchor.y + offset, fretWidth, stringHeight);
		// stroke shape
		_context.strokeStyle = fretBox.strokeColor;
		_context.lineWidth = fretBox.strokeWidth;
		_context.stroke();
		_context.closePath();
	};

	this.draw = function(pos, startingFret) {
		erase();
		// ugsChordBuilder.debugTargets.drawTargets(_context);
		addLabels(startingFret);
		addStringNames();
		drawFretboard();
		ugsChordBuilder.fretDots.draw(_context);
	};
};

/**
 *
 * @class
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.export = new function() {
	var _fretOffset = null;

	/**
	 * Class for "reorganized" dots, think of this as a necklace where the
	 * thread, the instrument string, has zero or more beads, or dots -- fret plus finger
	 * @class  stringDots
	 * @private
	 * @param  {int} string
	 * @param  {dot_Array} dots
	 */
	var stringDots = function(string, dots) {
		this.string = string;
		this.dots = dots ? dots : [];
		//this.fingers = fingers ? fingers : [];
	};

	var getStringDots = function() {
		// initialize empty string array
		var aryStringDots = [];
		for (var stringNumber = 1; stringNumber <= ugsChordBuilder.settings.fretBoard.stringNames.length; stringNumber++) {
			aryStringDots.push(new stringDots(stringNumber));
		};

		// add dots
		var dots = ugsChordBuilder.fretDots.getDots();
		for (var stringNumber = aryStringDots.length - 1; stringNumber >= 0; stringNumber--) {
			for (var i = dots.length - 1; i >= 0; i--) {
				if (aryStringDots[stringNumber].string == dots[i].string + 1) {
					aryStringDots[stringNumber].dots.push(dots[i]);
				}
			};
		};

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
		};
		return 0;
	};

	/**
	 * Returns an array of ints, one for each string, with the HIGHEST REAL fret appearing on that string.
	 * Default is zed per string.
	 * @method getPrimaryFrets
	 * @param  {int} startingFret
	 * @return {int}
	 */
	this.getPrimaryFrets = function(startingFret) {
		_fretOffset = startingFret - 1;
		var dotsPerString = getStringDots();
		var primaries = [];
		for (var i = 0; i < dotsPerString.length; i++) {
			var minMax = getMinMax(dotsPerString[i].dots);
			primaries.push(fretNumber(minMax.max));
		};
		return primaries;
	};

	/**
	 * Returns complete ChordPro definition statement
	 * @action getDefinition
	 * @param  {string} chordName
	 * @param  {int} startingFret
	 * @return {string}
	 */
	this.getDefinition = function(chordName, startingFret) {
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
		};

		// no double spaces, no space before the closing "}"
		return ('{define: ' + name + ' frets ' + fretsStr + ' fingers ' + fingersString + addsString + '}').replace(/\s+/g, ' ').replace(' }', '}');
	};

	/**
	 * Returns "highlighted" (HTML-ified) ChordPro definition statement.
	 * @action getDefinition
	 * @param  {string} chordName
	 * @param  {int} startingFret
	 * @return {string}
	 */
	this.getDefinitionHtml = function(chordName, startingFret) {
		chordName = scrub(chordName);
		// Keep regexs simple by a couple cheats:
		// First, using 'X07MX001' as my CSS clasname prefix to avoid collisions.
		// We temporarily remove the name, then put it back in the very last step.
		var html = this.getDefinition(chordName, startingFret);
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
	 * @action scrub
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
		return cleaned.substring(0, ugsChordBuilder.settings.chord.nameMaxLength);
	};
};
;/**
 *
 * @class chooserList
 * @namespace ugsChordBuilder
 * @static
 */
ugsChordBuilder.chooserList = new function() {
	// array of custom chords defined in this song
	var _chordDictionary = [];
	// handle to HTML UL element
	var _eleChordList = null;

	/**
	 * magic value for start a new chord
	 * @constant
	 * @name C_NEW_CHORD
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
	 * @field
	 */
	var _currentChord = null;

	/**
	 * Handle to the chordBuilder (UI) "setChord" method
	 * @field
	 */
	var _setChordMethod = function() {};

	/**
	 * "safe" this handle for buried references.
	 * @field
	 */
	var _that = this;

	/**
	 * Hanlde to instance of Scriptasaurus chord brush class, to paint the wee little
	 * chord diagrams onto the Chooser List.
	 * @field _ugsBrushTool
	 * @type {Object}
	 */
	var _ugsBrushTool = null;

	/**
	 * Required settings for the Chord Brush -- dimensions, fonts, and colors.
	 * @field _diagramSettings
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
	this.init = function(setChordFunction) {
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

	this.reset = function() {
		_chordDictionary = [];
		document.getElementById(_ids.chordList).innerHTML = '';
		_nextId = 0;
		_currentChord = null;
		_start();
	};

	/**
	 * Shows either the "Chooser" or "Chord Builder/Editor" panel.
	 * @param {bool} isChooserPanel
	 */
	this.show = function(isChooserPanel) {
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
	this.save = function(data) {
		if (dictionaryFindDupes(_currentChord == null ? -1 : _currentChord.id, data.name) >= 0) {
			alert('Hey, this chord name is already being used.');
			return false;
		}
		var id = -1;
		if (_currentChord == null) {
			id = definitionAdd(data.name, data.definition);
			_currentChord = dictionaryFind(id);
			songAddDefinition(data.definition);
		} else {
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
		this.show(true);
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
		_that.show(false);
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
			};
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
		} else {
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
		};
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
		var s = '';
		for (var i = 0; i < chordDefs.length; i++) {
			s += listHtmlString(chordDefs[i].id, chordDefs[i].name);
		}
		ul.innerHTML = '<li data-id="' + C_NEW_CHORD + '" class="newChord">+ Add New Chord</li>' + s;

		var items = ul.getElementsByTagName('li');
		for (var i = items.length - 1; i >= 0; i--) {
			if (i < 1) {
				continue;
			}
			listAddDiagram(items[i].getAttribute('data-id'));
		};
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
	 * @param  {string}
	 */
	var songAddDefinition = function(definition) {
		var e = document.getElementById(_ids.source);
		var instructionRegEx = /\s*\{\s*(title|t|artist|subtitle|st|album|define):.*?\}/im;
		var lines = e.value.split('\n');
		var html = '';
		var inserted = false;
		for (var i = lines.length - 1; i >= 0; i--) {
			if (!inserted && instructionRegEx.test(lines[i])) {
				html = definition + '\n' + html;
				inserted = true;
			}
			html = lines[i] + '\n' + html;
		};
		e.value = html;
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
		};

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
	 * @param {string} name
	 * @param {string} definition
	 * @retugn {int}
	 */
	var definitionAdd = function(name, definition) {
		var chord = new ChordDefinition(name, definition);
		_chordDictionary.push(chord);
		return chord.id;
	};

};
;
/**
 * Doing
 * @class editorUi
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
		// 		openBtn: 'cdBldOpenBtn'
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
	 * @name _fingerNames
	 * @enum {JSON}
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
		if (!ugsChordBuilder.chooserList.save(d)){
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
			ugsDots.push(new ugsChordBuilder.entities.dot(builderDots[i].string, (fret < 0 ? 0 : fret), builderDots[i].finger));
		};
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
		};
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
			};
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
		} else if (!isSet && hasClass) {
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
		};
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
		_startingFret = parseInt(this.value);
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
		} else {
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
		} else if (ugsChordBuilder.fretDots.toggleFinger(dot, _finger)) {
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
		return new ugsChordBuilder.entities.postion(
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
		pos = pos || new ugsChordBuilder.entities.postion(0, 0);
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

	this.reload = function(){
		reset();
		ugsChordBuilder.chooserList.reset();
		ugsChordBuilder.chooserList.show(true);
	};

};