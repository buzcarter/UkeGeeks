/**
 * <ul>
 * <li>Project: UkeGeeks' Scriptasaurus</li>
 * <li>Version: 1.4.3</li>
 * <li>Homepage: http://ukegeeks.com</li>
 * <li>Project Repository: https://github.com/buzcarter/UkeGeeks</li>
 * <li>Author: Buz Carter</li>
 * <li>Contact: buz@ukegeeks.com</li>
 * <li>Copyright: Copyright 2010-2014 Buz Carter.</li>
 * <li>License GNU General Public License (http://www.gnu.org/licenses/gpl.html)</li>
 * </ul>
 *
 * <h3>Overview</h3>
 * <p>Reads marked-up music (lyrics + chords) extracting all of the chords used;
 * Generates a chord diagrams using HTML5 &lt;canvas&gt; and rewrites the music with
 * standard HTML wrapping the chords.</p>
 *
 * @module ukeGeeks
 * @main ukeGeeks
 */
var ukeGeeks = window.ukeGeeks || {};
;/**
 * Defines chords and provides simple lookup (find) tools.
 * @class definitions
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.definitions = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Array of "user" defined chords, in compactChord format. Use "Add" method.
	 * @property _userChords
	 * @type array
	 * @private
	 */
	var _userChords = [];

	var _chords = [];

	var _instruments = [];

	var _offset = 0;
	var _map = [];

	/**
	 * Enum (simple JSON name/value pairs) defining instrument tunings (offsets from standard Soprano Ukulele)
	 * @property instrument
	 * @type JSON
	 */
	_public.instrument = {
		sopranoUke: 0, // GCEA
		baritoneUke: 5 // DGBA -- Baritone's "A" fingering is the Soprano's "D"
	};

	/* PUBLIC METHODS
	------------------------------------ */
	/**
	 * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
	 * @method addInstrument
	 * @param definitions {mixed} (Either string or array of strings) Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
	 * @return {void}
	 */
	_public.addInstrument = function(definitions) {
		if (typeof definitions === 'object') {
			// flatten the array
			definitions = definitions.join("\n");
		}
		_instruments.push(definitions);
	};

	/**
	 * Choose which instrument's chord dictionary you want used for the chord
	 * diagrams. NOTE: .
	 * @method useInstrument
	 * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
	 * @return {void}
	 */
	_public.useInstrument = function(offset) {
		offset = (arguments.length > 0) ? offset : _public.instrument.sopranoUke;
		_offset = parseInt(offset, 10);
		if (_offset > 0) {
			_map = ukeGeeks.transpose.retune(_offset);
		}
		_public.setChords(ukeGeeks.chordImport.runBlock(_instruments[0]).chords);
	};

	/**
	 * Returns expanded ChordObject for requested "chord"
	 * @method get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	_public.get = function(chordName) {
		var i, c, chrd, name;

		// try User Defined chords first
		for (i = 0; i < _userChords.length; i++) {
			if (chordName == _userChords[i].name) {
				return _userChords[i];
			}
		}
		// next: built-in chords:
		if (_offset < 1) {
			return _get(chordName);
		}

		// user has retuned the chords, need to find chord name "as-is",
		// but get the fingering from the mapping
		name = _getAlias(chordName);
		for (i in _map) {
			if (name == _map[i].original) {
				c = _get(_map[i].transposed);
				if (c) {
					chrd = new ukeGeeks.data.expandedChord(chordName);
					chrd.dots = c.dots;
					chrd.muted = c.muted;
					return chrd;
				}
			}
		}

		return null;
	};

	// local substitions (replacements for identical chord shapes)
	var _aliases = {
		'A#': 'Bb',
		'Db': 'C#',
		'D#': 'Eb',
		'Gb': 'F#',
		'Ab': 'G#'
	};

	/**
	 * A chord name normalizer: We don't store any chord definitions for A#, Db, D#, Gb, or Ab. Instead
	 * definitions of the more common notes are stored instead. So for the A# fingering we return the
	 * Bb fingering and so on.
	 *
	 * Returns original chord name if there is no defined alias.
	 *
	 * @method _getAlias
	 * @param  {string} chordName [
	 * @return {string}
	 */
	var _getAlias = function(chordName) {
		var n = chordName.substr(0, 2);
		return !_aliases[n] ? chordName : _aliases[n] + chordName.substr(2);
	};

	/**
	 * Pass in "standard" chord name, returns match from defined chords or null if not found
	 * @private
	 * @method _get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	var _get = function(chordName) {
		var i, chrd,
			name = _getAlias(chordName);
		for (i = 0; i < _chords.length; i++) {
			if (name == _chords[i].name) {
				chrd = new ukeGeeks.data.expandedChord(chordName);
				chrd.dots = _chords[i].dots;
				chrd.muted = _chords[i].muted;
				return chrd;
			}
		}
		return null;
	};

	/**
	 * @method add
	 * @param data {array} array of expanded chord objects
	 * @return {int}
	 */
	_public.add = function(data) {
		if (data.length) {
			for (var i = 0; i < data.length; i++) {
				_userChords.push(data[i]);
			}
		}
		return _userChords.length;
	};

	/**
	 * @method replace
	 * @param data {array} array of expanded chord objects
	 * @return {int}
	 */
	_public.replace = function(data) {
		_userChords = [];
		return _public.add(data);
	};

	/**
	 * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
	 * @method getChords
	 * @return {arrayChords}
	 */
	_public.getChords = function() {
		return _chords;
	};

	_public.setChords = function(value) {
		_chords = value;
	};

	return _public;
}());
;/**
 * Customize your installation. This JSON object controls appearance and
 * HTML element names. It's divided into four sections: graphics, ids, layout,
 * and "options".
 *
 * @class settings
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.settings = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Chord Diagram Font styles -- font size, font-weight, font-face stack, etc.
	 * @property fonts
	 * @type JSON Object
	 */
	_public.fonts = {
		dot: '9pt Arial Black,Arial',
		text: 'bold 14pt Arial',
		fret: 'bold 13pt Arial'
	};

	/**
	 * Chord Diagram Colors for fretboard's grid lines and text. Don't use shorthand (i.e. "#0ff")
	 * as this might cause a problem with IE canvas.
	 * @property colors
	 * @type JSON Object
	 */
	_public.colors = {
		fretLines: '#003366',
		dots: '#ff0000',
		dotText: '#ffffff',
		text: '#000000',
		fretText: '#4a4a4a',
		// a muted string's 'X' stroke color
		xStroke: '#444444'
	};

	/* Standard Fretbox Options, these properties documented individually */
	_public.fretBox = {
		/**
		 * True if chord name and finger "number" are to be drawn on canvas.
		 * By default normal chord diagrams have text (TRUE) whereas inlineDiagrams
		 * (i.e. chord diagrams shown above lyrics) do NOT as they are too small
		 * (thus inlineFretbox.showText is FALSE)
		 * @property fretBox.showText
		 * @type bool
		 */
		showText: true,
		/**
		 * Chord Box's Bounding height
		 * @property fretBox.height
		 * @type int
		 */
		height: 150,
		/**
		 * Chord Box's Bounding width
		 * @property fretBox.width
		 * @type int
		 */
		width: 100,
		/**
		 * Row Height -- vertical height between frets (pixels)
		 * @property fretBox.fretSpace
		 * @type int
		 */
		fretSpace: 20,
		/**
		 * String Spacing -- horizontal distance between strings (pixels)
		 * @property fretBox.stringSpace
		 * @type int
		 */
		stringSpace: 20,
		/**
		 * Dot (finger position) radius in pixels
		 * @property fretBox.dotRadius
		 * @type int
		 */
		dotRadius: 8,
		/**
		 * Fretboard line width in pixels
		 * @property fretBox.lineWidth
		 * @type decimal
		 */
		lineWidth: 1.6,
		/**
		 * top-left position -- the offset for chord box. Doing this programatically
		 * had "issues", decided to make this adjustment manual.
		 * @property fretBox.topLeftPos
		 * @type JSON
		 */
		topLeftPos: {
			x: 22,
			y: 25
		},
		/**
		 * muted string "X" width of the 'X' crossbars. Recommend this be about 0.5 to 0.9 relative to stringSpace.
		 * @property fretBox.xWidth
		 * @type decimal
		 */
		xWidth: 0.45 * 20,
		/**
		 * muted string "X" stroke thickness. Recommend this be about 1.3 to 2.1 relative to lineWidth
		 * @property fretBox.xStroke
		 * @type decimal
		 */
		xStroke: 1.6 * 1.6
	};

	/**
	 * Layout of Chord Digrams when inlineFredBoxes are being used. Identical in
	 * structure to "fretBox". See fretBox for properties.
	 * @property layout
	 * @type JSON Object
	 */
	_public.inlineFretBox = {
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
		xStroke: 1.4 * 1,
		fonts: {
			dot: '8pt Arial',
			text: '8pt Arial',
			fret: '8pt Arial'
		}
	};

	/**
	 * ID's of key HTML page elements
	 * @property ids
	 * @type JSON Object
	 */
	_public.ids = {
		songText: 'ukeSongText', // element holding the song's text
		canvas: 'ukeChordsCanvas', // canvas
		container: 'ukeSongContainer' // wraps BOTH Song Text and Chord Canvas
	};

	/**
	 * CSS Class names used to find page elements-- be careful if renaming!
	 * @property wrapClasses
	 * @type JSON Object
	 */
	_public.wrapClasses = {
		wrap: 'ugs-song-wrap', // wraps BOTH Song Text and Chord Canvas
		diagrams: 'ugs-diagrams-wrap', // canvas
		text: 'ugs-source-wrap' // element holding the song's text
	};

	/**
	 * Options (Features) you can turn on or off
	 * @property opts
	 * @type JSON Object
	 */
	_public.opts = {
		columnsEnabled: true,
		/**
		 * the [ and ] surrounding chord names often looks bad in print (usually only good when inline)
		 * set true to keep then, false to get rid of the buggers.
		 * @property opts.retainBrackets
		 * @type Boolean
		 */
		retainBrackets: false,
		/**
		 * if TRUE chords in the "commonChords" list will be ignored (excluded) from having thier
		 * master chord diagram drawn
		 * @property opts.ignoreCommonChords
		 * @type Boolean
		 */
		ignoreCommonChords: false,
		/**
		 * If true chord reference diagrams are sorted alphabetically, otherwise chords are shown in the
		 * order in which they appear within the song.
		 * @property opts.sortAlphabetical
		 * @type Boolean
		 */
		sortAlphabetical: false,
		/**
		 * if TRUE chords that overlap each other (in the music area) will have their spacing adjuste
		 * to prevent overlapping.
		 * @property opts.autoFixOverlaps
		 * @type Boolean
		 */
		autoFixOverlaps: true
	};

	/**
	 * If TRUE the Chord Digram is drawn ABOVE lyrics
	 * @property inlineDiagrams
	 * @type Bool
	 */
	_public.inlineDiagrams = false;

	/**
	 * Number of frets to draw. Default is 5 (as this is as wide as my hand can go and
	 * I've never seen a chord diagram requiring more than this. But ya never know.
	 * @property numFrets
	 * @type int
	 */
	_public.numFrets = 5;

	/**
	 * Array of string names, changes between baritone and soprano
	 * @property tuning
	 * @type string Array
	 */
	_public.tuning = ['G', 'C', 'E', 'A'];

	/**
	 * The initial tuning when page first loads, used in scriptasaurus.init.
	 * @property defaultInstrument
	 * @type {enum_int}
	 */
	_public.defaultInstrument = ukeGeeks.definitions.instrument.sopranoUke;

	/**
	 * TODO: Clean-up Tab Options!!
	 * @property tabs
	 * @type JSON Object
	 */
	_public.tabs = {
		lineSpacing: 16, // pixels between lines (or strings)
		noteSpacing: 14, // pixels between finger dots
		lineWidth: 1, // pixels
		lineColor: '#999999', // hex
		labelWidth: 12, // pixels, how much room to allow for string names, eg, "G" or "A"
		labelFont: '10pt Arial, Helvetica, Verdana, Geneva, sans-serif',
		dotColor: '#eaeaea', // hex
		dotRadius: 10, // pixels, finger dot's radius
		textFont: 'bold 12pt Arial, Helvetica, Verdana, Geneva, sans-serif',
		textColor: '#000000',
		bottomPadding: 10 // extra blank space added to bottom of diagram
	};

	// Info about runtime environment. Not really a setting.
	_public.environment = {
		/**
		 * set in scriptasaurus. True if UserAgent is Internet Explorer
		 * @property environment.isIe
		 * @type bool
		 */
		isIe: false
	};

	/**
	 * List of common chords to be "ignored" (won't show master chord diagrams)
	 * @property commonChords
	 * @type string Array
	 */
	_public.commonChords = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Am'];

	/**
	 * TODO: determine minimum value... 1?
	 * @method _scaleNode
	 * @private
	 * @param node {datatype} Description
	 * @param mulitplier {int} see scale method's parameter
	 * @return mixed
	 */
	var _scaleNode = function(node, mulitplier) {
		if (typeof(node) == 'number') {
			return node * mulitplier;
		}
		else if (typeof(node) == 'object') {
			for (var i in node) {
				node[i] = _scaleNode(node[i], mulitplier);
			}
			return node;
		}
		return node;
	};

	var _sizeRe = /\b(\d+)(pt|px)\b/;

	/**
	 * TODO: determine minimum font size... 5pt/px?
	 * @method _scaleFont
	 * @private
	 * @param font {string} Description
	 * @param mulitplier {int} see scale method's parameter
	 * @return {void}
	 */
	var _scaleFont = function(font, mulitplier) {
		var bits = font.match(_sizeRe);
		if (bits.length < 2) {
			return font;
		}
		var size = parseInt(bits[1], 10) * mulitplier;
		return font.replace(_sizeRe, size + bits[2]);
	};

	/**
	 * Scales the standard chord diagram's dimensions and font sizes by multiplying
	 * all falues by passed in value. Note: this is currently a destructive change: no
	 * backup of original values is retained.
	 * @method scale
	 * @param mulitplier {int}
	 * @return {void}
	 */
	_public.scale = function(mulitplier) {
		if (mulitplier == 1.0) {
			return;
		}

		for (var i in this.fonts) {
			this.fonts[i] = _scaleFont(this.fonts[i], mulitplier);
		}

		// Note getting x/y scaled.
		this.fretBox = _scaleNode(this.fretBox, mulitplier);
	};

	/* return our public interface
	 */
	return _public;
}());
;/**
 * A container or Models library. ukegeeks.data is really a "Models" namespace. Please refactor.
 * @class data
 * @namespace ukeGeeks
 * @singleton
 */
