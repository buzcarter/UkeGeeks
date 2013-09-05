/**
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
		return (object1.x < object2.x + object2.width) && (object1.x + object1.width  > object2.x) && (object1.y < object2.y + object2.height) && (object1.y + object1.height > object2.y);
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