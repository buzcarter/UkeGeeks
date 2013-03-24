/**
  *
  * @module  UkeGeeksScriptasaurus Editor+
  * @namespace  ugsEditorPlus
  * @class ugsEditorPlus
  */
var ugsEditorPlus = new function(){
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

		ugsEditorPlus.menus.init();
		ugsEditorPlus.actions.init(isLegacyIe);
		ugsEditorPlus.actions.run();
	};

	/**
	 * wraps the private Init method for modern browsers
	 * @method attach
	 * @public
	 */
	this.attach = function(){
		init(false);
	};

	/**
	 * wraps the private Init method, required for Legacy Internet Exploere (pre-9)
	 * @method attach
	 * @public
	 */
	this.attachIe = function(){
		init(true);
	};

};

;/**
 * Does the work; adjust CSS classes on page, runs Scriptasaurus
 * @class actions
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.actions = new function(){
	var _this = this;

	// legacy IE flag
	var _isCrap = false;

	// handles to key/frequently accessed DOM Elements (see init()
	var _ele = {};

	// misc
	var _song = null;
	//
	var _sourceOriginal = null;
	var _originalChords = [];
	// prior placement
	var _priorValue = '#above';

	var re = {
		safe: /^([A-G][#b]?)(m|m6|7|m7|dim|maj7|6|sus2|sus4|aug|9)?$/,
	};

	/**
	 * Sets up this class; modifies form elements; attaches event handlers, etc
	 * @method init
	 * @public
	 * @param NAME {type} DECR
	 */
	this.init = function(isLegacyIe){
		_isCrap = isLegacyIe;

		_ele = {
			docBody : document.getElementsByTagName('body')[0],
			songText : document.getElementById('ukeSongText'),
			songContainer : document.getElementById('ukeSongContainer'),
			cpmSource : document.getElementById('chordProSource'),
			scalableArea : document.getElementById('scalablePrintArea')
		};

		// button clicks
		document.getElementById('updateBtn').onclick = function(){doUpdate(); return false;};

		// show/hide dialogs
		var eSourceDlg = document.getElementById('songSourceDlg');
		document.getElementById('hideSourceBtn').onclick = function(){return doShowDlg(eSourceDlg, false); };
		document.getElementById('showSourceBtn').onclick = function(){return doShowDlg(eSourceDlg, true); };

		var eHelpDlg = document.getElementById('helpDlg');
		document.getElementById('hideHelpBtn').onclick = function(){return doShowDlg(eHelpDlg, false); };
		document.getElementById('showHelpBtn').onclick = function(){return doShowDlg(eHelpDlg, true); };

		var eOptionsDlg = document.getElementById('optionsDlg');
		document.getElementById('hideOptionsBtn').onclick = function(){return doShowDlg(eOptionsDlg, false); };
		document.getElementById('showOptionsBtn').onclick = function(){return doShowDlg(eOptionsDlg, true); };

		// Options/settings
		ugsEditorPlus.optionsDlg.init(this, _ele);
	};

	/**
	 * DESCR
	 * @method doClick
	 * @public
	 * @param NAME {type} DECR
	 */
	this.doClick = function(mainMenu, subMenu){
		switch (mainMenu){
			case '#zoom':
				doZoom(subMenu);
				break;
			case '#layout':
				doLayout(subMenu);
				break;
			case '#placement':
				doPlacement(subMenu);
				break;
			case '#tuning':
				doTuning(subMenu);
				break;
			case '#colors':
				doColors(subMenu);
				break;
			case '#transpose':
				doTranspose(subMenu);
				break;
			default:
				console.log('Unrecognized ' + mainMenu + ' > ' + subMenu);
		}
	};

	/**
	 * DESCR
	 * @method doUpdate
	 * @private
	 */
	var doUpdate = function(){
		_this.run(true);
	};

	/**
	 * DESCR
	 * @method doZoom
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doZoom = function(subMenu){
		var prct = (parseInt(subMenu.substr(6), 10) / 100);

		var width = Math.round(prct * 225);

		_ele.scalableArea.style.fontSize = (prct * 12) + 'pt';

		var s = ugsEditorPlus.styles.getSheet('ugsEditorCss');
		var m = s.Find('.scalablePrintArea .ugs-diagrams-wrap canvas');
		m.style.width = Math.round(prct * 100) +'px';

		m = s.Find('.scalablePrintArea .ugs-diagrams-wrap');
		m.style.width = width +'px';

		m = s.Find('.scalablePrintArea .ugs-source-wrap');
		m.style.marginLeft = (25 + width) +'px';
	};

	/**
	 * DESCR
	 * @method doLayout
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doLayout = function(subMenu){
		ukeGeeks.toolsLite.setClass(_ele.docBody, 'diagramsOnTop', (subMenu == '#top'));
		ukeGeeks.toolsLite.setClass(_ele.docBody, 'diagramsOnSide', (subMenu == '#left'));
		ukeGeeks.toolsLite.setClass(_ele.docBody, 'ugsHideDiagrams', (subMenu == '#none'));
	};

	/**
	 * DESCR
	 * @method doPlacement
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doPlacement = function(subMenu){
		ukeGeeks.toolsLite.setClass(_ele.songContainer, 'ugsInline', (subMenu == '#inline'));

		// NOTE: ugs already adds the "chord diagrams above" class based on setting,
		// BUT does NOT remove it!!!!
		var isMiniDiagrams = (subMenu == '#miniDiagrams');
		if (!isMiniDiagrams){
			ukeGeeks.toolsLite.removeClass(_ele.songContainer, 'ugsInlineDiagrams');
		}

		if (isMiniDiagrams || (_priorValue == '#miniDiagrams')){
			ukeGeeks.settings.inlineDiagrams = isMiniDiagrams;
			_this.run();
		}

		_priorValue = subMenu;
	};

	/**
	 * DESCR
	 * @method doTuning
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doTuning = function(subMenu){
		var tuning = (subMenu == '#baritone')
			? ukeGeeks.definitions.instrument.baritoneUke
			: ukeGeeks.definitions.instrument.sopranoUke;

		ukeGeeks.scriptasaurus.setTuningOffset(tuning);
		_this.run();
	};

	// available color schemes
	var _colorSchemes = {
		'#reversed' : {
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

		'#normal' : {
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
	 * DESCR
	 * @method doColors
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doColors = function(subMenu){
		ukeGeeks.toolsLite.setClass(_ele.docBody, 'reversed', subMenu == '#reversed');

		var c = _colorSchemes[subMenu];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;

		_this.run();
	};

	/**
	 * DESCR
	 * @method doTranspose
	 * @private
	 * @param subMenu {string} value of the clicked submenu item (href value)
	 */
	var doTranspose = function(subMenu){
		var sign = subMenu[1] == 'u' ? 1 : -1;
		var steps = parseInt(subMenu[subMenu.length - 1], 10);
		transpose(sign * steps);
		// _this.
	};

	/**
	 * DESCR
	 * @method doShowDlg
	 * @private
	 * @param element {DOM} handle to overlay to show/hide
	 * @param isActive {bool} TRUE means show the overlay
	 */
	var doShowDlg = function(element, isActive){
		ukeGeeks.toolsLite.setClass(element, 'isHidden', !isActive);
		return false;
	};

	/**
	 * Rebuilds song, info, chord diagrams using current settings.
	 * @method run
	 * @param isDoBackup {bool} true forces backup; optional, default false.
	 */
	this.run = function(isDoBackup){
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
				ugsEditorPlus.menus.resetTranspose(_song.chords.length < 1 ? '' : _song.chords[0]);
			}
		}
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
			if (re.safe.test(_originalChords[i])){
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
		_this.run();

	};

};