ukeGeeks.data = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Chord info sutiable for plotting on Canvas; has name and dot positions
	 * @class expandedChord
	 * @constructor
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	_public.expandedChord = function(name) {
		/**
		 * string, i.e. 'C#6'
		 * @property name
		 * @type string
		 * @for ukeGeeks.data.expandedChord
		 */
		this.name = name;
		/**
		 * Array of data.dot objects
		 * @property dots
		 * @type array
		 */
		this.dots = [];
		/**
		 * Array of bools, true means that string is not played (muted). i.e. chord.mute[2] means third string is muted.
		 * @property mute
		 * @type array
		 */
		this.muted = [];
	};

	/**
	 * Song object holds all meta info (Title, Subtitles) plus an array of plot
	 * @class song
	 * @constructor
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	_public.song = function() {
		/**
		 * Song Title
		 * @property title
		 * @type string
		 * @for ukeGeeks.data.song
		 */
		this.title = '';
		/**
		 * Album
		 * @property album
		 * @type string
		 */
		this.album = '';
		/**
		 * Artist Info
		 * @property artist
		 * @type string
		 */
		this.artist = '';
		/**
		 * Subtitle, often Artist Info
		 * @property st
		 * @type string
		 */
		this.st = '';
		/**
		 * Subtitle Number 2, subtitle2 (not used yet)
		 * @property st2
		 * @type string
		 */
		this.st2 = '';
		/**
		 * Song's Key ('A', 'C', etc)
		 * @property key
		 * @type string
		 */
		this.key = '';
		/**
		 *
		 * @property body
		 * @type string
		 */
		this.body = '';
		/**
		 * True if there is at least one chord in use, false otherwise. Useful for laying out tablature, which might have no chords.
		 * @property hasChords
		 * @type bool
		 */
		this.hasChords = false;

		this.ugsMeta = [];
		/**
		 * array of data.dots
		 * @property defs
		 * @type array
		 */
		this.defs = [];

		/**
		 * array of chord names found in current song
		 * @property chords
		 * @type array(strings)
		 */
		this.chords = [];
	};

	/**
	 * A single fretboard fingering "dot" -- the position on the Canvas object that a dot should occupy.
	 * @class dot
	 * @constructor
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	_public.dot = function(string, fret, finger) {
		/**
		 * The ukulele's string, numbered from "top" (1) to "bottom" (4). Sporano uke strings would be ['G' => 1,'C' => 2,'E' => 3,'A' => 4]
		 * @property string
		 * @type int
		 * @for ukeGeeks.data.dot
		 */
		this.string = string;
		/**
		 * Fret position, i.e. 0-12
		 * @property fret
		 * @type int
		 */
		this.fret = fret;
		/**
		 * Your finger, 0-4
		 * @property finger
		 * @type int
		 */
		this.finger = finger;
	};

	/**
	 * @class instrument
	 * @constructor
	 * @param  {string} key
	 * @param  {string} name
	 * @param  {string} tuning
	 * @param  {array} chords
	 */
	_public.instrument = function(key, name, tuning, chords) {
		this.key = key;
		this.name = name;
		this.tuning = tuning;
		this.chords = chords;
	};

	_public.htmlHandles = function(wrap, diagrams, text) {
		this.wrap = wrap;
		this.diagrams = diagrams;
		this.text = text;
	};

	// -----------------------------------------------------------------------------------------
	// *** DOCUMENTAION ONLY ***
	// -----------------------------------------------------------------------------------------
	/**
	 * Documentation Only (no JS Definition)
	 * <br />
	 * <br />The JSON format used for add-in fingerings. Frequently you'll add this to indicate
	 * "nutting" or "barring" with one or more fingers.
	 * <br />
	 * <br />For example, the D7 is often played by laying the index finger across the entire
	 * second fret and then placing middle finger on 3rd fret of "A" string like this:
	&gt;pre&lt;
		G C E A
		- - - -  (1st fret)
		X X X X
		- - - X
		- - - -  (4th fret)
	</pre>
	 * The "A" string has two fingers on it, obviously one does nothing -- except to make the
	 * chord much easier to play.
	 *
	 * @class addInFinger
	 * @constructor
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	/**
	 * ex: 'G'
	 * @property string
	 * @type char
	 * @for ukeGeeks.data.addInFinger
	 */
	/**
	 * ex: 0-12
	 * @property fret
	 * @type int
	 * @for ukeGeeks.data.addInFinger
	 */
	/**
	 * ex: 0-4 (where 1 = index finger and 4 = pinky)
	 * @property  finger
	 * @type int
	 * @for ukeGeeks.data.addInFinger
	 */

	return _public;

}());
;/**
 * some jQuery-like tools (very, very crappy. wish we could count on jQuery being on the page.)
 * if you do want to use jQuery (and why wouldn't you) I'm not offended if you yank this out.
 * @class toolsLite
 * @namespace ukeGeeks
 * @singleton
 */
ukeGeeks.toolsLite = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	var regEx = {
		dbleSpace: /\s{2,}/g,
		trim: /^\s+|\s+$/g
	};

	/**
	 * adds className to element.
	 * @method addClass
	 * @param element {DOM_element} target element
	 * @param className {string} CSS classname to add
	 * @return {void}
	 */
	_public.addClass = function(element, className) {
		if (!_public.hasClass(element, className)) {
			element.className += ' ' + className;
		}
	};

	_public.hasClass = function(element, className) {
		return element.className.match(getRegEx(className));
	};

	_public.removeClass = function(element, className) {
		if (_public.hasClass(element, className)) {
			var reg = getRegEx(className);
			element.className = element.className.replace(reg, ' ');
		}
	};

	_public.setClass = function(element, className, isActive) {
		if (isActive) {
			_public.addClass(element, className);
		}
		else {
			_public.removeClass(element, className);
		}
	};

	var getRegEx = function(className) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)');
	};

	/**
	 * Removes all white space at the begining and end of a string.
	 * @method trim
	 * @param str {String} String to trim.
	 * @return {String} Returns string without leading and following white space characters.
	 */
	_public.trim = function(str) {
		return str.replace(regEx.trim, '');
	};

	_public.pack = function(value) {
		return value.replace(regEx.dbleSpace, ' ').replace(regEx.trim, '');
	};

	/**
	 * Searches within Node for tags with specified CSS class.
	 * @method getElementsByClass
	 * @param searchClass {string}  CSS Classname
	 * @param node {HtmlNode} parent node to begin search within. Defaults to entire document.
	 * @param tag {string} restrict search to a specific tag name. defaults to all tags.
	 * @return {arrayDomElements}
	 */
	_public.getElementsByClass = function(searchClass, node, tag) {
		var i, j;
		// use falsey -- if ((node === null) || (node === undefined)) {
		if (!node) {
			node = document;
		}
		if (node.getElementsByClassName) {
			return node.getElementsByClassName(searchClass);
		}

		var classElements = [];
		if (!tag) {
			tag = '*';
		}
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if (pattern.test(els[i].className)) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	};

	return _public;

}());
;/**
 * Converts text to JSON objects. Accetps either large text blocks or single lines of
 * text written in CPM syntax (looks for instrument, tuning, and define statements).
 * @class chordImport
 * @namespace ukeGeeks
 * @singleton
 */
