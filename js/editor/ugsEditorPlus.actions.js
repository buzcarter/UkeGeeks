/**
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
