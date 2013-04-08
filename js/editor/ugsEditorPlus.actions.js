/**
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
	var _priorValues = {
		placement : '#above'
	};

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
	 * Chord Name placement (&amp; "Mini-chord diagrams")
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

		if (isMiniDiagrams || (_priorValues.placement == '#miniDiagrams')){
			ukeGeeks.settings.inlineDiagrams = isMiniDiagrams;
			_this.run();
		}
		else if (!isMiniDiagrams && (_priorValues.placement != '#miniDiagrams')) {
			// we're jumping between "above" and "inline", either way we need to
			// manually fix the overlaps
			ukeGeeks.overlapFixer.Fix(_ele.songText);
		}


		_priorValues.placement = subMenu;
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