ukeGeeks.chordImport = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Internal storage of partially converted "define" statements. The Definition (string) and addIn (array<strings>)
	 * @class chordImport.chordParts
	 * @constructor
	 * @type ClassDefinition
	 * @private
	 */
	var chordParts = function(definition, addIns) {
		this.define = definition;
		this.adds = addIns;
	};

	/**
	 * All regular expressions used in this class. Note, Changed parsing from "\n" to "{" which means "define: ..." cannot depend on that opening curly-brace!
	 * @property regEx
	 * @type JSON Object of Regular Expressions
	 * @private
	 */
	var regEx = {
		// first pass filters
		define: /\s*{?define\s*:(.*?)(}|add:)/i,
		add: /(add:.*?)(}|add:)/i,
		// chord building filters
		name: /(\S+)\s+/,
		frets: /\s+frets\s+([\dx]{4}|(([\dx]{1,2}\s){3})[\dx]{1,2})/i,
		fingers: /\s+fingers\s+((\d\s+){3}\d|\d{4})/i,
		muted: /\s+mute\s+(\d\s){0,3}\d?/i,
		// TODO: ignores "base-fret 1"
		// filter "add-in" chord fingers
		addin: /add:\s*string\s*(\S+)\s+fret\s+(\d+)\sfinger\s(\d)/i,
		// extra commands
		instr: /{\s*instrument\s*:\s*(.*?)\s*}/i,
		tuning: /{\s*tuning\s*:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*}/i,
		// single digit numbers
		//num: /(\d)/g,
		numOrX: /(\d{1,2}|x)/gi,
		any: /(.)/g
	};

	/**
	 * TODO:
	 * @method _lineToParts
	 * @private
	 * @param line {string} Single line (string with one statment)
	 * @return {array<chordParts>}
	 */
	var _lineToParts = function(line) {
		var s = ukeGeeks.toolsLite.pack(line);
		if (s.length > 1 && s[0] != '#') {
			var m = s.match(regEx.define);
			if (m && m.length > 1) {
				return new chordParts(m[1], _getAddIns(s));
			}
		}
		return null;
	};

	/**
	 * TODO:
	 * @method _textToParts
	 * @private
	 * @param line {array<string>} Array of lines (stings) each wtih one statment
	 * @return {void}
	 */
	var _textToParts = function(lines) {
		var p = [];
		for (var i in lines) {
			var c = _lineToParts(lines[i]);
			if (c) {
				p.push(c);
			}
		}
		return p;
	};

	/**
	 * TODO:
	 * @method _getAddIns
	 * @private
	 * @param txt {string}
	 * @return {void}
	 */
	var _getAddIns = function(txt) {
		var finds = [];
		var m = txt.match(regEx.add);
		while (m && m.length > 1) {
			finds.push(m[1]);
			txt = txt.replace(m[1], '');
			m = txt.match(regEx.add);
		}
		return finds;
	};

	/**
	 * TODO:
	 * @method _getInstrument
	 * @private
	 * @param text {string} Single statement to be searched
	 * @return {string}
	 */
	var _getInstrument = function(text) {
		var c = text.match(regEx.instr);
		return !c ? null : ukeGeeks.toolsLite.pack(c[1]);
	};

	/**
	 * TODO: expects FOUR strings.
	 * @method _getTuning
	 * @private
	 * @param text {string} Single statement to be searched
	 * @return {string}
	 */
	var _getTuning = function(text) {
		var c = text.match(regEx.tuning);
		return !c ? null : [c[1], c[2], c[3], c[4]];
	};

	/**
	 * TODO:
	 * @method _getName
	 * @private
	 * @param text {string} Single statement to be searched
	 * @return {string}
	 */
	var _getName = function(text) {
		var c = text.match(regEx.name);
		return !c ? null : c[1];
	};

	/**
	 * TODO:
	 * @method _getKey
	 * @private
	 * @param name {string}
	 * @param tuning {array<string>}
	 * @return {string}
	 */
	var _getKey = function(name, tuning) {
		var s = name.replace(' ', '-');
		for (var i in tuning) {
			s += '-' + tuning[i];
		}
		return s.toLowerCase();
	};

	/**
	 * TODO: Change will affect "packed" chord fingers -- spaces required. No longer accepts "frets 1231", it must be "frets 1 2 3 1"
	 * Replaces _getFrets. Sets frets and muted arrays.
	 * @method _fretOMatic
	 * @private
	 * @param text {string} string to be searched
	 * @param frets {array<int>}
	 * @param muted {array<bool>}
	 * @return {void}
	 */
	var _fretOMatic = function(text, frets, muted) {
		var f = text.match(regEx.frets);
		if (!f) {
			return;
		}
		var m = (f[1].length == 4) ? f[1].match(regEx.any) : f[1].match(regEx.numOrX);
		for (var i = 0; i < m.length; i++) {
			var isX = m[i] == 'x' || m[i] == 'X';
			frets[i] = isX ? 0 : parseInt(m[i], 10);
			muted[i] = isX;
		}
	};

	/**
	 * TODO:
	 * @method _getFingers
	 * @private
	 * @param text {string} string to be searched
	 * @return {array<string>}
	 */
	var _getFingers = function(text) {
		var f = text.match(regEx.fingers);
		if (!f) {
			return [];
		}
		var x = f[1];
		if (x.length == 4) {
			x = x.replace(regEx.any, '$1 ');
		}
		return x.split(' ');
	};

	/**
	 * Pass in integer arrays, frets is list of frets, plus corresponding fingers array
	 * @method _toDots
	 * @private
	 * @param frets {array}
	 * @param fingers {array}
	 * @return {array<ukeGeeks.data.dot>} array of dots
	 */
	var _toDots = function(frets, fingers) {
		var dots = [];
		var tuning = ukeGeeks.settings.tuning;
		for (var j = 0; j < tuning.length; j++) {
			var n = parseInt(frets[j], 10);
			if (n > 0) {
				dots.push(new ukeGeeks.data.dot(j, n, (fingers.length - 1 >= j) ? parseInt(fingers[j], 10) : 0));
			}
		}
		return dots;
	};

	/**
	 * If a valid "add" instruction is present pushes a new dot object into dots array.
	 * @method _addInDots
	 * @private
	 * @param dots {array<ukeGeeks.data.dot>}
	 * @param adds {array<string>} array of "add instruction" to be parsed (i.e. "add: string G fret 1 finger 1")
	 * @return {void}
	 */
	var _addInDots = function(dots, adds) {
		if (!adds || adds.length < 1) {
			return;
		}
		for (var i in adds) {
			var a = adds[i].match(regEx.addin);
			if (a && a.length > 2) {
				dots.push(new ukeGeeks.data.dot(parseInt(a[1], 10) - 1, parseInt(a[2], 10), parseInt(a[3], 10)));
			}
		}
	};

	/**
	 * TODO:
	 * @method _getExpandedChord
	 * @private
	 * @param text {type}
	 * @param adds {type}
	 * @return {void}
	 */
	var _getExpandedChord = function(text, adds) {
		var frets = [];
		var muted = [];
		_fretOMatic(text, frets, muted);

		var name = _getName(text);
		var fingers = _getFingers(text);

		if (name === null || name == 'frets') {
			_log('bad "define" instruction: chord name not found: ' + text);
			return null;
		}
		if (frets === null) {
			_log('bad "define" instruction: frets not found: ' + text);
			return null;
		}
		var chrd = new ukeGeeks.data.expandedChord(name);
		// chrd.name = name;
		var dots = _toDots(frets, fingers);
		_addInDots(dots, adds);
		chrd.dots = dots;
		chrd.muted = muted;
		return chrd;
	};

	/**
	 * TODO:
	 * @method _partsToChords
	 * @private
	 * @param parts {type}
	 * @return {void}
	 */
	var _partsToChords = function(parts) {
		var c = [];
		var x = null;
		for (var i in parts) {
			x = _getExpandedChord(parts[i].define, parts[i].adds);
			if (x) {
				c.push(x);
			}
		}
		return c;
	};


	/**
	 * Add an error. As one would with console.log("blah").
	 * @private
	 * @method _log
	 * @param msg {string} Error message to be added
	 * @return {void}
	 */
	var _log = function(msg) {
		_errs.push(msg);
	};

	var _errs = [];

	var _echoLog = function() {
		for (var i in _errs) {
			console.log(i + '. ' + _errs[i]);
		}
	};

	/**
	 * Returns an expandedChord object (JSON) converted from single statement text input line.
	 * @method runLine
	 * @param line {string} Single line (string with one statment)
	 * @return {ukeGeeks.data.expandedChord}
	 */
	_public.runLine = function(line) {
		var c = _lineToParts(line);
		return !c ? null : _getExpandedChord(c.define, c.adds);
	};

	/**
	 * Returns array of expandedChord objects (JSON), converted from text input.
	 * @method runBlock
	 * @param text {string} Multiline text block containing definition, instrument, and tuning statements.
	 * @return {ukeGeeks.data.instrument}
	 */
	_public.runBlock = function(text) {
		//TODO: newlines get lost in strings, do I always rely on "{"?
		var linesAry = text.split('\n');
		if (linesAry.length < 2) {
			linesAry = text.split('{');
		}
		var parts = _textToParts(linesAry);
		var name = _getInstrument(text);
		var tuning = _getTuning(text);
		return new ukeGeeks.data.instrument(
			_getKey(name, tuning), // key
			name, // name
			tuning, // tuning
			_partsToChords(parts) // chords
		);
	};

	return _public;

}());
;/**
 * Can shift a single chord or list of chords up/down by a series of steps. Hangles
 * finding equivalent chord names (i.e. A# is same as Bb)
 *
 * @class transpose
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.transpose = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	var re = /^([A-G][#b]?)(.*)/;
	var tones = {
		'A': 0,
		'A#': 1,
		'Bb': 1,
		'B': 2,
		'C': 3,
		'C#': 4,
		'Db': 4,
		'D': 5,
		'D#': 6,
		'Eb': 6,
		'E': 7,
		'F': 8,
		'F#': 9,
		'Gb': 9,
		'G': 10,
		'G#': 11,
		'Ab': 11
	};

	/**
	 * Pass in a chord name returns new chord name for the original chord shifted by "steps" semitones.
	 * @method shift
	 * @param name (string) chord name, should be in chord dictionary
	 * @param steps (int) number of semitones to transpose
	 * @return string
	 */
	_public.shift = function(name, steps) {
		var t = getTone(name);
		if (t === null) {
			return null;
		}
		var tone = (t.tone + steps) % 12;
		// TODO: negative steps are allowed!!!
		if (tone < 0) {
			tone = tone + 12;
		}
		for (var key in tones) {
			if (tone == tones[key]) {
				return key + t.suffix;
			}
		}
		return null;
	};

	/**
	 * Returns object with name (A - G with flat/sharp), integer value (0 - 11), and its "suffix" (minor, 7th, etc)
	 * @method getTone
	 * @param name (string)
	 * @return JSON
	 */
	var getTone = function(name) {
		var m = name.match(re);
		if (!m || m.length < 1) {
			return null;
		}
		return {
			tone: parseInt(tones[m[1]], 10),
			prefix: m[1],
			suffix: m[2]
		};
	};

	/**
	 * Returns a mapping -- an array of JSON with "original" chord name and "transposed" chord names.
	 * @method retune
	 * @param offset (int) optional
	 * @return {array}
	 */
	_public.retune = function() {
		var offset = (arguments.length > 0) ? arguments[0] : 0;
		var chords = ukeGeeks.definitions.getChords();
		var s = [];
		if (offset === 0) {
			for (var i in chords) {
				s.push({
					original: chords[i].name,
					transposed: chords[i].name
				});
			}
		}
		else {
			for (var z in chords) {
				s.push({
					original: chords[z].name,
					transposed: _public.shift(chords[z].name, offset)
				});
			}
		}
		return s;
	};

	/**
	 * returns copy of input string array shifted by number of steps
	 * @method shiftChords
	 * @param  array<strings> chords chord names to be shifted
	 * @param  int steps  number of semitone steps (up or down)
	 * @return array<strings>
	 */
	_public.shiftChords = function(chords, steps) {
		var newChords = [];
		for (var i = 0; i < chords.length; i++) {
			newChords.push(_public.shift(chords[i], steps));
		}
		return newChords;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());