;/**
 * Handles transfering the easy text bits of a Song -- title, artist, etc -- to the page.
 * @class songUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songUi = new function(){
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
	this.update = function(song){
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

};


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
 * Mechanics of the Optiones/Settings dialog
 * @class options
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = new function(){
	// borrow (a  property and method) from Actions class
	var run = null;
	var _ele = null;

	// DOM element handles
	var _inputIgnoreList = null;
	var _chkIgnore = null;

	this.init = function(actionsController, elements){
		run = actionsController.run;
		_ele = elements;

		document.getElementById('pageWidth').onchange = function(){doSetWidth(this.value); };
		document.getElementById('chkEnclosures').onclick = function(){doSetEnclosure(!this.checked); };

		_inputIgnoreList = document.getElementById('commonChordList');
		// initialize the common list
		_inputIgnoreList.value = ukeGeeks.settings.commonChords.join(", ");
		_inputIgnoreList.onchange = function(){doSetCommon(); };

		_chkIgnore = document.getElementById('chkIgnoreCommon');
		_chkIgnore.onclick = function(){doIgnoreChkClk(); };
	};

	/**
	 * (option dialog) changes body class, moving the right page edge
	 * @method doSetWidth
	 * @private
	 * @param value {string} currently selected option value
	 */
	var doSetWidth = function(value){
		var opts = ['letter', 'a4', 'screen'];
		for(var i = 0; i < opts.length; i++){
			ukeGeeks.toolsLite.removeClass(_ele.docBody, 'pageWidth_' + opts[i]);
		}
		ukeGeeks.toolsLite.addClass(_ele.docBody, 'pageWidth_' + value);
	};

	/**
	 * (option dialog) change whether to show/hide the bracket characters
	 * @method doSetEnclosure
	 * @private
	 * @param isVisible {bool}
	 */
	var doSetEnclosure = function(isVisible){
		ukeGeeks.settings.opts.retainBrackets = isVisible;
		run();
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method doIgnoreChkClk
	 * @return {void}
	 */
	var doIgnoreChkClk = function(){
		ukeGeeks.settings.opts.ignoreCommonChords = _chkIgnore.checked;
		run();
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * and _possible_ rerun
	 * @method doSetCommon
	 * @return {void}
	 */
	var doSetCommon = function(){
		var inputList = _inputIgnoreList.value.split(/[ ,]+/);
		var chordList = [];
		for (var i = 0; i < inputList.length; i++) {
			var c = ukeGeeks.toolsLite.trim(inputList[i]);
			if (c.length > 0){
				chordList.push(c);
			}
		};

		ukeGeeks.settings.commonChords = chordList;

		if (_chkIgnore.checked){
			run();
		}
	};


};

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
	 * @class enums
	 */
	var enums = {
		lineTypes : {
			blank : 0,
			chords : 1,
			lyrics : 2,
			tabs : 3
		}
	}

	/**
	 *
	 * @class lineObj
	 */
	var lineObj = function(){
		this.source = '';
		this.wordCount = 0;
		this.spaceCount = 0;
		this.words = [];
		this.chordCount = 0;
		this.lineType = enums.lineTypes.blank;
	};

	var re = {
		words : /\b(\S+)\b/gi,
		spaces : /(\s+)/g,
		leadingSpace : /(^\s+)/,
		chordNames : /\b[A-G][#b]?(m|m6|m7|m9|dim|dim7|maj7|sus2|sus4|aug|6|7|9|add9)?\b/,
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
			var words = lines[i].match(re.words);
			var l = new lineObj;
			l.source = lines[i];
			if ((words != null) && (words.length > 0)){
				l.wordCount = words.length;
				l.words = words;
				l.chordCount = countChords(words);
			}
			var spaces = lines[i].match(re.spaces);
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
	 * @return {enums.lineTypes}
	 */
	var toLineType = function(line){
		if ((line.spaceCount + line.wordCount) < 1){
			return enums.lineTypes.blank;
		}

		var tabs = line.source.match(re.tabs);
		if (tabs != null){
			return enums.lineTypes.tabs;
		}

		var t = enums.lineTypes.lyrics;
		if ((line.chordCount > 0) && (line.wordCount == line.chordCount)){
			t = enums.lineTypes.chords;
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
			if (words[i].match(re.chordNames)) {
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
			if (!nextLine || (thisLine.lineType == enums.lineTypes.blank)){
				s += thisLine.source + '\n';
				continue;
			}

			// OK, we've complicated things a bit by adding tabs, so we'll handle this in a helper...
			if ((thisLine.lineType == enums.lineTypes.tabs) && isTabBlock(lines, i)){
				s += '{start_of_tab}\n'
					+ thisLine.source.replace(re.leadingSpace, '') + '\n'
					+ nextLine.source.replace(re.leadingSpace, '') + '\n'
					+ lines[i+1].source.replace(re.leadingSpace, '') + '\n'
					+ lines[i+2].source.replace(re.leadingSpace, '') + '\n'
					+ '{end_of_tab}\n';
				i+= 3;
				continue;
			}

			// finally, look for a "mergable" pair: this line is chords and the next is lyrics -- if not this we'll just output the current line
			if ((thisLine.lineType != enums.lineTypes.chords) || (nextLine.lineType != enums.lineTypes.lyrics)){
				s += (thisLine.lineType == enums.lineTypes.chords)
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
			if (lines[i].lineType != enums.lineTypes.tabs){
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
		var blocks = chordLine.match(re.chrdBlock);
		var lead = chordLine.match(re.leadingSpace);
		var offset = 0;
		if (lead){
			s += lyricsLine.substr(offset, lead[0].length);
			offset = lead[0].length;
		}
		for (var j = 0; j < blocks.length; j++) {
			s += '[' + blocks[j].replace(re.spaces, '') + ']' + lyricsLine.substr(offset, blocks[j].length);
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
		var chords = chordLine.replace(re.spaces, ' ').split(' ');
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
ugsEditorPlus.autoReformat = new function(){
	var _this = this;
	var _elements;
	var _formatted;
	var _isDisabled = false;

	this.run = function(elements){
		if (_isDisabled){
			return;
		}
		_elements = elements;
		_elements.reformatTextBox = document.getElementById('reformatSource');
		_elements.reformatDlg = document.getElementById('reformatDlg');

		document.getElementById('reformatYesBtn').onclick = function(){ doOk(); return false; };
		document.getElementById('reformatNoBtn').onclick = function(){ doClose(); return false; };

		// need to reset on reload
		var chk = document.getElementById('reformatDisable');
		chk.checked = false;
		chk.onclick = function(){ doDisable(this.checked); };

		runNow();
	};

	var doOk = function(){
		_elements.cpmSource.value = _formatted;
		doClose();
		ugsEditorPlus.actions.run(true);
	};

	var doClose = function(){
		ukeGeeks.toolsLite.addClass(_elements.reformatDlg, 'isHidden');
	};

	var doDisable = function(isDisabled){
		_isDisabled = isDisabled;
	};

	var runNow = function(){
		_formatted = ugsEditorPlus.reformat.run(_elements.cpmSource.value);
		_elements.reformatTextBox.innerHTML = _formatted;

		if (!ugsEditorPlus.reformat.hasChords()){
			return;
		}

		ukeGeeks.toolsLite.removeClass(_elements.reformatDlg, 'isHidden');
	};
}
;
/**
 * Handles Menu UI - show/hide, set checked state, calls actions
 * @class menus
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.menus = new function(){
	// top level LI (list items)
	var _menuItems;
	// currently selected top menu href ('#top')
	var _topBtnUl = null;
	var _topBtnHref = '';
	// currently selected sub-menu item's href ('#sub')
	var _subBtnHref = '';
	// associative array/JSON of last click event
	var _prevValues = {
		'#layout' : '#left',
		'#placement' : '#above',
		'#tuning' : '#soprano',
		'#zoom' : '#prct_100',
		'#transpose' : '#up_0',
		'#colors' : '#normal'
	};

	/**
	 * DESCRIPTION
	 * @method init
	 * @return {void}
	 */
	this.init = function(){
		_menuItems = document.getElementById('ugsAppToolbar').getElementsByTagName('ul')[0].children;
		addSizeOptions();
		attachClicks();
	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method attachClicks
	 * @return {void}
	 */
	var attachClicks = function() {
		for (var i = 0; i < _menuItems.length; i++){
			var topBtn = _menuItems[i].getElementsByTagName('a')[0];
			var ul = _menuItems[i].getElementsByTagName('ul');
			if (ul.length < 1){
				topBtn.onclick = function(){closeAll(); return false;};
				continue;
			}

			topBtn.onclick = function(){switchActiveMenu(this); return false;};

			var items = _menuItems[i].getElementsByTagName('li');
			for(var j = 0; j < items.length; j++){
				var subBtn = items[j].getElementsByTagName('a')[0];
				subBtn.onclick = function(){subBtnClick(this); return false;};
			}
		}
	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method switchActiveMenu
	 * @param ele (DOM_element)
	 * @return {void}
	 */
	var switchActiveMenu = function(ele){
		var isOpen = ukeGeeks.toolsLite.hasClass(ele.parentNode, 'active');
		closeAll();
		if (isOpen) {
			return;
		}
		ukeGeeks.toolsLite.addClass(ele.parentNode, 'active');
		_topBtnUl = ele.parentNode.getElementsByTagName('ul')[0];
		_topBtnHref = getHref(ele);

	};

	/**
	 * DESCRIPTION
	 * @private
	 * @method subBtnClick
	 * @param ele (DOM_element)
	 * @return {void}
	 */
	var subBtnClick = function(ele){
		closeAll();
		_subBtnHref = getHref(ele);

		if (_prevValues[_topBtnHref] == _subBtnHref){
			return;
		}
		// remove
		for (var i = 0; i < _topBtnUl.children.length; i++){
			ukeGeeks.toolsLite.removeClass(_topBtnUl.children[i], 'checked');
		}
		// set checked item
		ukeGeeks.toolsLite.addClass(ele.parentNode, 'checked');

		ugsEditorPlus.actions.doClick(_topBtnHref, _subBtnHref);
		_prevValues[_topBtnHref] = _subBtnHref;
	};

	/**
	 * To support legacy IE need to cleanup the href's
	 * @method getHref
	 * @private
	 * @param ele (DOM_element)
	 * @return {string}
	 */
	var getHref = function(ele){
		return '#' + ele.getAttribute('href').split('#')[1];
	};

	/**
	 * DESCRIPTION
	 * @method closeAll
	 * @private
	 * @return {void}
	 */
	var closeAll = function(){
		for (var i = 0; i < _menuItems.length; i++){
			ukeGeeks.toolsLite.removeClass(_menuItems[i], 'active');
		}
	};

	/**
	 * DESCR
	 * @method addSizeOptions
	 * @private
	 * @param element {DOM_element} handle to HTML Select tag that was clicked
	 */
	var addSizeOptions = function(){
		var s = '';
		var size = 0;
		for(var i = 50; i < 120; i += 5){
			size++;
			var selected =  (i == 100) ? 'class="checked"' : '';
			var pt = '';
			switch (i){
				case 50:
				case 60:
				case 75:
				case 85:
				case 90:
				case 100:
				case 115:
					pt = '<em>' + Math.round((i / 100) * 12) + 'pt</em>'; //'DW bug
					break;
			}
			//pt = ' &nbsp;&nbsp;&nbsp;' + Math.round(10 * (i / 100) * 12) + 'pt';
			s += '<li ' + selected + '><a href="#prct_' + i + '">' + i + '%' + pt + '</a></li>';
		}
		var element = document.getElementById('printScale');
		element.innerHTML = s;
		// element.size = size;
	};

/**
	 * Sets Transpose menu's selected value to "Original"; adds example chord names
	 * @method resetTranspose
	 * @param chord {string}
	 */
	this.resetTranspose = function(chord){
		var ul = document.getElementById('transposeOptions');
		var items = ul.getElementsByTagName('li');
		var sample;
		var steps = -6;

		_prevValues['#transpose'] = '#up_0';

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
};

