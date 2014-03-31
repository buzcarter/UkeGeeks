
/**
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

	this.reload = function(){
		reset();
		ugsChordBuilder.chooserList.reset();
		ugsChordBuilder.chooserList.show(true);
	};

};