;// -------------------------------------------------------
// Scriptasaurus preloads Soprano Uke chord dictionary.
// Unusual array joined to make multi-lined super string
// being used to avoid JsLint warnings about JS string
// continuation character: \
// -------------------------------------------------------
ukeGeeks.definitions.sopranoUkuleleGcea = [
	// Required: Instruement Name and Tuning (string names)
	// -------------------------------------------------------
	'{instrument: Soprano Ukulele}',
	'{tuning: G C E A}',
	//  Ab returns G#
	//  A
	// -------------------------------------------------------
	'{define: A frets 2 1 0 0 fingers 1 2 0 0}',
	'{define: Am frets 2 0 0 0 fingers 1 0 0 0}',
	'{define: A7 frets 0 1 0 0 fingers 0 1 0 0}',
	'{define: A7sus4 frets 0 2 0 0 fingers 0 2 0 0}',
	'{define: Am7 frets 0 0 0 0}',
	'{define: Adim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Amaj7 frets 1 1 0 0 fingers 1 2 0 0}',
	'{define: A6 frets 2 4 2 4 fingers 1 3 2 4}',
	'{define: Asus2 frets 2 4 5 2 fingers 2 3 4 1}',
	'{define: Asus4 frets 2 2 0 0 fingers 1 2 0 0}',
	'{define: Aaug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: Am6 frets 2 4 2 3 fingers 1 3 1 2 add: string 2 fret 2 finger 1}',
	'{define: A9 frets 0 1 0 2 fingers 0 1 0 2}',
	//  A# retruns Bb
	//  Bb
	// -------------------------------------------------------
	'{define: Bb frets 3 2 1 1 fingers 3 2 1 1}',
	'{define: Bbm frets 3 1 1 1 fingers 3 1 1 1 add: string 1 fret 1 finger 1}',
	'{define: Bb7 frets 1 2 1 1 fingers 1 2 1 1 add: string 2 fret 1 finger 1}',
	'{define: Bb7sus4 frets 1 3 1 1 fingers 1 3 1 1 add: string 2 fret 1 finger 1}',
	'{define: Bbm7 frets 1 1 1 1 fingers 1 1 1 1}',
	'{define: Bbdim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Bbmaj7 frets 2 2 1 1 fingers 2 2 1 1}',
	'{define: Bb6 frets 0 2 1 1 fingers 0 2 1 1}',
	'{define: Bbm6 frets 0 1 1 1 fingers 0 1 1 1}',
	'{define: Bbsus2 frets 3 0 1 1 fingers 3 0 1 1}',
	'{define: Bbsus4 frets 3 3 1 1 fingers 3 3 1 1}',
	'{define: Bbaug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: Bb9 frets 1 2 1 3 fingers 2 1 4 3}',
	'{define: Bbmaj7 frets 2 2 1 1 fingers 2 2 1 1}',
	'{define: Bbm7-5 frets 1 1 0 1 fingers 1 2 0 3}',
	//  B
	// -------------------------------------------------------
	'{define: B frets 4 3 2 2 fingers 3 2 1 1}',
	'{define: Bm frets 4 2 2 2 fingers 3 1 1 1 add: string 1 fret 2 finger 1}',
	'{define: Bm6 frets 1 2 2 2 fingers 1 2 3 4}',
	'{define: B7 frets 2 3 2 2 fingers 1 2 1 1 add: string 2 fret 2 finger 1}',
	'{define: B7sus4 frets 2 4 2 2 fingers 1 3 1 1 add: string 2 fret 2 finger 1}',
	'{define: Bm7 frets 2 2 2 2 fingers 1 1 1 1}',
	'{define: Bdim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Bmaj7 frets 3 3 2 2 fingers 2 2 1 1}',
	'{define: B6 frets 1 3 2 2 fingers 1 4 2 3}',
	'{define: Bsus2 frets 5 1 2 2 fingers 4 1 3 2}',
	'{define: Bsus4 frets 4 4 2 2 fingers 2 2 1 1}',
	'{define: Baug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: B9 frets 2 3 2 4}',
	//  C
	// -------------------------------------------------------
	'{define: C frets 0 0 0 3 fingers 0 0 0 3}',
	'{define: Cm frets 0 3 3 3 fingers 0 1 2 3}',
	'{define: C7 frets 0 0 0 1 fingers 0 0 0 1}',
	'{define: C7sus4 frets 0 0 1 1 fingers 0 0 1 1}',
	'{define: Cm7 frets 3 3 3 3 fingers 1 1 1 1}',
	'{define: Cdim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Cmaj7 frets 0 0 0 2 fingers 0 0 0 1}',
	'{define: C6 frets 0 0 0 0}',
	'{define: Cm6 frets 0 3 5 5 fingers 0 1 3 1}',
	'{define: Csus2 frets 0 2 3 3 fingers 0 1 2 2}',
	'{define: Csus4 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: Caug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: C9 frets 0 2 0 1 fingers 0 2 0 1}',
	//  C#
	// -------------------------------------------------------
	'{define: C# frets 1 1 1 4 fingers 1 1 1 4 add: string 4 fret 1 finger 1}',
	'{define: C#m frets 1 4 4 4 fingers 1 2 3 3}',
	'{define: C#7 frets 1 1 1 2 fingers 1 1 1 2 add: string 4 fret 1 finger 1}',
	'{define: C#7sus4 frets 1 1 2 2 fingers 1 1 2 3}',
	'{define: C#m7 frets 1 4 4 2 fingers 1 3 3 2}',
	'{define: C#dim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: C#maj7 frets 1 1 1 3 fingers 1 1 1 3 add: string 4 fret 1 finger 1}',
	'{define: C#6 frets 1 1 1 1 fingers 1 1 1 1}',
	'{define: C#m6 frets 1 1 0 1 fingers 1 2 0 3}',
	'{define: C#sus2 frets 1 3 4 4 fingers 1 2 3 3}',
	'{define: C#sus4 frets 1 1 2 4 fingers 1 1 2 4}',
	'{define: C#aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: C#9 frets 1 3 1 2}',
	//  Db returns C#
	//  D
	// -------------------------------------------------------
	'{define: D frets 2 2 2 0 fingers 1 1 1 0}',
	'{define: Dm frets 2 2 1 0 fingers 2 2 1 0}',
	'{define: Dm6 frets 0 2 1 2 fingers 0 2 1 3}',
	'{define: D7 frets 2 2 2 3 fingers 1 1 1 2 add: string 4 fret 2 finger 1}',
	'{define: D7sus4 frets 2 2 3 3 fingers 1 1 2 3}',
	'{define: Dm7 frets 2 2 1 3 fingers 2 2 1 3}',
	'{define: Ddim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Dmaj7 frets 2 2 2 4 fingers 1 1 1 2 add: string 4 fret 2 finger 1}',
	'{define: D6 frets 2 2 2 2 fingers 2 2 2 2}',
	'{define: Dsus2 frets 2 2 0 0 fingers 1 2 0 0}',
	'{define: Dsus4 frets 0 2 3 0 fingers 0 1 2 0}',
	'{define: Daug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: D9 frets 2 4 2 3}',
	//  D# returns Eb
	//  Eb
	// -------------------------------------------------------
	'{define: Eb frets 0 3 3 1 fingers 0 2 2 1}',
	'{define: Ebm frets 3 3 2 1 fingers 3 3 2 1}',
	'{define: Eb7 frets 3 3 3 4 fingers 1 1 1 2 add: string 4 fret 3 finger 1}',
	'{define: Eb7sus4 frets 3 3 4 4 fingers 1 1 2 3}',
	'{define: Ebm7 frets 3 3 2 4 fingers 2 2 1 4}',
	'{define: Ebdim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Ebmaj7 frets 3 3 3 5 fingers 1 1 1 2 add: string 4 fret 3 finger 1}',
	'{define: Eb6 frets 3 3 3 3 fingers 1 1 1 1}',
	'{define: Ebm6 frets 3 3 2 3 fingers 2 3 1 4}',
	'{define: Ebsus2 frets 3 3 1 1 fingers 2 2 1 1}',
	'{define: Ebsus4 frets 1 3 4 1 fingers 2 3 4 1}',
	'{define: Ebaug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: Eb9 frets 0 1 1 1}',
	//  E
	// -------------------------------------------------------
	'{define: E frets 4 4 4 2 fingers 2 3 4 1}',
	'{define: Em frets 0 4 3 2 fingers 0 3 2 1}',
	'{define: E7 frets 1 2 0 2 fingers 1 2 0 3}',
	'{define: E7sus4 frets 2 2 0 2 fingers 2 3 0 4}',
	'{define: Em6 frets 4 4 3 4 fingers 2 3 1 4}',
	'{define: Em7 frets 0 2 0 2 fingers 0 1 0 2}',
	'{define: Edim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Emaj7 frets 1 3 0 2 fingers 1 3 0 2}',
	'{define: E6 frets 4 4 4 4 fingers 1 1 1 1}',
	'{define: Esus2 frets 4 4 2 2 fingers 3 3 1 1}',
	'{define: Esus4 frets 2 4 0 2 fingers 2 4 0 1}',
	'{define: Eaug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: E9 frets 1 2 2 2}',
	//  F
	// -------------------------------------------------------
	'{define: F frets 2 0 1 0 fingers 2 0 1 0}',
	'{define: Fm frets 1 0 1 3 fingers 1 0 2 4}',
	'{define: F7 frets 2 3 1 0 fingers 2 3 1 0}',
	'{define: F7sus4 frets 3 3 1 3 fingers 2 3 1 4}',
	'{define: Fm6 frets 1 2 1 3 fingers 1 2 1 3 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: Fm7 frets 1 3 1 3 fingers 1 3 2 4}',
	'{define: Fdim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Fmaj7 frets 5 5 0 0 fingers 1 2 0 0}',
	'{define: F6 frets 2 2 1 3 fingers 2 2 1 4}',
	'{define: Fsus2 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: Fsus4 frets 3 0 1 3 fingers 3 0 1 4}',
	'{define: F6sus2 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: F6sus4 frets 3 0 1 1 fingers 3 0 1 1}',
	'{define: F6aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: F9 frets 2 3 3 3}',
	'{define: Faug frets 2 1 1 0 fingers 3 1 2 0}',
	//  F#
	// -------------------------------------------------------
	'{define: F# frets 3 1 2 1 fingers 3 1 2 1 add: string 1 fret 1 finger 1 add: string 3 fret 1 finger 1}',
	'{define: F#m frets 2 1 2 0 fingers 2 1 3 0}',
	'{define: F#7 frets 3 4 2 4 fingers 2 3 1 4}',
	'{define: F#7sus4 frets 4 4 2 4 fingers 2 3 1 4}',
	'{define: F#m7 frets 2 4 2 4 fingers 1 3 2 4}',
	'{define: F#dim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: F#maj7 frets 3 5 2 4 fingers 2 4 1 3}',
	'{define: F#m6 frets 2 1 2 4 fingers 2 1 3 4}',
	'{define: F#6 frets 3 3 2 4 fingers 2 2 1 4}',
	'{define: F#sus2 frets 1 1 2 4 fingers 1 1 2 4}',
	'{define: F#sus4 frets 4 1 2 2 fingers 4 1 2 3}',
	'{define: F#aug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: F#9 frets 1 1 0 1}',
	//  Gb returns F#
	//  G
	// -------------------------------------------------------
	'{define: G frets 0 2 3 2 fingers 0 1 3 2}',
	'{define: Gm frets 0 2 3 1 fingers 0 2 3 1}',
	'{define: Gm6 frets 0 2 0 1 fingers 0 2 0 1}',
	'{define: G7 frets 0 2 1 2 fingers 0 2 1 3}',
	'{define: G7sus4 frets 0 2 1 3 fingers 0 2 1 4}',
	'{define: Gm7 frets 0 2 1 1 fingers 0 2 1 1}',
	'{define: Gdim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Gmaj7 frets 0 2 2 2 fingers 0 1 2 3}',
	'{define: G6 frets 0 2 0 2 fingers 0 1 0 2}',
	'{define: Gsus2 frets 0 2 3 0 fingers 0 1 2 0}',
	'{define: Gsus4 frets 0 2 3 3 fingers 0 1 2 3}',
	'{define: Gaug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: Gsus4 frets 0 2 3 3}',
	'{define: G9 frets 2 2 1 2}',
	//  G#
	// -------------------------------------------------------
	'{define: G# frets 5 3 4 3 fingers 3 1 2 1 add: string 1 fret 3 finger 1 add: string 3 fret 3 finger 1}',
	'{define: G#m frets 1 3 4 2 fingers 1 3 4 2}',
	'{define: G#7 frets 1 3 2 3 fingers 1 3 2 4}',
	'{define: G#7sus4 frets 1 3 2 4 fingers 1 3 2 4}',
	'{define: G#m7 frets 1 3 2 2 fingers 1 4 2 3}',
	'{define: G#dim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: G#maj7 frets 1 3 3 3 fingers 1 2 2 3}',
	'{define: G#6 frets 1 3 1 3 fingers 1 3 2 4}',
	'{define: G#m6 frets 1 3 1 2 fingers 1 3 1 2 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: G#sus2 frets 1 3 4 1 fingers 2 3 4 1}',
	'{define: G#sus4 frets 1 3 4 4 fingers 1 2 3 3}',
	'{define: G#aug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: G#9 frets 1 0 2 1 fingers 1 0 3 2}',
	//  slash chords & other oddities
	// -------------------------------------------------------
	'{define: C-F frets 2 0 1 3}',
	'{define: D/A frets 2 2 2 0}',
	'{define: Dm/C frets 2 2 1 3}',
	'{define: Fm7/C frets 1 3 1 3}',
	'{define: G/B frets 0 2 3 2}',
	'{define: G/F# frets 0 2 2 2}',
	'{define: G/F frets 0 2 1 2}',
	'{define: G7/B frets 0 2 1 2}'
];
;/**
 * Wraps three common canvas actions: adding canvas element to DOM, drawing a dot, adding text.
 * @class canvasTools
 * @namespace ukeGeeks
 * @static
 * @singleton
 * @module ukeGeeks
 */
ukeGeeks.canvasTools = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * @method drawDot
	 * @param ctx {CanvasContext} Valid Canvas Context handle
	 * @param centerPos {XyPositionJson} JSON with two properties: x & y ints, position in pixels, format {x: <int>, y: <int>}
	 * @param radius {int} Dot's Radius
	 * @param color {string} Hex color
	 * @return {void}
	 */
	_public.drawDot = function(ctx, centerPos, radius, color) {
		ctx.beginPath();
		ctx.arc(centerPos.x, centerPos.y, radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	};

	/**
	 * @method drawText
	 * @param ctx {CanvasContext} Valid Canvas Context handle
	 * @param pos {XYPosObject} JSON with two properties: x & y ints, position in pixels, format {x: <int>, y: <int>}
	 * @param text {string} Any string to be places at Pos
	 * @param font {string} Font, CSS-like definition of size and font-family, i.e.
	 * @param color {string} Hexadecimal RGB color definition
	 * @param align {string} (optional) Text will be aligned at position (pos) as [left,right,center]. Default is center.
	 * @return {void}
	 */
	_public.drawText = function(ctx, pos, text, font, color, align) {
		if (!ctx.fillText) {
			return; // IE check
		}
		ctx.font = font;
		ctx.textAlign = (align || 'center');
		ctx.fillStyle = color;
		ctx.fillText(text, pos.x, pos.y);
	};

	/**
	 * Create new canvas DOM element and add it to element. Return convas context handle. Reutns null if there's a problem.
	 * @method addCanvas
	 * @param element {DOMEelement} Destination DOM element
	 * @param width {int} Desired width of new canvas element
	 * @param height {int} Desired height of new canvas element
	 * @return {canvasContextHandle}
	 */
	_public.addCanvas = function(element, width, height) {
		// make element
		var c = document.createElement('canvas');
		if (!c) {
			return null;
		}
		// because IE is an abomination... must init & place in DOM BEFORE doing anything else
		if (ukeGeeks.settings.environment.isIe) {
			c = G_vmlCanvasManager.initElement(c);
		}
		element.appendChild(c);
		c.width = width;
		c.height = height;
		// canvas context handle
		var ctx = c.getContext('2d');
		if (!ctx) {
			return null;
		}
		return ctx;
	};

	return _public;
}());
;/**
 * First places a Canvas element within a DOM element, then draws a chord diagram on it.
 * @class chordBrush
 * @namespace ukeGeeks
 */
ukeGeeks.chordBrush = function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/////////////////////////////////////////////////////////////////////////////
	//
	// PUBLIC methods
	//
	/////////////////////////////////////////////////////////////////////////////

	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @return {void}
	 */
	_public.init = function() {};

	/**
	 * Puts a new Canvas within ChordBox and draws the chord diagram on it.
	 * @method plot
	 * @param chordBox {DOMElement} Handle to the DOM element where the chord is to be drawn.
	 * @param chord {expandedChord} Chord Diagram to be drawn.
	 * @param fretBox {JSON} Appropriate ukeGeeks.settings.fretBox -- either "fretBox" or "inlineFretBox"
	 * @param {JSON} fontSettings (optional) Defaults to settings.fonts
	 * @param {JSON} colorSettings (optional) Defaults to settings.colors
	 * @return {void}
	 */
	_public.plot = function(chordBox, chord, fretBox, fontSettings, colorSettings) {
		var ctx = ukeGeeks.canvasTools.addCanvas(chordBox, fretBox.width, fretBox.height);
		if (!ctx) {
			return;
		}

		if (!fontSettings) {
			fontSettings = ukeGeeks.settings.fonts;
		}
		if (!colorSettings) {
			colorSettings = ukeGeeks.settings.colors;
		}

		// starting top-left position for chord diagram
		var pos = {
			x: fretBox.topLeftPos.x,
			y: fretBox.topLeftPos.y
		};
		_drawFretboard(ctx, pos, fretBox, colorSettings.fretLines);
		// find where the circle centers should be:
		var centers = {
			x: pos.x,
			y: (pos.y + fretBox.dotRadius)
		};

		// find the vertical shift by dividing the freespace between top and bottom (freespace is the row height less circle diameter)
		var fudgeY = (fretBox.fretSpace - 2 * fretBox.dotRadius) / 2;
		var fretRange = _getFretRange(chord.dots);
		var firstFret = (fretRange.last <= 5) ? 1 : fretRange.last - 4;

		// now add Dots (with finger numbers, if present)
		for (var i = 0; i < chord.dots.length; i++) {
			var s = chord.dots[i].string;
			var p = {
				x: (centers.x + s * fretBox.stringSpace),
				y: (fudgeY + centers.y + (chord.dots[i].fret - firstFret) * fretBox.fretSpace)
			};
			ukeGeeks.canvasTools.drawDot(ctx, p, fretBox.dotRadius, colorSettings.dots);
			// check that the dot's radius isn't stupidly small
			if (chord.dots[i].finger > 0 && fretBox.showText && fretBox.dotRadius > 4) {
				ukeGeeks.canvasTools.drawText(ctx, {
					x: p.x,
					y: (p.y + 5)
				}, chord.dots[i].finger, fontSettings.dot, colorSettings.dotText);
			}
		}

		// If the chord is above the normal first 5 frets we need to add labels for the first and last frets
		if (firstFret != 1) {
			// Label the starting and ending frets (0-12). It's assumed that the fretboard covers frets 1-5.
			// If instead the top fret is 6, say, well, this is the method called to add that "6".
			// The Y position calculation is a bit klunky. How big of a fret range is present in the chord?
			var txtPos = {
				x: 0,
				y: pos.y + fretBox.fretSpace * (0.96 * (5.0 - (fretRange.last - fretRange.first)))
				// Old Y caculcation: pos.y + (0.8 * fretBox.fretSpace)
			};
			ukeGeeks.canvasTools.drawText(ctx, txtPos, fretRange.first, fontSettings.fret, colorSettings.fretText, 'left');

			// no point in double plotting a fret (i.e. barred 8th fret) so only add second label if
			// first and last frets are different. Also, it's odd to see both 8 & 9, so only show if there's
			// at least one fret between first and last (i.e. 8 & 10)
			if ((fretRange.last - fretRange.first) > 1) {
				txtPos.y = pos.y + (4.8 * fretBox.fretSpace);
				ukeGeeks.canvasTools.drawText(ctx, txtPos, fretRange.last, fontSettings.fret, colorSettings.fretText, 'left');
			}
		}

		// TODO: top offset
		if (fretBox.showText) {
			ukeGeeks.canvasTools.drawText(ctx, {
				x: (pos.x + 1.5 * fretBox.stringSpace),
				y: (pos.y - 5)
			}, chord.name, fontSettings.text, colorSettings.text);
		}

		_mutedStrings(ctx, fretBox, chord.muted, colorSettings.xStroke);
	};

	/////////////////////////////////////////////////////////////////////////////
	//
	// PRIVATE methods
	//
	/////////////////////////////////////////////////////////////////////////////

	/**
	 * @method _drawFretboard
	 * @private
	 * @param ctx {CanvasContext} Valid Canvas Context Handle
	 * @param pos {XYPosObject} Object with two properties: x & y ints, position in pixels
	 * @param fretBox {settings}
	 * @return {void}
	 */
	var _drawFretboard = function(ctx, pos, fretBox, fretColor) {
		// width offset, a "subpixel" adjustment
		var i, offset = fretBox.lineWidth / 2;
		// locals
		var stringHeight = ukeGeeks.settings.numFrets * fretBox.fretSpace;
		var fretWidth = 3 * fretBox.stringSpace;
		// build shape
		ctx.beginPath();
		// add "C" & "E" strings
		for (i = 1; i < 3; i++) {
			var x = pos.x + i * fretBox.stringSpace + offset;
			ctx.moveTo(x, pos.y + offset);
			ctx.lineTo(x, pos.y + stringHeight + offset);
		}
		// add frets
		for (i = 1; i < ukeGeeks.settings.numFrets; i++) {
			var y = pos.y + i * fretBox.fretSpace + offset;
			ctx.moveTo(pos.x + offset, y);
			ctx.lineTo(pos.x + fretWidth + offset, y);
		}
		//
		ctx.rect(pos.x + offset, pos.y + offset, fretWidth, stringHeight);
		// stroke shape
		ctx.strokeStyle = fretColor;
		ctx.lineWidth = fretBox.lineWidth;
		ctx.stroke();
		ctx.closePath();
	};

	/**
	 * TODO: Loop over the muted array, dropping X's whenever a string position is TRUE
	 * @method _mutedStrings
	 * @private
	 * @param  {CanvasContext} ctx  Valid Canvas Context handle
	 * @param  {JSON} fretBox  See Settings.fretBox
	 * @param  {bool} muted    Is this string "muted"?
	 * @param  {string} strokeColor Valid CSS hex color (shorthand not recommended)
	 * @return {void}
	 */
	var _mutedStrings = function(ctx, fretBox, muted, strokeColor) {
		var x = fretBox.topLeftPos.x + fretBox.lineWidth / 2;
		var y = fretBox.topLeftPos.y + fretBox.lineWidth / 4;
		for (var i = 0; i < muted.length; i++) {
			if (muted[i]) {
				_drawX(ctx, {
					x: x + i * fretBox.stringSpace,
					y: y
				}, fretBox, strokeColor);
			}
		}
	};

	/**
	 * Plots an "X" centered at POSITION
	 * @method _drawX
	 * @private
	 * @param {CanvasContext} ctx Valid Canvas Context handle
	 * @param centerPos {XyPositionJson} JSON with two properties: x & y ints, position in pixels, format {x: <int>, y: <int>}
	 * @param  {JSON} fretBox  See Settings.fretBox
	 * @param  {string} strokeColor Valid CSS hex color (shorthand not recommended)
	 * @return {void}
	 */
	var _drawX = function(ctx, pos, fretBox, strokeColor) {
		pos.x -= fretBox.xWidth / 2;
		pos.y -= fretBox.xWidth / 2;

		ctx.beginPath();

		ctx.moveTo(pos.x, pos.y);
		ctx.lineTo(pos.x + fretBox.xWidth, pos.y + fretBox.xWidth);
		ctx.moveTo(pos.x, pos.y + fretBox.xWidth);
		ctx.lineTo(pos.x + fretBox.xWidth, pos.y);

		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = fretBox.xStroke;
		ctx.stroke();
		ctx.closePath();
	};

	/**
	 * Returns first & last frets, 0 if none found.
	 * @method _getFretRange
	 * @private
	 * @param dots {array<data.dot>} Array of ukeGeeks.data.dot objects
	 * @return {JSON}
	 */
	var _getFretRange = function(dots) {
		var max = -1;
		var min = 300;

		for (var i = 0; i < dots.length; i++) {
			if (dots[i].fret > max) {
				max = dots[i].fret;
			}
			if (dots[i].fret < min) {
				min = dots[i].fret;
			}
		}
		return {
			first: (min < 300) ? min : 0,
			last: (max > 0) ? max : 0
		};
	};

	/* return our public interface
	 */
	return _public;

};
;/**
 * Reads an HTML (text) block looking for chords in format: [Emaj7]
 * Returns the HTML block with wrapped chords: &lt;code&gt;&lt;strong&gt;&lt;em&gt;
 * @class chordParser
 * @namespace ukeGeeks
 */
ukeGeeks.chordParser = function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	var _chords = [];

	/////////////////////////////////////////////////////////////////////////////
	//
	// PUBLIC methods
	//
	/////////////////////////////////////////////////////////////////////////////
	/**
	 * Again this is a constructor replacement. Just here for consistency. Does nothing.
	 * @method init
	 * @return {void}
	 */
	_public.init = function() {};

	/**
	 * This does all of the work -- it's a Wrapper method that calls all of this classes other
	 * (private) methods in correct order.
	 * @method parse
	 * @param text {string} CPM Text Block to be parsed
	 * @return {string}
	 */
	_public.parse = function(text) {
		_chords = _findChords(text);
		text = _encloseChords(text, _chords);
		text = _packChords(text);
		return text;
	};

	/**
	 * Getter method for _chords
	 * @method getChords
	 * @return {Array-chords}
	 */
	_public.getChords = function() {
		return _chords;
	};

	/////////////////////////////////////////////////////////////////////////////
	//
	// PRIVATE methods
	//
	/////////////////////////////////////////////////////////////////////////////
	/**
	 * Returns an array of all of the unique bracket chord names. So even if [D7] appears a
	 * dozen times you'll only see it once in this list.
	 * @method _findChords
	 * @private
	 * @param text {string} CPM Text Block to be parsed
	 * @return {StringArray}
	 */
	var _findChords = function(text) {
		var i, j;
		var re = /\[(.+?)]/img;
		var m = text.match(re);
		if (!m) {
			return [];
		}

		// why not use associative array?
		var chords = [];
		var found;
		for (i = 0; i < m.length; i++) {
			found = false;
			for (j = 0; j < chords.length; j++) {
				if (chords[j] == m[i]) {
					found = true;
					break;
				}
			}
			if (!found) {
				chords.push(m[i]);
			}
		}
		// clean 'em
		for (j in chords) {
			chords[j] = chords[j].replace('[', '').replace(']', '');
		}
		// done
		return chords;
	};

	/**
	 * Returns the input string having replaced all of the "bracketed chord names" (i.e. [D7]) with HTML
	 * marked-up version (i.e. &lt;code&gt;&lt;strong&gt;[&lt;em&gt;D7&lt;/em&gt;]&lt;/strong&gt;&lt;/code&gt;)
	 * @method _encloseChords
	 * @private
	 * @param text {string}
	 * @param chords {StringArray}
	 * @return {string}
	 */
	var _encloseChords = function(text, chords) {
		var openBracket = ukeGeeks.settings.opts.retainBrackets ? '[' : ' ';
		var closeBracket = ukeGeeks.settings.opts.retainBrackets ? ']' : ' ';
		for (var i in chords) {
			do {}
			while (text.length != (text = text.replace(
				'[' + chords[i] + ']',
				'<code data-chordName="' + chords[i] + '"><strong>' + openBracket + '<em>' + chords[i] + '</em>' + closeBracket + '</strong></code>')).length);
		}
		return text;
		/*
		// need to handle chords such as: [A7+5]
		var escapeRegEx = new RegExp('([+])','g');
		for (var j = 0; j < this.chords.length; j++){
			var s = this.chords[j].replace(escapeRegEx, '\\\$1')
			var re = new RegExp('[[]' + s + ']', 'img');
			text = text.replace(re, '<code data-chordName="' + this.chords[j] + '"><strong>[<em>' + this.chords[j] + '</em>]</strong></code>');
		}
		*/
	};

	/**
	 * Looks for consecutive chords and strips the whitespace between them -- thus "packing" the
	 * chords against each other with only a single space separating them.
	 * @method _packChords
	 * @private
	 * @param text {string}
	 * @return {string}
	 */
	var _packChords = function(text) {
		var re;

		if (ukeGeeks.settings.inlineDiagrams) {
			/* TODO: problem with packing */
			re = /(<\/strong><\/code>)[ \t]*(<code data-chordName="[^"]*"><strong>)/ig;
			return text.replace(re, '$1<span class="ugsInlineSpacer">&nbsp;</span>$2');
		}

		re = /<\/strong><\/code>[ \t]*<code data-chordName="[^"]*"><strong>/ig;
		return text.replace(re, ' ');
	};

	/* return our public interface
	 */
	return _public;
};
;/**
 * Reads a text block and returns an object containing whatever ChordPro elements it recognizes.
 *
 * A cleaned, HTML version of song is included.
 *
 * @class cpmParser
 * @namespace ukeGeeks
 */
ukeGeeks.cpmParser = function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * Number of columns defined
	 * @property _columnCount
	 * @private
	 * @type int
	 */
	var _columnCount = 1;

	/**
	 * Under development, bool indicating whether any chords were found within the lyrics.
	 * Helpful for tablature-only arrangements.
	 * TODO: do not rely on this!!!
	 * @property _hasChords
	 * @private
	 * @type bool
	 */
	var _hasChords = false; // TODO:

	/**
	 * Song's key. May be set via command tag {key: C} otherwise use the first chord found (if available)
	 * @property _firstChord
	 * @private
	 * @type string
	 */
	var _firstChord = '';

	/**
	 * Again this is a constructor replacement. Just here for consistency. Does nothing.
	 * @method init
	 * @return {void}
	 */
	_public.init = function() {};

	/**
	 * Accepts CPM text, returning HTML marked-up text
	 * @method parse
	 * @param text {string} string RAW song
	 * @return {songObject}
	 */
	_public.parse = function(text) {
		var song = new ukeGeeks.data.song();
		text = _stripHtml(text);
		var songDom = _domParse(text);
		songDom = _parseInstr(songDom);
		songDom = _parseSimpleInstr(songDom);
		songDom = _markChordLines(songDom);
		song.body = _export(songDom);
		if (_columnCount > 1) {
			song.body = '<div class="' + _classNames.ColumnWrap + ' ' + _classNames.ColumnCount + _columnCount + '">' + '<div class="' + _classNames.Column + '">' + song.body + '</div>' + '</div>';
		}
		song.hasChords = _hasChords;
		var tmp;
		// Song Title
		tmp = _getInfo(songDom, _blockTypeEnum.Title);
		if (tmp.length > 0) {
			song.title = tmp[0];
		}
		// Artist
		tmp = _getInfo(songDom, _blockTypeEnum.Artist);
		if (tmp.length > 0) {
			song.artist = tmp[0];
		}
		// Song Subtitle
		tmp = _getInfo(songDom, _blockTypeEnum.Subtitle);
		if (tmp.length > 0) {
			song.st = tmp[0];
		}
		if (tmp.length > 1) {
			song.st2 = tmp[1];
		}
		// Album
		tmp = _getInfo(songDom, _blockTypeEnum.Album);
		if (tmp.length > 0) {
			song.album = tmp[0];
		}
		// UkeGeeks "Extras"
		tmp = _getInfo(songDom, _blockTypeEnum.UkeGeeksMeta);
		if (tmp.length > 0) {
			song.ugsMeta = tmp;
		}
		// Key
		tmp = _getInfo(songDom, _blockTypeEnum.Key);
		if (tmp.length > 0) {
			song.key = tmp[0];
		}
		else if (_firstChord !== '') {
			// Setting Key to first chord found
			song.key = _firstChord;
		}
		// Chord Definitions
		tmp = _getInfo(songDom, _blockTypeEnum.ChordDefinition);
		if (tmp.length > 0) {
			for (var i in tmp) {
				song.defs.push(ukeGeeks.chordImport.runLine('{define: ' + tmp[i] + '}'));
			}
		}
		return song;
	};

	/*
		TODO: add ukeGeeks Meta support:
		$regEx = "/{(ukegeeks-meta|meta)\s*:\s*(.+?)}/i";
	*/
	var _regEx = {
		blocks: /\s*{\s*(start_of_tab|sot|start_of_chorus|soc|end_of_tab|eot|end_of_chorus|eoc)\s*}\s*/im,
		tabBlock: /\s*{\s*(start_of_tab|sot)\s*}\s*/im,
		chorusBlock: /\s*{\s*(start_of_chorus|soc)\s*}\s*/im
	};

	/**
	 * All of the CSS classnames used by UkeGeeks JavaScript
	 * @property _classNames
	 * @private
	 * @type JSON
	 */
	var _classNames = {
		Comment: 'ugsComment',
		Tabs: 'ugsTabs',
		Chorus: 'ugsChorus',
		PreChords: 'ugsChords', // preformatted with chords
		PrePlain: 'ugsPlain', // preformated, no chords
		NoLyrics: 'ugsNoLyrics', // preformated, chords ONLY -- no lyrics (text) between 'em
		ColumnWrap: 'ugsWrap',
		ColumnCount: 'ugsColumnCount',
		Column: 'ugsColumn',
		NewPage: 'ugsNewPage'
	};

	/**
	 * Enumeration defining the types of nodes used within this class to parse CPM
	 * @property _blockTypeEnum
	 * @private
	 * @type JSON-enum
	 */
	var _blockTypeEnum = {
		// Multiline Nodes
		TextBlock: 1, // temporary type, should be replaced with Chord Text or Plain Text
		ChorusBlock: 2,
		TabBlock: 3,
		// Single Line "Instruction" Nodes
		Comment: 101,
		Title: 102,
		Subtitle: 103,
		Album: 104,
		ChordDefinition: 105,
		UkeGeeksMeta: 106,
		ColumnBreak: 107, // Defining this as an instruction instead of a node since I'm not requiring a Begin/End syntax and it simplifies processing
		Artist: 108,
		NewPage: 109,
		Key: 110,
		// Text Types
		ChordText: 201,
		PlainText: 202,
		ChordOnlyText: 203, //
		// Undefined
		Undefined: 666
	};

	/**
	 * Retuns the block type (_blockTypeEnum) of passed in line.
	 * @method _getBlockType
	 * @private
	 * @param line {songNode}
	 * @return {_blockTypeEnum}
	 */
	var _getBlockType = function(line) {
		// TODO: verify line's type in documentation
		if (_regEx.chorusBlock.test(line)) {
			return _blockTypeEnum.ChorusBlock;
		}
		else if (_regEx.tabBlock.test(line)) {
			return _blockTypeEnum.TabBlock;
		}
		return _blockTypeEnum.TextBlock;
	};

	/**
	 * Convert passed in song to HTML block
	 * @method _export
	 * @private
	 * @param song {songNodeArray}
	 * @return {strings}
	 */
	var _export = function(song) {
		var nl = "\n";
		var html = '';
		for (var i = 0; i < song.length; i++) {
			/*
			if (song[i].type == _blockTypeEnum.Title){
				html += '<h1>' + song[i].lines[0] + '</h1>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.Subtitle){
				html += '<h2>' + song[i].lines[0] + '</h2>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.Album){
				html += '<h3 class="ugsAlbum">' + song[i].lines[0] + '</h3>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.UkeGeeksMeta){
				html += '<h3>' + song[i].lines[0] + '</h3>' + nl;
			}
			else
			*/
			if (song[i].type == _blockTypeEnum.Comment) {
				html += '<h6 class="' + _classNames.Comment + '">' + song[i].lines[0] + '</h6>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.NewPage) {
				html += '<hr class="' + _classNames.NewPage + '" />' + nl;
			}
			else if ((song[i].type == _blockTypeEnum.ChordText) || (song[i].type == _blockTypeEnum.PlainText) || (song[i].type == _blockTypeEnum.ChordOnlyText)) {
				// TODO: beware undefined's!!!
				// Repack the text, only open/close <pre> tags when type changes
				// problem: exacerbates WebKit browsers' first chord position bug.
				if (song[i].lines[0].length < 1) {
					// prevent empty blocks (usually caused by comments mixed in header tags)
					continue;
				}
				var myClass = (song[i].type == _blockTypeEnum.PlainText) ? _classNames.PrePlain : _classNames.PreChords;
				if (song[i].type == _blockTypeEnum.ChordOnlyText) {
					myClass += ' ' + _classNames.NoLyrics;
				}
				var myType = song[i].type;
				var lastType = ((i - 1) >= 0) ? song[i - 1].type : _blockTypeEnum.Undefined;
				var nextType = ((i + 1) < song.length) ? nextType = song[i + 1].type : _blockTypeEnum.Undefined;
				html += (lastType != myType) ? ('<pre class="' + myClass + '">') : nl;
				html += song[i].lines[0];
				html += (nextType != myType) ? ('</pre>' + nl) : '';
			}
			else if (song[i].type == _blockTypeEnum.ChorusBlock) {
				html += '<div class="' + _classNames.Chorus + '">' + nl;
				html += _export(song[i].lines);
				html += '</div>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.TabBlock) {
				html += '<pre class="' + _classNames.Tabs + '">';
				for (var j in song[i].lines) {
					html += song[i].lines[j] + nl;
				}
				html += '</pre>' + nl;
			}
			else if (song[i].type == _blockTypeEnum.TextBlock) {
				html += _export(song[i].lines);
			}
			else if (song[i].type == _blockTypeEnum.ColumnBreak) {
				html += '</div><div class="' + _classNames.Column + '">';
			}
			// else {}
		}
		return html;
	};

	/**
	 * Debugging tool for Firebug. Echos the song's structure.
	 * @method _echo
	 * @private
	 * @param song {songNodeArray}
	 * @return {void}
	 */
	var _echo = function(song) {
		for (var i in song) {
			console.log('>> ' + i + '. ' + song[i].type + ' node, ' + song[i].lines.length + ' lines');
			for (var j in song[i].lines) {
				console.log(song[i].lines[j]);
			}
		}
	};

	/**
	 * Explodes passed in text block into an array of songNodes ready for further parsing.
	 * @method _domParse
	 * @private
	 * @param text {string}
	 * @return {songNodeArray}
	 */
	var _domParse = function(text) {
		var lines = text.split('\n');
		var song = [];
		var tmpBlk = null;
		var isMarker; // block marker
		for (var i in lines) {
			// strip comments
			if ((lines[i].length > 0) && (lines[i][0] == '#')) {
				continue;
			}
			isMarker = _regEx.blocks.test(lines[i]);
			if (isMarker || tmpBlk === null) {
				// save last block, start new one...
				if (tmpBlk !== null) {
					song.push(tmpBlk);
				}
				tmpBlk = {
					type: _getBlockType(lines[i]),
					lines: []
				};
				if (!isMarker) {
					// Don't miss that first line!
					tmpBlk.lines.push(lines[i]);
				}
			}
			else {
				var s = ukeGeeks.toolsLite.trim(lines[i]);
				if (s.length > 0) {
					tmpBlk.lines.push(s);
				}
			}
		}
		if (tmpBlk.lines.length > 0) {
			song.push(tmpBlk);
		}
		return song;
	};

	/**
	 * Goes through songNodes, those nodes that are "instructions" are exploded and
	 * a "the resulting "songDomElement" built, this songDomElement then replaces the
	 * original line.
	 *
	 * The regular expression look for instructions with this format:
	 * {commandVerb: commandArguments}
	 *
	 * @method _parseInstr
	 * @private
	 * @param song {songNodeArray}
	 * @return {songNodeArray}
	 */
	var _parseInstr = function(song) {
		var regEx = {
			instr: /\{[^}]+?:.*?\}/im,
			cmdArgs: /\{.+?:(.*)\}/gi,
			cmdVerb: /\{(.+?)\s*:.*\}/gi
		};
		for (var i in song) {
			for (var j in song[i].lines) {
				if (regEx.instr.test(song[i].lines[j])) {
					var args = song[i].lines[j].replace(regEx.cmdArgs, '$1');
					var verb = song[i].lines[j].replace(regEx.cmdVerb, '$1').toLowerCase();
					verb = verb.replace(/\r/, ''); // IE7 bug
					var tmpBlk = {
						type: '',
						lines: []
					};
					switch (verb) {
						case 'title':
						case 't':
							tmpBlk.type = _blockTypeEnum.Title;
							break;
						case 'artist':
							tmpBlk.type = _blockTypeEnum.Artist;
							break;
						case 'subtitle':
						case 'st':
							tmpBlk.type = _blockTypeEnum.Subtitle;
							break;
						case 'album':
							tmpBlk.type = _blockTypeEnum.Album;
							break;
						case 'comment':
						case 'c':
							tmpBlk.type = _blockTypeEnum.Comment;
							break;
						case 'key':
						case 'k':
							tmpBlk.type = _blockTypeEnum.Key;
							break;
						case 'define':
							tmpBlk.type = _blockTypeEnum.ChordDefinition;
							break;
						case 'ukegeeks-meta':
							tmpBlk.type = _blockTypeEnum.UkeGeeksMeta;
							break;
						default:
							tmpBlk.type = 'Undefined-' + verb;
							break;
					}
					tmpBlk.lines[0] = ukeGeeks.toolsLite.trim(args);
					song[i].lines[j] = tmpBlk;
				}
			}
		}
		return song;
	};

	/**
	 * A "Simple Instruction" is one that accepts no arguments. Presently this only handles Column Breaks.
	 * @method _parseSimpleInstr
	 * @private
	 * @param song {songNodeArray}
	 * @return {songNodeArray}
	 */
	var _parseSimpleInstr = function(song) {
		var regEx = {
			columnBreak: /\s*{\s*(column_break|colb|np|new_page)\s*}\s*/im
		};
		for (var i in song) {
			for (var j in song[i].lines) {
				if (regEx.columnBreak.test(song[i].lines[j])) {
					var verb = song[i].lines[j].replace(regEx.columnBreak, '$1').toLowerCase();
					switch (verb) {
						case 'column_break':
						case 'colb':
							_columnCount++;
							song[i].lines[j] = {
								type: _blockTypeEnum.ColumnBreak,
								lines: []
							};
							break;
						case 'new_page':
						case 'np':
							song[i].lines[j] = {
								type: _blockTypeEnum.NewPage,
								lines: []
							};
							break;
					}
				}
			}
		}
		return song;
	};

	/**
	 * Runs through songNodes and if the line contains at least one chord it's type is et to
	 * ChordText, otherwise it's marked as "PlainText", meaning straight lyrics
	 * @method _markChordLines
	 * @private
	 * @param song {songNodeArray}
	 * @return {songNodeArray}
	 */
	var _markChordLines = function(song) {
		var regEx = {
			chord: /\[(.+?)]/i,
			allChords: /\[(.+?)]/img
		};

		var chordFound,
			hasOnlyChords,
			line;

		for (var i in song) {
			if ((song[i].type != _blockTypeEnum.TextBlock) && (song[i].type != _blockTypeEnum.ChorusBlock)) {
				continue;
			}
			for (var j in song[i].lines) {
				line = song[i].lines[j];
				if (typeof(line) != 'string') {
					continue;
				}

				chordFound = regEx.chord.test(line);
				_hasChords = _hasChords || chordFound;
				hasOnlyChords = chordFound && (ukeGeeks.toolsLite.trim(line.replace(regEx.allChords, '')).length < 1);
				// need to find
				song[i].lines[j] = {
					type: (hasOnlyChords ? _blockTypeEnum.ChordOnlyText : (chordFound ? _blockTypeEnum.ChordText : _blockTypeEnum.PlainText)),
					lines: [line]
				};

				if (chordFound && _firstChord === '') {
					var m = line.match(regEx.chord);
					if (m) {
						_firstChord = m[1];
					}
				}
			}
		}
		return song;
	};

	/**
	 * Searches the songNodes for the specified block type, retunrs all matching node line (text) values.
	 * @method _getInfo
	 * @private
	 * @param song {songNodeArray}
	 * @param type {_blockTypeEnum}
	 * @return {array}
	 */
	var _getInfo = function(song, type) {
		var rtn = [];
		for (var i in song) {
			if (song[i].type == type) {
				rtn.push(song[i].lines[0]);
			}
			else if (song[i].type == _blockTypeEnum.TextBlock) {
				for (var j in song[i].lines) {
					if (song[i].lines[j].type == type) {
						rtn.push(song[i].lines[j].lines[0]);
					}
				}
			}
		}
		return rtn;
	};

	/**
	 * Removes HTML "pre" tags and comments.
	 * @method _stripHtml
	 * @private
	 * @param text {string}
	 * @return {string}
	 */
	var _stripHtml = function(text) {
		var regEx = {
			pre: /<\/?pre>/img, // HTML <pre></pre>
			htmlComment: /<!--(.|\n)*?-->/gm // HTML <!-- Comment -->
		};
		return text.replace(regEx.pre, '').replace(regEx.htmlComment, '');
	};

	/* return our public interface */
	return _public;
};
;/**
 * Draws large chord diagram grid (aka "reference" diagrams) on canvas
 * @class chordPainter
 * @namespace ukeGeeks
 */
ukeGeeks.chordPainter = function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	/**
	 * ukeGeeks.canvas object handle
	 * @property _brush
	 * @type ukeGeeks.chordBrush instance handle
	 * @private
	 */
	var _brush = null;

	/**
	 * keep an array of missing chords (strings)
	 * @property _errors
	 * @type array
	 * @private
	 */
	var _errors = [];

	var _handles = null;

	/**
	 * If ignoreCommonChords option is true then this will contain list of
	 * matched chords: ones defined in the ignore list that were also found in the song
	 * @property _ignoreMatchList
	 * @type {Array}
	 * @private
	 */
	var _ignoreMatchList = [];

	/**
	 * Ignore "tacet" or "no chord" chords
	 * @property _tacet
	 * @type {RegExp}
	 * @private
	 */
	var _tacet = /^(n.?\/?c.?|tacet)$/i;

	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @param htmlHandles {ukeGeeks.data.htmlHandles} DOM Element object
	 * @return {void}
	 */
	_public.init = function(htmlHandles) {
		_brush = new ukeGeeks.chordBrush();
		_brush.init();
		_handles = htmlHandles;
	};

	/**
	 * Checks whether speicified chord (name) is on the ignore list.
	 * @method ignoreChord
	 * @param  {string} chord Chord name
	 * @return {boolean}	return TRUE if "chord" is on ignore list.
	 */
	var ignoreChord = function(chord) {
		for (var i = 0; i < ukeGeeks.settings.commonChords.length; i++) {
			if (chord == ukeGeeks.settings.commonChords[i]) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
	 * @method show
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	_public.show = function(chords) {
		_handles.diagrams.innerHTML = '';
		_errors = [];
		_ignoreMatchList = [];

		if (ukeGeeks.settings.opts.sortAlphabetical) {
			chords.sort();
		}

		for (var i = 0; i < chords.length; i++) {
			if (_tacet.test(chords[i])) {
				continue;
			}
			if (ukeGeeks.settings.opts.ignoreCommonChords && ignoreChord(chords[i])) {
				if ((typeof Array.prototype.indexOf === 'function') && (_ignoreMatchList.indexOf(chords[i]) == -1)) {
					_ignoreMatchList.push(chords[i]);
				}
				continue;
			}
			var chord = ukeGeeks.definitions.get(chords[i]);
			if (!chord) {
				_errors.push(chords[i]);
				continue;
			}
			_brush.plot(_handles.diagrams, chord, ukeGeeks.settings.fretBox);
		}

		if (_ignoreMatchList.length > 0) {
			var para = document.createElement('p');
			para.className = 'ugsIgnoredChords';
			para.innerHTML = 'Also uses: ' + _ignoreMatchList.sort().join(', ');
			_handles.diagrams.appendChild(para);
		}
	};

	/**
	 * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;.
	 * When found adds canvas element and draws chord named in data-chordName attribute
	 * @method showInline
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	_public.showInline = function(chords) {
		var e = _handles.text.getElementsByTagName('code');
		if (e.length < 1) {
			return;
		}
		for (var i = 0; i < chords.length; i++) {
			var chord = ukeGeeks.definitions.get(chords[i]);
			if (!chord) {
				/* TODO: error reporting if not found */
				// _errors.push(chords[i]);
				continue;
			}
			for (var j = 0; j < e.length; j++) {
				if (e[j].getAttribute('data-chordName') == chord.name) {
					_brush.plot(e[j], chord, ukeGeeks.settings.inlineFretBox, ukeGeeks.settings.inlineFretBox.fonts);
				}
			}
		}
	};

	/**
	 * returns array of unknown chords
	 * @method getErrors
	 * @return {array}
	 */
	_public.getErrors = function() {
		return _errors;
	};

	/**
	 * List of chords excluded from the master chord diagrams
	 * @method getIgnoredChords
	 * @return {array} array of strings
	 */
	_public.getIgnoredChords = function() {
		return _ignoreMatchList;
	};

	/* return our public interface
	 */
	return _public;
};
;/**
 * Tablature renderer -- reads tab data and draws canvas elements.
 * Creates "packed" versions of the tabs, including a "key line" that's comprised
 * only of '-' and '*' -- the asterisks denoting where a dot will eventually be placed.
 * @class tabs
 * @constructor
 * @namespace ukeGeeks
 */
ukeGeeks.tabs = function() {

	/**
	 * alias for external Settings dependencies (helps with complression, too)
	 * @property tab_settings
	 * @private
	 * @type {JSON}
	 */
	var tab_settings = ukeGeeks.settings.tabs;

	// TODO: use ukeGeeks.settings.tuning for NUM_STRINGS and LAST_STRING_NAME??

	/**
	 * (Constant) Number of Strings (dashed lines of tablature notation) expected. (For now
	 * a constant -- ukueleles "always" have four). Making a variable to help support port
	 * for other instruments.
	 * @property NUM_STRINGS
	 * @private
	 * @type int
	 */
	var NUM_STRINGS= 4;

	/**
	 * (Constant) Last String Name (Note), as above, on Ukulele is a "G". Here for other instruments.
	 * @property LAST_STRING_NAME
	 * @private
	 * @type string
	 */
	var LAST_STRING_NAME= 'G';

	/* PUBLIC METHODS
	---------------------------------------------- */
	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @public
	 * @return {void}
	 */
	var init= function() {};

	/**
	 * Races through all &lt;pre&gt; tags within h, any with the CSS class of "ugsTabs" will be replaced with the canvas element.
	 * @method replace
	 * @public
	 * @param h {DOM-element}
	 * @return {void}
	 */
	var replace= function(h) {
		var tabBlocks = h.getElementsByTagName('pre');
		for (var i in tabBlocks) {
			if (tabBlocks[i].className == 'ugsTabs') {
				var s = tabBlocks[i].innerHTML;
				tabBlocks[i].innerHTML = '';
				loadBlocks(s, tabBlocks[i]);
			}
		}
	};

	/**
	 *
	 * @method loadBlocks
	 * @param text {string} Block of text that contains one or more tablature blocks
	 * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
	 * @return {void}
	 */
	var loadBlocks= function(text, outElement) {
		var lines = text.split('\n');
		var tab = [];
		for (var i in lines) {
			var s = ukeGeeks.toolsLite.trim(lines[i]);
			if (s.length > 0) {
				tab.push(s);
			}
			if (tab.length == NUM_STRINGS) {
				redraw(tab, outElement);
				tab = [];
			}
		}
	};

	/**
	 *
	 * @method redraw
	 * @param inTabs {string or array} Block of text or four element array containing tablbature to be parsed
	 * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
	 * @return {void}
	 */
	var redraw= function(inTabs, outElement) {
		// validate inTabs input...
		// TODO: instead of this if it's text pop the entire processing back to loadBlocks!
		inTabs = (typeof(inTabs) == 'string') ? (inTabs.split('\n')) : inTabs;
		if (inTabs.length < NUM_STRINGS) {
			return;
		}
		// read tabs
		var tabInfo = readTabs(inTabs);
		var labelOffset = (tabInfo.hasLabels) ? tab_settings.labelWidth : 0;
		var tabs = tabInfo.tabs;
		// how much space?
		var height = ((NUM_STRINGS - 1) * tab_settings.lineSpacing) + (2 * tab_settings.dotRadius) + tab_settings.bottomPadding;
		// prep canvas
		outElement = (typeof(outElement) == 'string') ? document.getElementById(outElement) : outElement;

		var ctx = ukeGeeks.canvasTools.addCanvas(outElement, getWidth(tabs, labelOffset, false), height);
		var pos = {
			x: tab_settings.dotRadius + labelOffset,
			y: 1 + tab_settings.dotRadius
		};
		var lineWidth = getWidth(tabs, labelOffset, true);
		drawStaff(ctx, pos, lineWidth, tab_settings);
		drawNotes(ctx, pos, tabs, tab_settings, lineWidth);
		if (tabInfo.hasLabels) {
			drawLabels(ctx, pos, tab_settings);
		}
	};

	/**
	 * This is insanely long, insanely kludgy, but, insanely, it works. This will read break a block of text into
	 * four lines (the ukulele strings), then find which frets are used by each. Then, the hard part, pack un-needed
	 * dashes. Once it's done that a 2-dimentional array (strings X frets) is created and returned.
	 * @method readTabs
	 * @private
	 * @param ukeStrings {array<string>} Block of tablbabure to be parsed
	 * @return {2-dimentional array}
	 */
	var readTabs= function(ukeStrings) {
		var hasLabels = ukeStrings[NUM_STRINGS - 1][0] == LAST_STRING_NAME;
		if (hasLabels) {
			stripStringLabels(ukeStrings);
		}
		var frets = getFretNumbers(ukeStrings);
		var symbols = getSymbols(ukeStrings);
		var minLength = getMinLineLength(ukeStrings);
		var guide = getGuideLine(symbols, minLength);

		return {
			tabs: getPackedLines(frets, symbols, guide, minLength),
			hasLabels: hasLabels
		};
	};

	/**
	 * @method getWidth
	 * @private
	 * @param tabs {2Darray}
	 * @param labelOffset {int}
	 * @param isTruncate {bool} If TRUE returns the length of the line, allowing for a terminating "|" character, othwrwise, it's for canvas width
	 * @return {int}
	 */
	var getWidth= function(tabs, labelOffset, isTruncate) {
		if (!isTruncate) {
			return (tab_settings.noteSpacing * tabs[0].length) + labelOffset + tab_settings.dotRadius;
		}

		var len = tabs[0].length;
		var plusDot = tab_settings.dotRadius;
		if (tabs[0][len - 1] == '|') {
			// TODO: too much??? retest
			len -= 1;
			plusDot = 0;
		}

		return tab_settings.noteSpacing * len + labelOffset + plusDot;
	};

	/**
	 * Processes ukeStrings stripping the first character from each line
	 * @method stripStringLabels
	 * @private
	 * @param ukeStrings {array<string>}
	 * @return {void}
	 */
	var stripStringLabels= function(ukeStrings) {
		for (var i = 0; i < NUM_STRINGS; i++) {
			ukeStrings[i] = ukeStrings[i].substr(1);
		}
	};

	/**
	 * Finds the frets in used for each line. In other words, ignoring
	 * spacers ("-" or "|") this returns arrays of numbers, the frets
	 * in use, for each line.
	 * @method getFretNumbers
	 * @private
	 * @param ukeStrings {array<string>}
	 * @return {void}
	 */
	var getFretNumbers= function(ukeStrings) {
		// first, get the frets
		var reInts = /([0-9]+)/g;
		var frets = [];
		for (var i = 0; i < NUM_STRINGS; i++) {
			frets[i] = ukeStrings[i].match(reInts);
		}
		return frets;
	};

	/**
	 * Returns array of the strings with placeholders instead of the numbers.
	 * This helps us pack because "12" and "7" now occupy the same space horizontally.
	 * @method getSymbols
	 * @private
	 * @param ukeStrings {array<string>}
	 * @return {void}
	 */
	var getSymbols= function(ukeStrings) {
		// convert to symbols
		var reDoubles = /([0-9]{2})/g;
		var reSingle = /([0-9])/g;
		var symbols = [];
		// TODO: verify why using NUM_STRINGS instead of ukeStrings.length (appears in other methods, again, do you recall why?)
		for (var i = 0; i < NUM_STRINGS; i++) {
			symbols[i] = ukeStrings[i].replace(reDoubles, '-*');
			symbols[i] = symbols[i].replace(reSingle, '*');
		}
		return symbols;
	};

	/**
	 * Run through all of the strings (array) and return the length of the shortest one.
	 * would prefer the max length, but then I'd need to pad the shorter ones and ... well, it's complicated.
	 * this gets a TODO: get max!
	 * @method getMinLineLength
	 * @private
	 * @param ukeStrings {array<string>}
	 * @return {void}
	 */
	var getMinLineLength = function(ukeStrings){
		var minLength = 0;
		var line;
		var re = /-+$/gi;

		for (var i = 0; i < ukeStrings.length; i++) {
			line = ukeStrings[i].trim().replace(re, '');
			if (line.length > minLength){
				minLength = line.length;
			}
		}
		return minLength;
	};

	/**
	 * OK, having created symbolic representations for the lines in earlier steps
	 * here we go through and "merge" them into a single, master "guide" -- saying
	 * "somewhere on this beat you'll pluck (or not) one note". This normalized
	 * guide will be the master for the next step.
	 * @method getGuideLine
	 * @private
	 * @param symbols {undefined}
	 * @param minLength {int}
	 * @return {void}
	 */
	var getGuideLine= function(symbols, minLength) {
		// Build a master pattern "guide" and eliminate double dashes
		var guide = '';
		for (var i = 0; i < minLength; i++) {
			if (symbols[0][i] == '|') {
				guide += '|';
			}
			else {
				// TODO: assumes 4 strings, use NUM_STRINGS
				guide += ((symbols[0][i] == '*') || (symbols[1][i] == '*') || (symbols[2][i] == '*') || (symbols[3][i] == '*')) ? '*' : '-';
			}
		}
		var reDash = /--/g;
		guide = guide.replace(reDash, '- ');
		reDash = / -/g;
		var lastGuide = guide;
		while (true) {
			guide = guide.replace(reDash, '  ');
			if (guide == lastGuide) {
				break;
			}
			lastGuide = guide;
		}
		return guide;
	};

	/**
	 * Using the packed "guide" line we loop over the strings, rebuilding each string
	 * with either a space, measure marker, or the note -- as an integer! Now the frets
	 * are the same regardless of whether they are single or double digit numbers:
	 * a "12" occupies no more horizontal space than a "5".
	 * @method getPackedLines
	 * @private
	 * @param frets {undefined}
	 * @param symbols {undefined}
	 * @param guide {undefined}
	 * @param minLength {int}
	 * @return {void}
	 */
	var getPackedLines= function(frets, symbols, guide, minLength) {
		// pack it!
		var packed = [],
		chrNote = '', // a temp variable to hold the 'note'
		guideIdx, // loop index for guide string
		stringIdx, // loop index for instrument's strings (uke's 4)
		lineIdx,  // index to single line within packed array (along a string)
		fretCount; // fret marker counter

		for (stringIdx = 0; stringIdx < NUM_STRINGS; stringIdx++) {
			packed.push([]);
		}

		for (stringIdx = 0; stringIdx < NUM_STRINGS; stringIdx++) { // loop over lines
			lineIdx = 0;
			fretCount = 0;
			for (guideIdx = 0; guideIdx < minLength; guideIdx++) { // loop over guide
				if (guide[guideIdx] != ' ') {
					if (symbols[stringIdx][guideIdx] == '*') {
						chrNote = frets[stringIdx][fretCount];
						fretCount++;
					}
					else {
						chrNote = ((guide[guideIdx] == '|')) ? '|' : '-';
					}
					packed[stringIdx][lineIdx] = chrNote;
					lineIdx++;
				}
			}
		}
		return packed;
	};

	/**
	 * Create the staff -- really the four tablature strings
	 * @method drawStaff
	 * @private
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param length {int} Length in pixels
	 * @param settings {settingsObj}
	 * @return {voie}
	 */
	var drawStaff= function(ctx, pos, length, settings) {
		var offset = settings.lineWidth / 2;
		var x = pos.x + offset;
		var y = pos.y + offset;
		ctx.beginPath();
		for (var i = 0; i < NUM_STRINGS; i++) {
			ctx.moveTo(x, y);
			ctx.lineTo(x + length, y);
			y += settings.lineSpacing;
		}
		ctx.strokeStyle = settings.lineColor;
		ctx.lineWidth = settings.lineWidth;
		ctx.stroke();
		ctx.closePath();
	};

	/**
	 * Loop over the normalized tabs emitting the dots/fingers on the passed in canvase
	 * @method drawNotes
	 * @private
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param tabs {array} Array of normalized string data -- space (character) or int (fret number)
	 * @param settings {settingsObj}
	 * @param lineWidth {int} Length in pixels (used only when line ends with a measure mark)
	 * @return {void}
	 */
	var drawNotes= function(ctx, pos, tabs, settings, lineWidth) {
		var c;
		var center = {
			x: 0,
			y: pos.y
		};

		for (var strIdx in tabs) {
			if (strIdx > 3) {
				return;
			}
			center.x = pos.x;
			for (var chrIdx in tabs[strIdx]) {
				c = tabs[strIdx][chrIdx];
				// (c != '-'){
				if (c == '|') {
					var jnum = parseInt(chrIdx, 10);
					var heavy = (((jnum + 1) < (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum + 1] == '|')) || ((jnum == (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum - 1] == '|'));
					drawMeasure(ctx, {
						x: (chrIdx == tabs[strIdx].length - 1) ? pos.x + lineWidth : center.x,
						y: pos.y
					}, settings, heavy);
				}
				else if (!isNaN(c)) {
					ukeGeeks.canvasTools.drawDot(ctx, center, settings.dotRadius, settings.dotColor);
					ukeGeeks.canvasTools.drawText(ctx, {
						x: center.x,
						y: (center.y + 0.5 * settings.dotRadius)
					}, c, settings.textFont, settings.textColor);
				}
				center.x += settings.noteSpacing;
			}
			center.y += settings.lineSpacing;
		}
	};

	/**
	 * Draws a vertical "measure" demarcation line
	 * @method drawMeasure
	 * @private
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param settings {settingsObj}
	 * @param heavy {bool} if TRUE hevy line
	 * @return {void}
	 */
	var drawMeasure= function(ctx, pos, settings, heavy) {
		var offset = settings.lineWidth / 2;
		ctx.beginPath();
		ctx.moveTo(pos.x + offset, pos.y);
		ctx.lineTo(pos.x + offset, pos.y + (NUM_STRINGS - 1) * settings.lineSpacing);
		ctx.strokeStyle = settings.lineColor;
		ctx.lineWidth = (heavy ? 4.5 : 1) * settings.lineWidth;
		ctx.stroke();
		ctx.closePath();
	};

	/**
	 * Adds the string letters on the left-side of the canvas, before the tablature string lines
	 * @method drawLabels
	 * @private
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param settings {settingsObj}
	 * @return {void}
	 */
	var drawLabels= function(ctx, pos, settings) {
		// ['A','E','C','G'];
		var labels = ukeGeeks.settings.tuning.slice(0).reverse();
		for (var i = 0; i < NUM_STRINGS; i++) {
			ukeGeeks.canvasTools.drawText(ctx, {
				x: 1,
				y: (pos.y + (i + 0.3) * settings.lineSpacing)
			}, labels[i], settings.labelFont, settings.lineColor, 'left');
		}
	};

	/* return our public interface */
	return {
		init: init,
		replace: replace
	};
};

;/**
 * Singleton to correct overlapping chord names/diagrams in songs rendered by UGS
 * @class overlapFixer
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus
 * @singleton
 */
ukeGeeks.overlapFixer = (function() {

	// private
	// ---------------------------
	var _public = {};

	/**
	 * returns TRUE if Box A overlaps Box B. Detailed horizontal check, we "cheat" the
	 * vertical check by assuming that tops must be equal to collide (a simplification
	 * over a full height check.)
	 * @method checkOverlap
	 * @param  {object} "a" box
	 * @param  {object} "b" box
	 * @return {boolean}
	 */
	var checkOverlap = function(a, b) {
		// "cheat" vertical check
		if (a.top != b.top) {
			return false;
		}

		if ((b.left > a.right) || (b.right < a.left)) {
			//overlap not possible
			return false;
		}
		if ((b.left > a.left) && (b.left < a.right)) {
			return true;
		}
		if ((b.right > a.left) && (b.right < a.right)) {
			return true;
		}
		return false;
	};


	/**
	 * returns object with width and left & right offsets
	 * @method getBox
	 * @param  {DOM_element} element to be measured
	 * @return {object}
	 */
	var getBox = function(ele) {
		var box = getOffsets(ele);
		box.width = getWidth(ele);

		// due to how CSS & HTML is defined it's possible that the <em> wrapping the
		// chord name is actually wider than the <strong>, let's check.
		// BTW: this will happen on the "mini-chord diagram" option
		var em = ele.getElementsByTagName('em')[0];
		if (em) {
			var emWidth = getWidth(em);
			if (emWidth > box.width) {
				//console.log('box strong.width: ' + box.width + 'px, em.width: ' + emWidth +'px');
				box.width = emWidth + 2;
			}
		}

		box.right = box.left + box.width;
		return box;
	};

	/**
	 * source: http://www.cjboco.com/blog.cfm/post/determining-an-elements-width-and-height-using-javascript/
	 * @method getWidth
	 * @param  {DOM_element} element to be measured
	 * @return {int}
	 */
	var getWidth = function(ele) {
		if (typeof ele.clip !== "undefined") {
			return ele.clip.width;
		}

		return (ele.style.pixelWidth) ? ele.style.pixelWidth : ele.offsetWidth;
	};

	/**
	 * Returns JSON with left, right, top, and width properties. ONLY left and top are calculate,
	 * width & right need to be added later.
	 * source: http://stackoverflow.com/questions/442404/dynamically-retrieve-the-position-x-y-of-an-html-element
	 * @method getOffsets
	 * @param  {DOM_element} element to be measured
	 * @return {JSON}
	 */
	var getOffsets = function(ele) {
		var box = {
			top: 0,
			left: 0,
			right: 0,
			width: 0
		};

		while (ele && !isNaN(ele.offsetLeft) && !isNaN(ele.offsetTop)) {
			box.left += ele.offsetLeft - ele.scrollLeft;
			box.top += ele.offsetTop - ele.scrollTop;
			ele = ele.offsetParent;
		}

		return box;
	};


	/**
	 * checks (and fixes if problem is presetn) two code tags
	 * @method checkChords
	 * @param  {[DOM_element]} codeA [description]
	 * @param  {[DOM_element]} codeB [description]
	 * @return {void}
	 */
	var checkChords = function(codeA, codeB) {
		var strongA = codeA.getElementsByTagName('strong')[0];
		var strongB = codeB.getElementsByTagName('strong')[0];

		if (!strongA || !strongB) {
			return;
		}

		var boxA = getBox(strongA);
		var boxB = getBox(strongB);

		if (checkOverlap(boxA, boxB)) {
			var width = boxA.right - boxB.left + 1;
			codeA.style.paddingRight = (width < 1 ? 1 : width) + 'px';
		}
	};

	/**
	 * Runs through the element looking for UkeGeek chords (based on HTML) and
	 * adjust the horizontal spacing if any of the chords overlap.
	 * @method Fix
	 * @param  {DOM_element} element containing the UGS HTML song
	 */
	_public.Fix = function(ele) {
		var i,
			elements = ele.getElementsByTagName('code');

		for (i = 0; i < elements.length; i++) {
			elements[i].style.paddingRight = '0px';
		}

		for (i = 0; i < (elements.length - 1); i++) {
			checkChords(elements[i], elements[i + 1]);
		}
	};

	return _public;
})();
;/**
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
		for (var i = 0; i < songWraps.length; i++) {
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
	var _runSong = function(handles) {
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
		if (ukeGeeks.settings.inlineDiagrams) {
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
		if (container) {
			ukeGeeks.toolsLite.setClass(container, 'ugsNoChords', !song.hasChords);
		}

		if (ukeGeeks.settings.opts.autoFixOverlaps) {
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
	var showErrors = function(errs) {
		if (errs.length < 1) {
			return;
		}

		//console.log(typeof(errs[0]));
		var s = '';
		for (var i = 0; i < errs.length; i++) {
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
	var _getHandlesFromClass = function(wrap) {
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
	var _getHandlesFromId = function() {
		return new ukeGeeks.data.htmlHandles(
			document.getElementById(ukeGeeks.settings.ids.container),
			document.getElementById(ukeGeeks.settings.ids.canvas),
			document.getElementById(ukeGeeks.settings.ids.songText)
		);
	};

	return _public;
}());