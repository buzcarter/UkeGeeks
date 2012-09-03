/**
  * <ul>
  * <li>Project: UkeGeeks' Scriptasaurus</li>
  * <li>Homepage: http://ukegeeks.com</li>
  * <li>Author: Buz Carter</li>
  * <li>Contact: buz@ukegeeks.com</li>
	* <li>Copyright: Copyright 2010 Buz Carter.</li>
	* <li>License GNU General Public License (http://www.gnu.org/licenses/gpl.html)</li>
	* <ul>
  * 	
  * <p>== Overview
  * <p>Reads marked-up music (lyrics + chords) extracting all of the chords used;
  * Generates a chord diagrams using HTML5 <canvas> and rewrites the music with
  * standard HTML wrapping the chords.
	*
	* @module  scriptasaurus
  * @namespace  ukeGeeks
	* 
  */
var ukeGeeks = window.ukeGeeks||{};

;/**
 * Customize your installation. This JSON object controls appearance and 
 * HTML element names. It's divided into four sections: graphics, ids, layout,
 * and "options". 
 * 
 * This is a SINGLETON class.
 * 
 * @class settings
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.settings = new function(){
	/**
	 * Chord Diagram Font styles -- font size, font-weight, font-face stack, etc.
	 * @property fonts
	 * @type JSON Object
	 */
	this.fonts = { 
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
	this.colors= {
		fretLines: '#003366',
		dots: '#ff0000', 
		dotText: '#ffffff', 
		text: '#000000', 
		fretText: '#4a4a4a',
		// a muted string's 'X' stroke color
		xStroke: '#444444'
	};

	/* Standard Fretbox Options, these properties documented individually */
	this.fretBox = {
		/**
		 * True if chord name and finger "number" are to be drawn on canvas. 
		 * By default normal chord diagrams have text (TRUE) whereas inlineDiagrams 
		 * (i.e. chord diagrams shown above lyrics) do NOT as they are too small 
		 * (thus inlineFretbox.showText is FALSE)
		 * @property settings.fretBox.showText
		 * @type bool
		 */
		showText: true,
		/**
		 * Chord Box's Bounding height
		 * @property settings.fretBox.height
		 * @type int
		 */
		height: 150,
		/**
		 * Chord Box's Bounding width
		 * @property settings.fretBox.width
		 * @type int
		 */
		width: 100,
		/**
		 * Row Height -- vertical height between frets (pixels)
		 * @property settings.fretBox.fretSpace
		 * @type int
		 */
		fretSpace: 20, 
		/**
		 * String Spacing -- horizontal distance between strings (pixels)
		 * @property settings.fretBox.stringSpace
		 * @type int
		 */
		stringSpace: 20,
		/**
		 * Dot (finger position) radius in pixels
		 * @property settings.fretBox.dotRadius
		 * @type int
		 */
		dotRadius: 8,
		/**
		 * Fretboard line width in pixels
		 * @property settings.fretBox.lineWidth
		 * @type decimal
		 */
		lineWidth: 1.6,
		/**
		 * top-left position -- the offset for chord box. Doing this programatically 
		 * had "issues", decided to make this adjustment manual.
		 * @property settings.fretBox.topLeftPos
		 * @type JSON
		 */
		topLeftPos: {
			x:22,
			y:25
		},
		/**
		 * muted string "X" width of the 'X' crossbars. Recommend this be about 0.5 to 0.9 relative to stringSpace.
		 * @property settings.fretBox.xWidth
		 * @type decimal
		 */
		xWidth: 0.45 * 20,
		/**
		 * muted string "X" stroke thickness. Recommend this be about 1.3 to 2.1 relative to lineWidth
		 * @property settings.fretBox.xStroke
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
	this.inlineFretBox = {
		showText: false,
		height: 50,
		width: 40,
		fretSpace: 9,
		stringSpace: 7,
		dotRadius: 3,
		lineWidth: 1,
		topLeftPos: {
			x:3,
			y:2
		},
		xWidth: 0.7 * 7,
		xStroke: 1.4 * 1
	};

	/**
	 * ID's of key HTML page elements
	 * @property ids
	 * @type JSON Object
	 */
	this.ids = {
		songText: 'ukeSongText', // element holding the song's text
		canvas: 'ukeChordsCanvas', // canvas 
		container: 'ukeSongContainer' // wraps BOTH Song Text and Chord Canvas
	};
	
	/**
	 * Options (Features) you can turn on or off
	 * @property opts
	 * @type JSON Object
	 */
	this.opts = {
		columnsEnabled: true
	};
	
	/**
	 * If TRUE the Chord Digram is drawn ABOVE lyrics
	 * @property options.inlineDiagrams
	 * @type Bool
	 */
	this.inlineDiagrams = false;

	/**
	 * Number of frets to draw. Default is 5 (as this is as wide as my hand can go and
	 * I've never seen a chord diagram requiring more than this. But ya never know.
	 * @property numFrets
	 * @type int
	 */
	this.numFrets = 5;

	this.tuning = ['G','C','E','A'];

	/**
	 * TODO: Clean-up Tab Options!!
	 * @property tabs
	 * @type JSON Object
	 */
	this.tabs = {
		lineSpacing : 16, // pixels between lines (or strings)
		noteSpacing : 14, // pixels between finger dots
		lineWidth : 1, // pixels
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
	this.environment = {
		/**
		 * set in scriptasaurus. True if UserAgent is Internet Explorer
		 * @property settings.environment.isIe
		 * @type bool
		 */
		isIe : false
	};

};
;/**
 * A container or Models library. ukegeeks.data is really a "Models" namespace. Please refactor.
 * @class data
 * @namespace ukeGeeks
 */
ukeGeeks.data = new function(){
	/**
	 * Chord info sutiable for plotting on Canvas; has name and dot positions
	 * @class expandedChord
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.expandedChord = function(name){
		/**
		 * string, i.e. 'C#6'
		 * @property name
	   * @type string
	   */
		this.name= name;
		/**
		 * Array of data.dot objects
		 * @property dots
	   * @type array 
	   */
		this.dots= [];
		/**
		 * Array of bools, true means that string is not played (muted). i.e. chord.mute[2] means third string is muted.
		 * @property mute
	   * @type array 
	   */
		this.muted= [];
	};

	/**
	 * Song object holds all meta info (Title, Subtitles) plus an array of plot
	 * @class song
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.song = function(){ 
		/**
		 * Song Title
		 * @property title
	   * @type string
	   */
		this.title= '';
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
		this.st= ''; 
		/**
		 * Subtitle Number 2, subtitle2 (not used yet)
		 * @property st2
	   * @type string
	   */
		this.st2= '';
		/**
		 * 
		 * @property body
	   * @type string
	   */
		this.body= '';
		/**
		 * True if there is at least one chord in use, false otherwise. Useful for laying out tablature, which might have no chords.
		 * @property hasChords
	   * @type bool
	   */
		this.hasChords = false;
		
		this.ugsMeta=[];
		/**
		 * array of data.dots 
		 * @property defs
	   * @type array
	   */
		this.defs= [];
	};

	/**
	 * A single fretboard fingering "dot" -- the position on the Canvas object that a dot should occupy.
	 * @class dot
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.dot = function(string, fret, finger){
		/**
		 * The ukulele's string, numbered from "top" (1) to "bottom" (4). Sporano uke strings would be ['G' => 1,'C' => 2,'E' => 3,'A' => 4]
		 * @property string
	   * @type int
	   */
		this.string= string;
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

	this.instrument  = function(key, name, tuning, chords){
		this.key = key;
		this.name = name;
		this.tuning = tuning;
		this.chords = chords;
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
	 <pre>
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

}
;/**
 * some jQuery-like tools (very, very crappy. wish we could count on jQuery being on the page.)
 * if you do want to use jQuery (and why wouldn't you) I'm not offended if you yank this out.
 * @class toolsLite
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus 
 */
ukeGeeks.toolsLite = new function(){
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
	this.addClass = function(element, className){
		if (!this.hasClass(element,className)) { 
			element.className += ' ' + className; 
		}
	};
	
	this.hasClass = function(element, className) {
		return element.className.match(getRegEx(className));
	};

	this.removeClass = function(element, className) {
		if (this.hasClass(element, className)) {
			var reg = getRegEx(className);
			element.className=element.className.replace(reg,' ');
		}
	};
	
	var getRegEx = function(className){
		return new RegExp('(\\s|^)'+className+'(\\s|$)');
	};
	
	/**
	 * Removes all white space at the begining and end of a string.
	 * @method trim
	 * @param str {String} String to trim.
	 * @return {String} Returns string without leading and following white space characters.
	 */
	this.trim = function(str){
		return str.replace(regEx.trim, '');
	};
	
	this.pack = function(value){
		return value.replace(regEx.dbleSpace, ' ').replace(regEx.trim, '');
	};
};
;/**
 * Converts text to JSON objects. Accetps either large text blocks or single lines of 
 * text written in CPM syntax (looks for instrument, tuning, and define statements). 
 * @class chordImport
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus 
 */
ukeGeeks.chordImport = new function(){
	/**
	 * Internal storage of partially converted "define" statements. The Definition (string) and addIn (array<strings>)
	 * @class chordImport.chordParts
	 * @type ClassDefinition
	 * @private
	 */
	var chordParts = function(definition, addIns){
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
		name : /(\S+)\s+/,
		frets : /\s+frets\s+([\dx]{4}|(([\dx]{1,2}\s){3})[\dx]{1,2})/i,
		fingers : /\s+fingers\s+((\d\s+){3}\d|\d{4})/i,
		muted : /\s+mute\s+(\d\s){0,3}\d?/i,
		// TODO: ignores "base-fret 1"
		// filter "add-in" chord fingers
		addin : /add:\s*string\s*(\S+)\s+fret\s+(\d+)\sfinger\s(\d)/i,
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
	var _lineToParts = function(line){
		var s = ukeGeeks.toolsLite.pack(line);
		if (s.length > 1 && s[0] != '#'){
			var m = s.match(regEx.define);
			if (m && m.length > 1){
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
	var _textToParts = function(lines){
		var p = [];
		for(var i in lines){
			var c = _lineToParts(lines[i]);
			if (c){
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
	var _getAddIns = function(txt){
		var finds = [];
		var m = txt.match(regEx.add);
		while (m && m.length > 1){
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
	var _getInstrument = function(text){
		var c = text.match(regEx.instr);
		if (!c){
			return null;
		}
		return ukeGeeks.toolsLite.pack(c[1]);
	};
	
	/**
	 * TODO:
	 * @method _getTuning
	 * @private
	 * @param text {string} Single statement to be searched
	 * @return {string}
	 */
	var _getTuning = function(text){
		var c = text.match(regEx.tuning);
		if (!c){
			return null;
		}
		return [c[1], c[2], c[3], c[4]];
	};
	
	/**
	 * TODO:
	 * @method _getName
	 * @private
	 * @param text {string} Single statement to be searched
	 * @return {string}
	 */
	var _getName = function(text){
		var c = text.match(regEx.name);
		if (!c){
			return null;
		}
		return c[1];
	};
	
	/**
	 * TODO:
	 * @method _getKey
	 * @private
	 * @param name {string} 
	 * @param tuning {array<string>} 
	 * @return {string}
	 */
	var _getKey = function(name, tuning){
		var s = name.replace(' ', '-');
		for(var i in tuning){
			s+= '-' + tuning[i];
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
	var _fretOMatic = function(text, frets, muted){
		var f = text.match(regEx.frets);
		if (!f){
			return;
		}
		var m = (f[1].length == 4) ? f[1].match(regEx.any) : f[1].match(regEx.numOrX);
		var j = 0;
		for(var i in m){
			var isX = m[i] == 'x' || m[i] == 'X';
			frets[j] = isX ? 0 : parseInt(m[i]);
			muted[j] = isX;
			j++;
		}
	};
	
	/**
	 * TODO:
	 * @method _getFingers
	 * @private
	 * @param text {string} string to be searched
	 * @return {array<string>}
	 */
	var _getFingers = function(text){
		var f = text.match(regEx.fingers);
		if (!f){
			return [];
		}
		var x = f[1];
		if (x.length == 4){
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
	var _toDots = function(frets, fingers){
		var dots = [];
		var tuning = ukeGeeks.settings.tuning;
		for (var j = 0; j < tuning.length; j++){
			var n = parseInt(frets[j]);
			if (n > 0){
				dots.push(new ukeGeeks.data.dot(j, n, (fingers.length - 1 >= j) ? parseInt(fingers[j]) : 0));
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
	var _addInDots = function(dots, adds){
		if (!adds || adds.length < 1){
			return;
		}
		for(var i in adds){
			var a = adds[i].match(regEx.addin);
			if (a && a.length > 2){
				dots.push(new ukeGeeks.data.dot(parseInt(a[1]) - 1, parseInt(a[2]), parseInt(a[3])));
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
	var _getExpandedChord = function(text, adds){
		var frets = [];
		var muted = [];
		_fretOMatic(text, frets, muted);
		
		var name = _getName(text);
		var fingers = _getFingers(text);
		
		if (name == null || name == 'frets'){
			_log('bad "define" instruction: chord name not found: ' + text);
			return null;
		}
		if (frets == null){
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
	var _partsToChords = function(parts){
		var c = [];
		var x = null;
		for(var i in parts){
			x = _getExpandedChord(parts[i].define, parts[i].adds);
			if (x){
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
	var _log = function(msg){
		_errs.push(msg);
	}
	var _errs = [];
	var _echoLog = function(){
		for(var i in _errs){
			console.log(i + '. ' + _errs[i]);
		}
	};
	
	/**
	 * Returns an expandedChord object (JSON) converted from single statement text input line.
	 * @method runLine
	 * @param line {string} Single line (string with one statment)
	 * @return {ukeGeeks.data.expandedChord}
	 */
	this.runLine = function(line){
		var c = _lineToParts(line);
		if (!c){
			return null;
		}
		return _getExpandedChord(c.define, c.adds);
	};
	
	/**
	 * Returns array of expandedChord objects (JSON), converted from text input.
	 * @method runBlock
	 * @param text {string} Multiline text block containing definition, instrument, and tuning statements.
	 * @return {ukeGeeks.data.instrument}
	 */
	this.runBlock = function(text){
		//TODO: newlines get lost in strings, do I always relya on "{"?
		var nL = text.split('\n');
		if (nL.length < 2){
			nL = text.split('{');
		}
		var parts = _textToParts(nL);
		var n = _getInstrument(text);
		var t = _getTuning(text);
		return new ukeGeeks.data.instrument(
			_getKey(n, t), // key
			n, // name
			t, // tuning
			_partsToChords(parts) // chords
		);
	};

}
;ukeGeeks.transpose = new function(){
	var re = /^([A-G][#b]?)(.*)/;
	var tones = {
		'A' : 0, 
		'A#' : 1, 'Bb' : 1,
		'B' : 2,
		'C' : 3,
		'C#' : 4, 'Db' : 4,
		'D' : 5,
		'D#' : 6, 'Eb' : 6,
		'E' : 7,
		'F' : 8,
		'F#' : 9, 'Gb' : 9,
		'G' : 10,
		'G#' : 11, 'Ab' : 11
	};

	/**
	 * Pass in a chord name returns new chord name for the original chord shifted by "steps" semitones.
	 * @method shift
	 * @param name (string) chord name, should be in chord dictionary
	 * @param steps (int) number of semitones to transpose
	 * @return {areinf}
	 */
	this.shift = function(name, steps){
		var t = getTone(name);
		if (t == null){
			return null;
		}
		var tone = t.tone + steps;
		if (tone > 11){
			tone = tone - 12;
		}
		// TODO: negative steps are allowed!!!
		for(var key in tones){
			if (tone == tones[key]){
				return key + t.suffix;
			}
		}
		return null;
	};
	
	/**
	 * 
	 * @method NAME
	 * @param NAME (TYPE) 
	 * @return {TYPE}
	 */
	var getTone = function(name){
		var m = name.match(re);
		if (m.length < 1){
			return null;
		}
		return {
			tone: parseInt(tones[m[1]]),
			prefix: m[1],
			suffix: m[2]
		};
	};


	/**
	 * DESCR
	 * @method NAME
	 * @param NAME (TYPE) 
	 * @return {TYPE}
	 */
	this.transpose = function(name, steps){
		if (steps == 0){
			return name;
		}
		return '';
	};
	
	/**
	 * Returns a mapping -- an array of JSON with "original" chord name and "transposed" chord names.
	 * @method retune
	 * @param offset (int) optional
	 * @return {array}
	 */
	this.retune = function(){
		var offset = (arguments.length > 0) ? arguments[0] : 0;
		var chords = ukeGeeks.definitions.getChords();
		var s = [];
		if (offset == 0){
			for(var i in chords){
				s.push({original: chords[i].name, transposed: chords[i].name});
			}
		}
		else{
			for(var i in chords){
				s.push({original: chords[i].name, transposed: ukeGeeks.transpose.shift(chords[i].name, offset)});
			}
		}
		return s;
	};
};
;/**
 * SINGLETON: Defines chords and provides simple lookup (find) tools.
 * @class definitions
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.definitions = new function(){
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
	this.instrument = {
		sopranoUke: 0, // GCEA
		baritoneUke : 7 // DGBA
	};
	
	/* PUBLIC METHODS
	------------------------------------ */
	/**
	 * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
	 * @method addInstrument
	 * @param text {string} Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
	 * @return {void}
	 */
	this.addInstrument = function(text){
		_instruments.push(text);
	};

	/**
	 * Choose which instrument's chord dictionary you want used for the chord 
	 * diagrams. NOTE: .
	 * @method useInstrument
	 * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
	 * @return {void}
	 */
	this.useInstrument = function(offset){
		var offset = (arguments.length > 0) ? arguments[0] : this.instrument.sopranoUke;
		_offset = parseInt(offset);
		if (_offset > 0){
			_map = ukeGeeks.transpose.retune(_offset);
		}
		this.setChords(ukeGeeks.chordImport.runBlock(_instruments[0]).chords);
	};
	
	/**
	 * Returns expanded ChordObject for requested "chord"
	 * @method get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	this.get = function(chordName){
		// try User Defined chords first
		for (var i = 0; i < _userChords.length; i++){
			if (chordName == _userChords[i].name){
				return _userChords[i];
			}
		}
		// next: built-in chords:
		if (_offset < 1){
			return _get(chordName);
		}
		else{
			// user has retuned the chords, need to find chord name "as-is",
			// but get the fingering from the mapping
			for(var i in _map){
				if (chordName == _map[i].original){
					var x = _get(_map[i].transposed);
					if (x){
						var chrd = new ukeGeeks.data.expandedChord(chordName);
						chrd.dots = x.dots;
						return chrd;
					}
				}
			}
		}
		return null;
	};

	// local substituions (replacements for identical chord shapes)
	var _subs = {'A#' : 'Bb', 'Db' : 'C#', 'D#' : 'Eb', 'Gb' : 'F#', 'Ab' : 'G#'};
	/**
	 * todo:
	 * @private
	 * @method _get
	 * @param chordName {string} Chord name
	 * @return {expandedChord}
	 */
	var _get = function(chordName){
		var n = chordName.substr(0,2);
		var s = _subs[n];
		if (s){
			var c = _get(s + chordName.substr(2));
			if (!c){
				return null;
			}
			var chrd = new ukeGeeks.data.expandedChord(chordName);
			chrd.dots = c.dots;
			return chrd;
		}
		for (var i = 0; i <_chords.length; i++){
			if (chordName == _chords[i].name){
				return _chords[i];
			}
		}
		return null;
	};
	
	/**
	 * @method add
	 * @param data {type} array of expanded chord objects
	 * @return {int}
	 */
	this.add = function(data){
		if (data.length){
			for (var i=0; i < data.length; i++){
				_userChords.push(data[i]);
			}
		}
		return _userChords.length;
	};

	/**
	 * @method replace
	 * @param data {type} array of expanded chord objects
	 * @return {int}
	 */
	this.replace = function(data){
		_userChords = [];
		return this.add(data);
	};

	/**
	 * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
	 * @method getChords
	 * @return {arrayChords}
	 */
	this.getChords = function(){
		return _chords;
	};
	
	this.setChords = function(value){
		_chords = value;
	};
	
};
;ukeGeeks.definitions.addInstrument("\
{instrument: Soprano Ukulele}\
{tuning: G C E A}\
# Ab returns G#\
# A\
{define: A frets 2 1 0 0 fingers 1 2 0 0}\
{define: Am frets 2 0 0 0 fingers 1 0 0 0}\
{define: A7 frets 0 1 0 0 fingers 0 1 0 0}\
{define: Am7 frets 0 0 0 0}\
{define: Adim frets 2 3 2 3 fingers 1 3 2 4}\
{define: Amaj7 frets 1 1 0 0 fingers 1 2 0 0}\
{define: A6 frets 2 4 2 4 fingers 1 3 2 4}\
{define: Asus2 frets 2 4 5 2 fingers 2 3 4 1}\
{define: Asus4 frets 2 2 0 0 fingers 1 2 0 0}\
{define: Aaug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}\
{define: Am6 frets 2 4 2 3 fingers 1 3 1 2 add: string 2 fret 2 finger 1}\
{define: A9 frets 0 1 0 2 fingers 0 1 0 2}\
# A# retruns Bb\
# Bb\
{define: Bb frets 3 2 1 1 fingers 3 2 1 1}\
{define: Bbm frets 3 1 1 1 fingers 3 1 1 1 add: string 1 fret 1 finger 1}\
{define: Bb7 frets 1 2 1 1 fingers 1 2 1 1 add: string 2 fret 1 finger 1}\
{define: Bbm7 frets 1 1 1 1 fingers 1 1 1 1}\
{define: Bbdim frets 0 1 0 1 fingers 0 1 0 2}\
{define: Bbmaj7 frets 2 2 1 1 fingers 2 2 1 1}\
{define: Bb6 frets 0 2 1 1 fingers 0 2 1 1}\
{define: Bbm6 frets 0 1 1 1 fingers 0 1 1 1}\
{define: Bbsus2 frets 3 0 1 1 fingers 3 0 1 1}\
{define: Bbsus4 frets 3 3 1 1 fingers 3 3 1 1}\
{define: Bbaug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}\
{define: Bb9 frets 1 2 1 3 fingers 2 1 4 3}\
{define: BbMaj7 frets 2 2 1 1 fingers 2 2 1 1}\
{define: Bbm7-5 frets 1 1 0 1 fingers 1 2 0 3}\
# B\
{define: B frets 4 3 2 2 fingers 3 2 1 1}\
{define: Bm frets 4 2 2 2 fingers 3 1 1 1 add: string 1 fret 2 finger 1}\
{define: Bm6 frets 1 2 2 2 fingers 1 2 3 4}\
{define: B7 frets 2 3 2 2 fingers 1 2 1 1 add: string 2 fret 2 finger 1}\
{define: Bm7 frets 2 2 2 2 fingers 1 1 1 1}\
{define: Bdim frets 1 2 1 2 fingers 1 3 2 4}\
{define: Bmaj7 frets 3 3 2 2 fingers 2 2 1 1}\
{define: B6 frets 1 3 2 2 fingers 1 4 2 3}\
{define: Bsus2 frets 5 1 2 2 fingers 4 1 3 2}\
{define: Bsus4 frets 4 4 2 2 fingers 2 2 1 1}\
{define: Baug frets 0 3 3 2 fingers 0 2 2 1}\
{define: B9 frets 2 3 2 4}\
# C\
{define: C frets 0 0 0 3 fingers 0 0 0 3}\
{define: Cm frets 0 3 3 3 fingers 0 1 2 3}\
{define: C7 frets 0 0 0 1 fingers 0 0 0 1}\
{define: Cm7 frets 3 3 3 3 fingers 1 1 1 1}\
{define: Cdim frets 2 3 2 3 fingers 1 3 2 4}\
{define: Cmaj7 frets 0 0 0 2 fingers 0 0 0 1}\
{define: C6 frets 0 0 0 0}\
{define: Cm6 frets 0 3 5 5 fingers 0 1 3 1}\
{define: Csus2 frets 0 2 3 3 fingers 0 1 2 2}\
{define: Csus4 frets 0 0 1 3 fingers 0 0 1 3}\
{define: Caug frets 1 0 0 3 fingers 1 0 0 4}\
{define: C9 frets 0 2 0 2 fingers 0 2 0 1}\
# C#\
{define: C# frets 1 1 1 4 fingers 1 1 1 4 add: string 4 fret 1 finger 1}\
{define: C#m frets 1 4 4 4 fingers 1 2 3 3}\
{define: C#7 frets 1 1 1 2 fingers 1 1 1 2 add: string 4 fret 1 finger 1}\
{define: C#m7 frets 1 4 4 2 fingers 1 3 3 2}\
{define: C#dim frets 0 1 0 1 fingers 0 1 0 2}\
{define: C#maj7 frets 1 1 1 3 fingers 1 1 1 3 add: string 4 fret 1 finger 1}\
{define: C#6 frets 1 1 1 1 fingers 1 1 1 1}\
{define: C#m6 frets 1 1 0 1 fingers 1 2 0 3}\
{define: C#sus2 frets 1 3 4 4 fingers 1 2 3 3}\
{define: C#sus4 frets 1 1 2 4 fingers 1 1 2 4}\
{define: C#aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}\
{define: C#9 frets 1 3 1 2}\
# Db returns C#\
# D\
{define: D frets 2 2 2 0 fingers 1 1 1 0}\
{define: Dm frets 2 2 1 0 fingers 2 2 1 0}\
{define: Dm6 frets 0 2 1 2 fingers 0 2 1 3}\
{define: D7 frets 2 2 2 3 fingers 1 1 1 2 add: string 4 fret 2 finger 1}\
{define: Dm7 frets 2 2 1 3 fingers 2 2 1 3}\
{define: Ddim frets 1 2 1 2 fingers 1 3 2 4}\
{define: Dmaj7 frets 2 2 2 3 fingers 1 1 1 2 add: string 4 fret 2 finger 1}\
{define: D6 frets 2 2 2 2 fingers 2 2 2 2}\
{define: Dsus2 frets 2 2 0 0 fingers 1 2 0 0}\
{define: Dsus4 frets 0 2 3 0 fingers 0 1 2 0}\
{define: Daug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}\
{define: D9 frets 2 4 2 3}\
# D# returns Eb\
# Eb\
{define: Eb frets 0 3 3 1 fingers 0 2 2 1}\
{define: Ebm frets 3 3 2 1 fingers 3 3 2 1}\
{define: Eb7 frets 3 3 3 4 fingers 1 1 1 2 add: string 4 fret 3 finger 1}\
{define: Ebm7 frets 3 3 2 4 fingers 2 2 1 4}\
{define: Ebdim frets 2 3 2 3 fingers 1 3 2 4}\
{define: Ebmaj7 frets 3 3 3 5 fingers 1 1 1 2 add: string 4 fret 3 finger 1}\
{define: Eb6 frets 3 3 3 3 fingers 1 1 1 1}\
{define: Ebm6 frets 3 3 2 3 fingers 2 3 1 4}\
{define: Ebsus2 frets 3 3 1 1 fingers 2 2 1 1}\
{define: Ebsus4 frets 1 3 4 1 fingers 2 3 4 1}\
{define: Ebaug frets 0 3 3 2 fingers 0 2 2 1}\
{define: Eb9 frets 0 1 1 1}\
# E\
{define: E frets 4 4 4 2 fingers 2 3 4 1}\
{define: Em frets 4 4 3 2 fingers 3 3 2 1}\
{define: E7 frets 1 2 0 2 fingers 1 2 0 3}\
{define: Em6 frets 4 4 3 4 fingers 2 3 1 4}\
{define: Em7 frets 0 2 0 2 fingers 0 1 0 2}\
{define: Edim frets 0 1 0 1 fingers 0 1 0 2}\
{define: Emaj7 frets 1 3 0 2 fingers 1 3 0 2}\
{define: E6 frets 4 4 4 4 fingers 1 1 1 1}\
{define: Esus2 frets 4 4 2 2 fingers 3 3 1 1}\
{define: Esus4 frets 2 4 0 2 fingers 2 4 0 1}\
{define: Eaug frets 1 0 0 3 fingers 1 0 0 4}\
{define: E9 frets 1 2 2 2}\
# F\
{define: F frets 2 0 1 0 fingers 2 0 1 0}\
{define: Fm frets 1 0 1 3 fingers 1 0 2 4}\
{define: F7 frets 2 3 1 3 fingers 2 3 1 4}\
{define: Fm6 frets 1 2 1 3 fingers 1 2 1 3 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}\
{define: Fm7 frets 1 3 1 3 fingers 1 3 2 4}\
{define: Fdim frets 1 2 1 2 fingers 1 3 2 4}\
{define: Fmaj7 frets 2 4 1 3 fingers 2 4 1 3}\
{define: F6 frets 2 2 1 3 fingers 2 2 1 4}\
{define: Fsus2 frets 0 0 1 3 fingers 0 0 1 3}\
{define: Fsus4 frets 3 0 1 3 fingers 3 0 1 4}\
{define: F6sus2 frets 0 0 1 3 fingers 0 0 1 3}\
{define: F6sus4 frets 3 0 1 1 fingers 3 0 1 1}\
{define: F6aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}\
{define: F9 frets 2 3 3 3}\
{define: Faug frets 2 1 1 0 fingers 3 1 2 0}\
# F#\
{define: F# frets 3 1 2 1 fingers 3 1 2 1 add: string 1 fret 1 finger 1 add: string 3 fret 1 finger 1}\
{define: F#m frets 2 1 2 0 fingers 2 1 3 0}\
{define: F#7 frets 3 4 2 1 fingers 3 4 2 1}\
{define: F#m7 frets 2 4 2 4 fingers 1 3 2 4}\
{define: F#dim frets 2 3 2 3 fingers 1 3 2 4}\
{define: F#maj7 frets 3 5 2 4 fingers 2 4 1 3}\
{define: F#m6 frets 2 1 2 4 fingers 2 1 3 4}\
{define: F#6 frets 3 3 2 4 fingers 2 2 1 4}\
{define: F#sus2 frets 1 1 2 4 fingers 1 1 2 4}\
{define: F#sus4 frets 4 1 2 2 fingers 4 1 2 3}\
{define: F#aug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}\
{define: F#9 frets 1 1 0 1}\
# Gb returns F#\
# G\
{define: G frets 0 2 3 2 fingers 0 1 3 2}\
{define: Gm frets 0 2 3 1 fingers 0 2 3 1}\
{define: Gm6 frets 0 2 0 1 fingers 0 2 0 1}\
{define: G7 frets 0 2 1 2 fingers 0 2 1 3}\
{define: Gm7 frets 0 2 1 1 fingers 0 2 1 1}\
{define: Gdim frets 0 1 0 1 fingers 0 1 0 2}\
{define: Gmaj7 frets 0 2 2 2 fingers 0 1 2 3}\
{define: G6 frets 0 2 0 2 fingers 0 1 0 2}\
{define: Gsus2 frets 0 2 3 0 fingers 0 1 2 0}\
{define: Gsus4 frets 0 2 3 3 fingers 0 1 2 3}\
{define: Gaug frets 0 3 3 2 fingers 0 2 2 1}\
{define: Gsus4 frets 0 2 3 3}\
{define: G9 frets 2 2 1 2}\
# G#\
{define: G# frets 5 3 4 3 fingers 3 1 2 1 add: string 2 fret 3 finger 1 add: string 4 fret 3 finger 1}\
{define: G#m frets 1 3 4 2 fingers 1 3 4 2}\
{define: G#7 frets 1 3 2 4 fingers 1 3 2 4}\
{define: G#m7 frets 1 3 2 2 fingers 1 4 2 3}\
{define: G#dim frets 1 2 1 2 fingers 1 3 2 4}\
{define: G#maj7 frets 1 3 3 3 fingers 1 2 2 3}\
{define: G#6 frets 1 3 1 3 fingers 1 3 2 4}\
{define: G#m6 frets 1 3 1 2 fingers 1 3 1 2 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}\
{define: G#sus2 frets 1 3 4 1 fingers 2 3 4 1}\
{define: G#sus4 frets 1 3 4 4 fingers 1 2 3 3}\
{define: G#aug frets 1 0 0 3 fingers 1 0 0 4}\
{define: G#9 frets 2 2 1 2}\
# slash chords & other oddities\
{define: C-F frets 2 0 1 3}\
{define: D/A frets 2 2 2 0}\
{define: Dm/C frets 2 2 1 3}\
{define: Fm7/C frets 1 3 1 3}\
{define: G/B frets 0 2 3 2}\
{define: G/F# frets 0 2 2 2}\
{define: G/F frets 0 2 1 2}\
{define: G7/B frets 0 2 1 2}\
");

;/**
 * Wraps three common canvas actions: adding canvas element to DOM, drawing a dot, adding text. A singleton.
 * @class canvasTools
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.canvasTools = new function(){
	/**
	 * @method drawDot
	 * @param ctx {type} blah
	 * @param centerPos {type} blah
	 * @param radius {int} Dot's Radius
	 * @param color {string} Hex color
	 * @return {void}
	 */
	this.drawDot = function (ctx, centerPos, radius, color){
		ctx.beginPath();
		ctx.arc(centerPos.x, centerPos.y, radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	};

	/**
	 * @method drawText
	 * @param ctx {CanvasContext} Valid Canvas Context Handle
	 * @param pos {XYPosObject} Object with two properties: x & y ints, position in pixels
	 * @param text {string} Any string to be places at Pos
	 * @param font {string} Font, CSS-like definition of size and font-family, i.e. 
	 * @param color {string} Hexadecimal RGB color definition
	 * @param align {string} (optional) Text will be aligned at position (pos) as [left,right,center]. Default is center.
	 * @return {void}
	 */
	this.drawText= function(ctx, pos, text, font, color, align){
		if (!ctx.fillText) return;// IE check
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
	this.addCanvas = function(element, width, height){
		// make element
		var c = document.createElement('canvas');
		if (!c){
			return null;
		}
		// because IE is an abomination... must init & place in DOM BEFORE doing anything else
		if (ukeGeeks.settings.environment.isIe){
			c = G_vmlCanvasManager.initElement(c);
		}
		element.appendChild(c);
		c.width = width;
		c.height = height;
		// canvas context handle	
		var ctx = c.getContext('2d');
		if (!ctx){
			return null;
		}
		return ctx;
	};

}


;/**
 * First places a Canvas element within a DOM element, then draws a chord diagram on it.
 * @class chordBrush
 * @namespace ukeGeeks
 */
ukeGeeks.chordBrush = function(){};
ukeGeeks.chordBrush.prototype = {
	
	/* PUBLIC METHODS
	  ---------------------------------------------- */
	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @return {void}
	 */
	init: function(){
	},

	/**
	 * Puts a new Canvas within ChordBox and draws the chord diagram on it.
	 * @method plot
	 * @param chordBox {DOMElement} Handle to the DOM element where the chord is to be drawn.
	 * @param chord {expandedChord} Chord Diagram to be drawn.
	 * @param fretBox {JSON} Appropriate ukeGeeks.settings.fretBox -- either "fretBox" or "inlineFretBox"
	 * @return {void}
	 */
	plot: function(chordBox, chord, fretBox){
		var ctx = ukeGeeks.canvasTools.addCanvas(chordBox, fretBox.width, fretBox.height);
		if (ctx == null){
			return;
		}
		// starting top-left position for chord diagram
		var pos = {
			x : fretBox.topLeftPos.x,
			y : fretBox.topLeftPos.y
		};
		this._drawFretboard(ctx, pos, fretBox);
		// find where the circle centers should be:
		var centers = {
			x: pos.x,
			y: (pos.y + fretBox.dotRadius)
		};
		// find the vertical shift by dividing the freespace between top and bottom (freespace is the row height less circle diameter)
		var fudgeY = (fretBox.fretSpace - 2 * fretBox.dotRadius) / 2;
		var firstFret = this._getFirstFret(chord.dots);
		for (var i=0; i < chord.dots.length; i++){
			var s = chord.dots[i].string;
			var p = {
				x: (centers.x + s * fretBox.stringSpace),
				y: (fudgeY + centers.y + (chord.dots[i].fret-firstFret) * fretBox.fretSpace)
			};
			ukeGeeks.canvasTools.drawDot(ctx, p, fretBox.dotRadius, ukeGeeks.settings.colors.dots);
			// check that the dot's radius isn't stupidly small
			if (chord.dots[i].finger > 0 && fretBox.showText && fretBox.dotRadius > 4){
				ukeGeeks.canvasTools.drawText(ctx, {
					x : p.x,
					y : (p.y + 5)
				}, chord.dots[i].finger, ukeGeeks.settings.fonts.dot, ukeGeeks.settings.colors.dotText)
			}
		}
		// Text, first dots
		if (firstFret != 1){
			// Label the starting and ending frets (0-12). It's assumed that the fretboard covers frets 1-5. 
			// If insted the top fret is 6, say, well, this is the method called to the label "6".
			ukeGeeks.canvasTools.drawText(ctx, {
				x : 0,
				y : pos.y + (0.8 * fretBox.fretSpace)
			}, firstFret, ukeGeeks.settings.fonts.fret, ukeGeeks.settings.colors.fretText, 'left');
			ukeGeeks.canvasTools.drawText(ctx, {
				x : 0,
				y : pos.y + (4.8 * fretBox.fretSpace)
			}, (firstFret + 4), ukeGeeks.settings.fonts.fret, ukeGeeks.settings.colors.fretText, 'left');
		}
		// TODO: top offset
		if (fretBox.showText){
			ukeGeeks.canvasTools.drawText(ctx, {
				x : (pos.x + 1.5 * fretBox.stringSpace),
				y : (pos.y - 5)
			}, chord.name, ukeGeeks.settings.fonts.text, ukeGeeks.settings.colors.text);
		}
		this._mutedStrings(ctx, fretBox, chord.muted);
	},

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
	_drawFretboard: function(ctx, pos, fretBox){
		// width offset, a "subpixel" adjustment
		var offset = fretBox.lineWidth / 2;
		// locals
		var stringHeight = ukeGeeks.settings.numFrets * fretBox.fretSpace;
		var fretWidth = 3 * fretBox.stringSpace;
		// build shape
		ctx.beginPath();
		// add "C" & "E" strings
		for (var i=1; i < 3; i++){
			var x = pos.x + i * fretBox.stringSpace + offset;
			ctx.moveTo(x, pos.y + offset);  
			ctx.lineTo(x, pos.y + stringHeight + offset);  
		}
		// add frets
		for (var i=1; i < ukeGeeks.settings.numFrets; i++){
			var y = pos.y + i * fretBox.fretSpace + offset;
			ctx.moveTo(pos.x + offset, y);
			ctx.lineTo(pos.x + fretWidth + offset, y);
		}
		//
		ctx.rect( pos.x + offset, pos.y + offset, fretWidth, stringHeight);
		// stroke shape
		ctx.strokeStyle = ukeGeeks.settings.colors.fretLines;
		ctx.lineWidth = fretBox.lineWidth;
		ctx.stroke();
		ctx.closePath();
	},

	/**
	 * TODO: Loop over the muted array, dropping X's whenever a string position is TRUE
	 * @method _mutedStrings
	 * @private 
	 * @param 
	 * @return {void}
	 */
	_mutedStrings: function(ctx, fretBox, muted){
		var x = fretBox.topLeftPos.x + fretBox.lineWidth / 2;
		var y = fretBox.topLeftPos.y + fretBox.lineWidth / 4;
		for(var i = 0; i < muted.length; i++){
			if (muted[i]){
				this._drawX(ctx, {x: x + i * fretBox.stringSpace, y: y}, fretBox);
			}
		}
	},
	
	/**
	 * Plots an "X" centered at POSITION
	 * @method _drawX
	 * @private 
	 * @param 
	 * @return {void}
	 */
	_drawX: function(ctx, pos, fretBox){
		pos.x -= fretBox.xWidth / 2;
		pos.y -= fretBox.xWidth / 2;
		
		ctx.beginPath();
		
		ctx.moveTo(pos.x, pos.y);  
		ctx.lineTo(pos.x + fretBox.xWidth, pos.y + fretBox.xWidth);  
		ctx.moveTo(pos.x, pos.y + fretBox.xWidth);
		ctx.lineTo(pos.x + fretBox.xWidth, pos.y);
		
		ctx.strokeStyle = ukeGeeks.settings.colors.xStroke;
		ctx.lineWidth = fretBox.xStroke;
		ctx.stroke();
		ctx.closePath();
	},
	
	/**
	 * @method _getFirstFret
	 * @private 
	 * @param dots {array<data.dot>} Array of ukeGeeks.data.dot objects
	 * @return {void}
	 */
	_getFirstFret: function(dots){
		var maxF = 5;
		for (var i=0; i < dots.length; i++){
			if (dots[i].fret > maxF) 
				maxF = dots[i].fret;
		}
		return maxF-4;
	}

}
;/**
 * Reads an HTML (text) block looking for chords in format: [Emaj7]
 * Returns the HTML block with wrapped chords: &lt;code&gt;&lt;strong&gt;&lt;em&gt; 
 * @class chordParser
 * @namespace ukeGeeks
 */
ukeGeeks.chordParser = function(){};
ukeGeeks.chordParser.prototype = {
	chords: [],

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
	init: function(){
	},

	/**
	 * This does all of the work -- it's a Wrapper method that calls all of this classes other 
	 * (private) methods in correct order.
	 * @method parse
	 * @param text {string} CPM Text Block to be parsed
	 * @return {string}
	 */
	parse: function(text){
		this.chords = this._findChords(text);
		text = this._encloseChords(text, this.chords);
		text = this._packChords(text);
		return text;
	},
	
	/**
	 * Getter method for chords
	 * @method getChords
	 * @return {Array-chords}
	 */
	getChords: function(){
		return this.chords;
	},
	
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
	_findChords: function(text){
		var re = /\[(.+?)]/img;
		var m = text.match(re);
		if (!m) return [];
		
		// why not use associative array?
		var chords = [];
		var found;
		for (var i = 0; i < m.length; i++){
			found = false;
			for (var j = 0; j < chords.length; j++){
				if (chords[j] == m[i]) {
					found = true;
					break;
				}
			}
			if (!found){
				chords.push(m[i]);
			}
		}
		// clean 'em
		for (var j in chords){
			chords[j] = chords[j].replace('[','').replace(']','');
		}
		// done
		return chords;
	},

	/**
	 * Returns the input string having replaced all of the "bracketed chord names" (i.e. [D7]) with HTML 
	 * marked-up version (i.e. &lt;code&gt;&lt;strong&gt;[&lt;em&gt;D7&lt;/em&gt;]&lt;/strong&gt;&lt;/code&gt;)
	 * @method _encloseChords
	 * @private
	 * @param text {string} 
	 * @param chords {StringArray}
	 * @return {string}
	 */
	_encloseChords: function(text, chords){
		for(var i in chords){
			do {} 
			while(text.length != (text = text.replace(
				'[' + chords[i] + ']', 
				'<code data-chordName="' + chords[i] + '"><strong>[<em>' + chords[i] + '</em>]</strong></code>')).length);
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
	},

	/**
	 * Looks for consecutive chords and strips the whitespace between them -- thus "packing" the 
	 * chords against each other with only a single space separating them.
	 * @method _packChords
	 * @private
	 * @param text {string} 
	 * @return {string}
	 */
	_packChords: function(text){
		if (ukeGeeks.settings.inlineDiagrams){
			/* TODO: problem with packing */
			var re = /(<\/strong><\/code>)[ 	]*(<code data-chordName="[^"]*"><strong>)/ig;
			return text.replace(re,'$1<span class="ugsInlineSpacer">&nbsp;</span>$2');
			/*
			var re = /(<\/strong><\/code>)[ 	]*<code (data-chordName="[^"]*"><strong>)/ig;
			return text.replace(re,'$1<code style="display:inline-block;width:40px;" $2');
			*/
		}
		else{
			var re = /<\/strong><\/code>[ 	]*<code data-chordName="[^"]*"><strong>/ig;
			return text.replace(re,' ');
		}
	}
}


;/**
 * Reads a text block and returns an object containing whatever ChordPro elements it recognizes.
 * 
 * A cleaned, HTML version of song is included.
 *
 * @class cpmParser
 * @namespace ukeGeeks
 */
ukeGeeks.cpmParser = function(){};
ukeGeeks.cpmParser.prototype = {
	/**
	* While debugging this prevents run-away (infinite) loops. Pseudo-constant.
	* @property runaway
  * @private 
	* @type int
	*/
	runaway: 30,
	
	/**
	* Number of columns defined
	* @property columnCount
  * @private 
	* @type int
	*/
	columnCount: 1,
	
	/**
	* Under development, bool indicating whether any chords were found within the lyrics. 
	* Helpful for tablature-only arrangements.
	* TODO: do not rely on this!!!
	* @property hasChords
  * @private 
	* @type bool
	*/
	hasChords: false, // TODO: 
	
	/**
	 * Again this is a constructor replacement. Just here for consistency. Does nothing.
	 * @method init
	 * @return {void}
	 */
	init: function(){
	},

	/**
	 * Accepts CPM text, returning HTML marked-up text 
	 * @method parse
	 * @param text {string} string RAW song
	 * @return {songObject}
	 */
	parse: function(text){
		var song = new ukeGeeks.data.song;
		text = this._stripHtml(text);
		var songDom = this._domParse(text);
		songDom = this._parseInstr(songDom);
		songDom = this._parseSimpleInstr(songDom);
		songDom = this._markChordLines(songDom);
		song.body = this._export(songDom);
		if (this.columnCount > 1){
			song.body = '<div class="' + this.classNames.ColumnWrap + ' ' + this.classNames.ColumnCount + this.columnCount + '">' 
			+ '<div class="' + this.classNames.Column + '">'
			+ song.body
			+ '</div>'
			+ '</div>';
		}
		song.hasChords = this.hasChords;
		var tmp;
		// Song Title
		tmp = this._getInfo(songDom, this.blockTypeEnum.Title);
		if (tmp.length > 0){
			song.title = tmp[0];
		}
		// Artist
		tmp = this._getInfo(songDom, this.blockTypeEnum.Artist);
		if (tmp.length > 0){
			song.artist = tmp[0];
		}
		// Song Subtitle
		tmp = this._getInfo(songDom, this.blockTypeEnum.Subtitle);
		if (tmp.length > 0){
			song.st = tmp[0];
		}
		if (tmp.length > 1){
			song.st2 = tmp[1];
		}
		// Album
		tmp = this._getInfo(songDom, this.blockTypeEnum.Album);
		if (tmp.length > 0){
			song.album = tmp[0];
		}
		// UkeGeeks "Extras"
		tmp = this._getInfo(songDom, this.blockTypeEnum.UkeGeeksMeta);
		if (tmp.length > 0){
			song.ugsMeta = tmp;
		}
		// Chord Definitions
		tmp = this._getInfo(songDom, this.blockTypeEnum.ChordDefinition);
		if (tmp.length > 0){
			for(var i in tmp){
				song.defs.push(ukeGeeks.chordImport.runLine('{define: ' + tmp[i] + '}'));
			}
		}
		return song;
	},
	
	/*
		TODO: add ukeGeeks Meta support:
		$regEx = "/{(ukegeeks-meta|meta)\s*:\s*(.+?)}/i";
	*/
	regEx : {
		blocks : /\s*{\s*(start_of_tab|sot|start_of_chorus|soc|end_of_tab|eot|end_of_chorus|eoc)\s*}\s*/im,
		tabBlock : /\s*{\s*(start_of_tab|sot)\s*}\s*/im,
		chorusBlock : /\s*{\s*(start_of_chorus|soc)\s*}\s*/im
	},

	/**
	* All of the CSS classnames used by UkeGeeks JavaScript
	* @property classNames
	* @private
	* @type JSON 
	*/
	classNames : {
		Comment: 'ugsComment',
		Tabs: 'ugsTabs',
		Chorus: 'ugsChorus',
		PreChords: 'ugsChords', // preformatted with chords
		PrePlain: 'ugsPlain', // preformated, no chords
		NoLyrics: 'ugsNoLyrics', // preformated, chords ONLY -- no lyrics (text) between 'em
		ColumnWrap: 'ugsWrap',
		ColumnCount: 'ugsColumnCount',
		Column: 'ugsColumn'
	},
	
	/**
	* Enumeration defining the types of nodes used within this class to parse CPM
	* @property blockTypeEnum
	* @private
	* @type JSON-enum 
	*/
	blockTypeEnum: {
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
		// Text Types
		ChordText: 201,
		PlainText: 202,
		ChordOnlyText: 203, // 
		// Undefined
		Undefined: 666
	},
	
	/**
	 * Retuns the block type (blockTypeEnum) of passed in line. 
	 * @method _getBlockType
	 * @private
	 * @param line {songNode} 
	 * @return {blockTypeEnum} 
	 */
	_getBlockType: function(line){
		// TODO: verify line's type in documentation
		if (this.regEx.chorusBlock.test(line)){
			return this.blockTypeEnum.ChorusBlock;
		}
		else if (this.regEx.tabBlock.test(line)){
			return this.blockTypeEnum.TabBlock;
		}
		return this.blockTypeEnum.TextBlock;
	},
	
	/**
	 * Convert passed in song to HTML block
	 * @method _export
	 * @private
	 * @param song {songNodeArray} 
	 * @return {strings} 
	 */
	_export: function(song){
		var nl = "\n";
		var html = '';
		for (var i=0; i < song.length; i++){
			/*
			if (song[i].type == this.blockTypeEnum.Title){
				html += '<h1>' + song[i].lines[0] + '</h1>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.Subtitle){
				html += '<h2>' + song[i].lines[0] + '</h2>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.Album){
				html += '<h3 class="ugsAlbum">' + song[i].lines[0] + '</h3>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.UkeGeeksMeta){
				html += '<h3>' + song[i].lines[0] + '</h3>' + nl;
			}
			else 
			*/
			if (song[i].type == this.blockTypeEnum.Comment){
				html += '<h6 class="' + this.classNames.Comment + '">' + song[i].lines[0] + '</h6>' + nl;
			}
			else if ((song[i].type == this.blockTypeEnum.ChordText) || (song[i].type == this.blockTypeEnum.PlainText ) || (song[i].type == this.blockTypeEnum.ChordOnlyText)){
				// TODO: beware undefined's!!!
				// Repack the text, only open/close <pre> tags when type changes
				// problem: exacerbates WebKit browsers' first chord position bug.
				var myClass = (song[i].type == this.blockTypeEnum.PlainText) ? this.classNames.PrePlain : this.classNames.PreChords;
				if (song[i].type == this.blockTypeEnum.ChordOnlyText){
					myClass += ' ' +this.classNames.NoLyrics;
				}
				var myType = song[i].type;
				var lastType = ((i - 1) >= 0) ? song[i - 1].type : this.blockTypeEnum.Undefined;
				var nextType = ((i + 1) < song.length) ? nextType = song[i + 1].type : this.blockTypeEnum.Undefined;
				html += (lastType != myType) ? ('<pre class="' + myClass + '">') : nl;
				html += song[i].lines[0];
				html += (nextType != myType) ? ('</pre>' + nl) : '';
			}
			else if (song[i].type == this.blockTypeEnum.ChorusBlock){
				html += '<div class="' + this.classNames.Chorus + '">' + nl;
				html += this._export(song[i].lines);
				html += '</div>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.TabBlock){
				html += '<pre class="' + this.classNames.Tabs + '">';
				for (var j in song[i].lines){
					html += song[i].lines[j] + nl;
				}
				html += '</pre>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.TextBlock){
				html += this._export(song[i].lines);
			}
			else if (song[i].type == this.blockTypeEnum.ColumnBreak){
				html += '</div><div class="' + this.classNames.Column + '">' ;
			}
			else{
		}
		}
		return html;
	},

	/**
	 * Debugging tool for Firebug. Echos the song's structure.
	 * @method _echo
	 * @private
	 * @param song {songNodeArray} 
	 * @return {void} 
	 */
	_echo: function(song){
		for (var i in song){
			console.log('>> '+i + '. ' + song[i].type + ' node, '+song[i].lines.length +' lines');
			for (var j in song[i].lines){
				console.log(song[i].lines[j]);
			}
		}
	},
		
	/**
	 * Explodes passed in text block into an array of songNodes ready for further parsing.
	 * @method _domParse
	 * @private
	 * @param text {string} 
	 * @return {songNodeArray} 
	 */
	_domParse: function(text){
		// var ezBlock = function(){};
		var lines = text.split('\n');
		var song = [];
		var tmpBlk = null;
		var isMarker; // block marker
		for (var i in lines){
			isMarker = this.regEx.blocks.test(lines[i]);
			if (isMarker || tmpBlk == null){
				// save last block, start new one...
				if (tmpBlk != null){
					song.push(tmpBlk);
				}
				tmpBlk = {
					type: this._getBlockType(lines[i]),
					lines : []
				};
				if (!isMarker){
					// Don't miss that first line!
					tmpBlk.lines.push(lines[i]);
				}
			}
			else{
				var s = ukeGeeks.toolsLite.trim(lines[i]);
				if (s.length > 0){
					tmpBlk.lines.push(s);
				}
			}
		}
		if (tmpBlk.lines.length > 0){
			song.push(tmpBlk);
		}
		return song;
	},

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
	_parseInstr: function(song){
		var regEx = {
			instr : /\{[^}]+?:.*?\}/im,
			cmdArgs : /\{.+?:(.*)\}/gi,
			cmdVerb : /\{(.+?):.*\}/gi
		};
		for (var i in song){
			for (var j in song[i].lines){
				if (regEx.instr.test(song[i].lines[j])){
					var args = song[i].lines[j].replace(regEx.cmdArgs,'$1');
					var verb = song[i].lines[j].replace(regEx.cmdVerb,'$1').toLowerCase();
					var tmpBlk = {
						type: '',
						lines : []
					};
					switch (verb){
						case 'title':
						case 't':
							tmpBlk.type = this.blockTypeEnum.Title;
							break;
						case 'artist':
							tmpBlk.type = this.blockTypeEnum.Artist;
							break;
						case 'subtitle':
						case 'st':
							tmpBlk.type = this.blockTypeEnum.Subtitle;
							break;
						case 'album':
							tmpBlk.type = this.blockTypeEnum.Album;
							break;
						case 'comment':
						case 'c':
							tmpBlk.type = this.blockTypeEnum.Comment;
							break;
						case 'define':
							tmpBlk.type = this.blockTypeEnum.ChordDefinition;
							break;
						case 'ukegeeks-meta':
							tmpBlk.type = this.blockTypeEnum.UkeGeeksMeta;
							break;
						default:
							tmpBlk.type = 'Undefined-'+verb;
							break;
					}
					tmpBlk.lines[0] = ukeGeeks.toolsLite.trim(args);
					song[i].lines[j] = tmpBlk;
				}
			}
		}
		return song;
	},
	
	/**
	 * A "Simple Instruction" is one that accepts no arguments. Presently this only handles Column Breaks.
	 * @method _parseSimpleInstr
	 * @private
	 * @param song {songNodeArray} 
	 * @return {songNodeArray} 
	 */
	_parseSimpleInstr: function(song){
		var regEx = {
			columnBreak : /\s*{\s*(column_break|colb)\s*}\s*/im
		};
		for (var i in song){
			for (var j in song[i].lines){
				if (regEx.columnBreak.test(song[i].lines[j])){
					this.columnCount++;
					song[i].lines[j] = {
						type: this.blockTypeEnum.ColumnBreak,
						lines : []
					};
				}
			}
		}
		return song;
	},

	/**
	 * Runs through songNodes and if the line contains at least one chord it's type is et to 
	 * ChordText, otherwise it's marked as "PlainText", meaning straight lyrics
	 * @method _markChordLines
	 * @private
	 * @param song {songNodeArray} 
	 * @return {songNodeArray} 
	 */
	_markChordLines: function(song){
		var regEx = {
			chord : /\[(.+?)]/i,
			allChords : /\[(.+?)]/img
		};
		
		var hasChrd;
		var isChrdOnly;
		var line;
		for (var i in song){
			if (song[i].type == this.blockTypeEnum.TextBlock || song[i].type == this.blockTypeEnum.ChorusBlock){
				for (var j in song[i].lines){
					line = song[i].lines[j];
					if (typeof(line) == 'string'){
						hasChrd = regEx.chord.test(line);
						this.hasChords = this.hasChords || hasChrd;
						isChrdOnly = hasChrd && (ukeGeeks.toolsLite.trim(line.replace(regEx.allChords, '')).length < 1);
						// need to find
						song[i].lines[j] = {
							type: (isChrdOnly ? this.blockTypeEnum.ChordOnlyText
								: (hasChrd ? this.blockTypeEnum.ChordText : this.blockTypeEnum.PlainText)), 
							lines : [line]
						};
					}
				}
			}
		}
		return song;
	},
	
	/**
	 * Searches the songNodes for the specified block type, retunrs all matching node line (text) values.
	 * @method _getInfo
	 * @private
	 * @param song {songNodeArray} 
	 * @param type {blockTypeEnum} 
	 * @return {array} 
	 */
	_getInfo: function(song, type){
		var rtn = [];
		for (var i in song){
			if (song[i].type == type){
				rtn.push(song[i].lines[0]);
			}
			else if (song[i].type == this.blockTypeEnum.TextBlock){
				for (var j in song[i].lines){
					if (song[i].lines[j].type == type){
						rtn.push(song[i].lines[j].lines[0]);
					}
				}
			}
		}
		return rtn;
	},
	
	/**
	 * Removes HTML "pre" tags and comments.
	 * @method _stripHtml
	 * @private
	 * @param text {string} 
	 * @return {string} 
	 */
	_stripHtml: function(text){
		var regEx = {
			pre : /<\/?pre>/img, // HTML <pre></pre>
			htmlComment : /<!--(.|\n)*?-->/gm // HTML <!-- Comment -->
		};
		return text.replace(regEx.pre, '').replace(regEx.htmlComment, '');
	}

};

;/**
 * Draws large chord diagram grid on canvas 
 * @class chordPainter
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus 
 */
ukeGeeks.chordPainter = function(){};
ukeGeeks.chordPainter.prototype = {
	/**
	 * ukeGeeks.canvas object handle
	 * @property brush
	 * @type ukeGeeks.chordBrush instance handle
	 * @private
	 */
	brush: null,

	/**
	 * keep an array of missing chords (strings)
	 * @property errors
	 * @type array
	 * @private
	 */
	errors: [],

	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @return {void}
	 */
	init: function(){
		this.brush = new ukeGeeks.chordBrush;
		this.brush.init();
	},
	
	/**
	 * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
	 * @method show
	 * @param id {string} DOM Element ID -- where the chords will be drawn
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	show: function(id, chords){
		var chordBox = document.getElementById(id);
		if (!chordBox) return;
		chordBox.innerHTML = '';
		this.errors = [];
		for (var i=0; i < chords.length; i++){
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				this.errors.push(chords[i]);
				continue;
			}
			this.brush.plot(chordBox,c,ukeGeeks.settings.fretBox);
		}
	},

	/**
	 * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;. 
	 * When found adds canvas element and draws chord named in data-chordName attribute
	 * @method showInline
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	showInline: function (chords){
		var e = document.getElementById(ukeGeeks.settings.ids.songText).getElementsByTagName('code');
		if (e.length < 1) return;
		for (var i=0; i < chords.length; i++){
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				/* TODO: error reporting if not found */
				// this.errors.push(chords[i]);
				continue;
			}
			for (var j=0; j < e.length; j++){
				if (e[j].getAttribute('data-chordName') == c.name){
					this.brush.plot(e[j],c,ukeGeeks.settings.inlineFretBox);
				}
			}
		}
	},
	
	/**
	 * returns array of unknown chords
	 * @method getErrors
	 * @return {array}
	 */
	getErrors: function(){
		return this.errors;
	}
}

;/**
 * 
 * @class tabs
 * @namespace ukeGeeks
 */
ukeGeeks.tabs = function(){};

ukeGeeks.tabs.prototype = {
	
	/* PUBLIC METHODS
	  ---------------------------------------------- */
	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @return {void}
	 */
	init: function(){
	},
	
	/**
	 * Races through all &lt;pre&gt; tags within h, any with the CSS class of "ugsTabs" will be replaced with the canvas element.
	 * @method replace
	 * @param h {DOM-element} 
	 * @return {void} 
	 */
	replace: function(h){
		var tabBlocks = h.getElementsByTagName('pre');
		for (var i in tabBlocks){
			if (tabBlocks[i].className == 'ugsTabs'){
				var s = tabBlocks[i].innerHTML;
				tabBlocks[i].innerHTML = "";
				this.loadBlocks(s,tabBlocks[i]);
			}
		}
	},
	
	/**
	 * 
	 * @method loadBlocks
	 * @param text {string} Block of text that contains one or more tablature blocks
	 * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
	 * @return {void}
	 */
	loadBlocks: function(text, outElement){
		var lns = text.split('\n');
		var tab = [];
		for(var i in lns){
			var s = ukeGeeks.toolsLite.trim(lns[i]);
			if (s.length > 0){
				tab.push(s);
			}
			if (tab.length == 4){
				this.redraw(tab, outElement);
				tab = [];
			}
		}
	},
	
	/**
	 * 
	 * @method redraw
	 * @param inTabs {string or array} Block of text or four element array containing tablbature to be parsed
	 * @param outElement {string or DOM} Either: (string) the Id to a DOM element, or DOM element handle where the canvas/converted text will be placed.
	 * @return {void}
	 */
	redraw: function(inTabs, outElement){
		// validate inTabs input...
		// TODO: instead of this if it's text pop the entire processing back to loadBlocks!
		inTabs = (typeof(inTabs) == 'string') ? (inTabs.split('\n')) : inTabs;
		if (inTabs.length < 4) {
			return;
		}
		// read tabs
		var tabInfo = this._readTabs(inTabs);
		var labelOffset = (tabInfo.hasLabels) ? ukeGeeks.settings.tabs.labelWidth: 0;
		var tabs = tabInfo.tabs;
		// how much space?
		var height = (3 * ukeGeeks.settings.tabs.lineSpacing) + (2 * ukeGeeks.settings.tabs.dotRadius) + ukeGeeks.settings.tabs.bottomPadding;
		// prep canvas
		outElement = (typeof(outElement) == 'string') ? document.getElementById(outElement) : outElement;
		var ctx = ukeGeeks.canvasTools.addCanvas(outElement, this._getWidth(tabs, labelOffset, false), height);
		var pos = {
			x: ukeGeeks.settings.tabs.dotRadius + labelOffset,
			y: 1 + ukeGeeks.settings.tabs.dotRadius
		};
		this._drawStaff(ctx, pos, this._getWidth(tabs, labelOffset, true), ukeGeeks.settings.tabs);
		this._drawNotes(ctx, pos, tabs, ukeGeeks.settings.tabs);
		if (tabInfo.hasLabels){
			this._drawLabels(ctx, pos, ukeGeeks.settings.tabs);
		}
	},
	
	/**
	 * This is insanely long, insanely kludely, but, insanely, it works. This will read break a block of text into
	 * four lines (the ukulele strings), then find which frets are used by eadh. Then, the hard part, pack uneeded 
	 * dashes. Once it's done that a 2-dimentional array (strings X frets) is created and returned.
	 * @method _readTabs
	 * @private 
	 * @param ukeStrings {array<string>} Block of tablbabure to be parsed
	 * @return {2-dimentional array}
	 */
	_readTabs: function(ukeStrings){
		var hasLabels = ukeStrings[3][0] == 'G';
		if (hasLabels){
			this._rdTbStripLabels(ukeStrings);
		}
		var frets = this._rdTbGetFrets(ukeStrings);
		var symbols = this._rdTbGetSymbols(ukeStrings);
		var minLength = this._rdTbGetMinLength(ukeStrings);
		var guide = this._rdTbGetGuide(symbols, minLength);
		return {
			tabs: this._rdTbGetPacked(frets,symbols,guide,minLength),
			hasLabels: hasLabels
		};
	},
	
	/**
	 * @method _getWidth
	 * @private
	 * @param tabs {2Darray}
	 * @param labelOffset {int}
	 * @param isTruncate {bool} If TRUE returns the length of the line, allowing for a terminating "|" character, othwrwise, it's for cavas width
	 * @return {int}
	 */
	_getWidth : function(tabs, labelOffset, isTruncate){
		if (!isTruncate){
			return (ukeGeeks.settings.tabs.noteSpacing * tabs[0].length) + labelOffset + ukeGeeks.settings.tabs.dotRadius;
		}
		
		var len = tabs[0].length;
		var plusDot = ukeGeeks.settings.tabs.dotRadius;
		if (tabs[0][len - 1] == '|'){
			len -= 1;
			plusDot = 0;
		}
		
		return ukeGeeks.settings.tabs.noteSpacing * len + labelOffset + plusDot;
	},
	
	/**
	 * Processes ukeStrings stripping the first character from each line
	 * @method _rdTbStripLabels
	 * @private
	 * @param ukeStrings {array<string>} 
	 * @return {void} 
	 */
	_rdTbStripLabels: function(ukeStrings){
		for(var i = 0; i < 4; i++){
			ukeStrings[i] = ukeStrings[i].substr(1);
		}
	// return ukeStrings;
	},
	
	/**
	 * Finds the frets in used for each line. In other words, ignoring 
	 * spacers ("-" or "|" for example) this returns arrays of numbers, the frets
	 * in use, for each line.
	 * @method _rdTbGetFrets
	 * @private
	 * @param ukeStrings {array<string>} 
	 * @return {void} 
	 */
	_rdTbGetFrets: function(ukeStrings){
		// first, get the frets
		var reInts = /([0-9]+)/g;
		var frets = [];
		for(var i=0; i < 4; i++){
			frets[i] = ukeStrings[i].match(reInts);
		}
		return frets;
	},	

	/**
	 * Returns array of the strings with placeholders instead of the numbers.
	 * This helps us pack because "12" and "7" now occupy the same space horizontally.
	 * @method _rdTbGetSymbols
	 * @private
	 * @param ukeStrings {array<string>} 
	 * @return {void} 
	 */
	_rdTbGetSymbols: function(ukeStrings){
		// convert to symbols
		var reDoubles = /([0-9]{2})/g;
		var reSingle = /([0-9])/g;
		var symbols = [];
		for(var i=0; i < 4; i++){
			symbols[i] = ukeStrings[i].replace(reDoubles,'-*');
			symbols[i] = symbols[i].replace(reSingle,'*');
		}
		return symbols;
	},

	/**
	 * Run through all of the strings (array) and return the length of the shortest one.
	 * would prefer the max length, but then I'd need to pad the shorter ones and ... well, it's complicated.
	 * this gets a TODO: get max!
	 * @method _rdTbGetMinLength
	 * @private
	 * @param ukeStrings {array<string>} 
	 * @return {void} 
	 */
	_rdTbGetMinLength: function(ukeStrings){
		var minLength = 10000;
		for(var i=0; i < 4; i++){
			minLength = (ukeStrings[i].length < minLength)? ukeStrings[i].length : minLength;
		}
		return minLength;
	},

	/**
	 * OK, having created symbolic representations fo the lines in earlier steps
	 * here we go through and "merge" them into a single, master "guide" -- saying
	 * "somewhere on this beat you'll pluck (or not) one note". This normalized 
	 * guide will be the master for the next step.
	 * @method _rdTbGetGuide
	 * @private
	 * @param symbols {undefined}
	 * @param minLength {int}
	 * @return {void} 
	 */
	_rdTbGetGuide: function(symbols, minLength){
		// Build a master pattern "guide" and eliminate double dashes
		var guide = '';
		for(var i=0; i < minLength; i++){
			if (symbols[0][i] == '|'){
				guide += '|';
			}
			else{
				guide += ((symbols[0][i] == '*') || (symbols[1][i] == '*') || (symbols[2][i] == '*') || (symbols[3][i] == '*')) ? '*' : '-';
			}
		}
		var reDash = /--/g;
		guide = guide.replace(reDash, '- ');
		reDash = / -/g;
		var lastGuide = guide;
		while (true){
			guide = guide.replace(reDash, '  ');
			if (guide == lastGuide){
				break;
			}
			lastGuide = guide;
		}
		// console.log(guide);
		return guide;
	},
	
	/**
	 * Using the packed "guide" line we loop over the strings, rebuilding each string
	 * with either a space, measure marker, or the note -- as an integer! Now the frets
	 * are the same regardless of whether they are single or double digit numbers: 
	 * a "12" occupies no more horizontal space than a "5".
	 * @method _rdTbGetPacked
	 * @private
	 * @param frets {undefined}
	 * @param symbols {undefined}
	 * @param guide {undefined}
	 * @param minLength {undefined}
	 * @return {void} 
	 */
	_rdTbGetPacked: function(frets, symbols, guide, minLength){
		// pack it!
		var packed = [[],[],[],[]];
		var chrNote = ''; // a temp variable to hold the 'note'
		for (var j=0; j<4; j++){ // loop over lines
			var p = 0; // packed counter
			var f = 0; // fret counter
			for(var i=0; i < minLength; i++){ // loop over guide
				if (guide[i] != ' '){
					if (symbols[j][i] == '*'){
						chrNote = frets[j][f];
						f++;
					}
					else{
						chrNote = ((guide[i] == '|')) ? '|' : '-';
					}
					packed[j][p] = chrNote;
					p++;
				}
			}
		}
		return packed;
	},

	/**
	 * Create the staff -- really the four tablature strings
	 * @method _drawStaff
	 * @private 
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param length {int} Length in pixels
	 * @param settings {settingsObj}
	 * @return {voie}
	 */
	_drawStaff: function(ctx, pos, length, settings){
		var offset = settings.lineWidth / 2;
		var x = pos.x + offset;
		var y = pos.y + offset;
		ctx.beginPath();
		for (var i=0; i < 4; i++){
			ctx.moveTo(x, y);  
			ctx.lineTo(x + length, y);
			y += settings.lineSpacing;
		}
		ctx.strokeStyle = settings.lineColor;
		ctx.lineWidth = settings.lineWidth;
		ctx.stroke();
		ctx.closePath();
	},
	
	/**
	 * Loop over the normalized tabs emitting the dots/fingers on the passed in canvase
	 * @method _drawNotes
	 * @private 
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param tabs {array} Array of normalized string data -- space (character) or int (fret number)
	 * @param settings {settingsObj}
	 * @return {void}
	 */
	_drawNotes: function(ctx, pos, tabs, settings){
		var c;
		var center = {
			x: 0,
			y: pos.y
		};
		for(var i in tabs){
			if (i > 3) return;
			center.x = pos.x;
			for (var j in tabs[i]){
				c = tabs[i][j];
				// (c != '-'){
				if (c == '|'){
					var jnum = parseInt(j, 10);
					var heavy = 
						(((jnum + 1) < (tabs[i].length - 1)) && (tabs[i][jnum + 1] == '|'))
						|| ((jnum == (tabs[i].length - 1)) && (tabs[i][jnum - 1] == '|'));
					this._drawMeasure(ctx, {
						x: center.x,
						y: pos.y
					}, settings, heavy);
				}
				else if (!isNaN(c)){
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
	},
	
	/**
	 * Draws a vertical "measure" demarcation line on the convas
	 * @method _drawMeasure
	 * @private 
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param settings {settingsObj}
	 * @param heavy {bool} if TRUE hevy line
	 * @return {void}
	 */
	_drawMeasure: function(ctx, pos, settings, heavy){
		var offset = settings.lineWidth / 2;
		ctx.beginPath();
		ctx.moveTo(pos.x + offset, pos.y);  
		ctx.lineTo(pos.x + offset, pos.y + 3 * settings.lineSpacing);
		ctx.strokeStyle = settings.lineColor;
		ctx.lineWidth = (heavy ? 4.5 : 1) * settings.lineWidth;
		ctx.stroke();
		ctx.closePath();
	},
	
	/**
	 * Adds the string letters on the left-side of the canvas, before the tablature string lines
	 * @method _drawLabels
	 * @private 
	 * @param ctx {canvasContext} Handle to active canvas context
	 * @param pos {xyPos} JSON (x,y) position
	 * @param settings {settingsObj}
	 * @return {void}
	 */
	_drawLabels: function(ctx, pos, settings){
		var labels = ukeGeeks.settings.tuning.slice(0).reverse();// ['A','E','C','G'];
		for (var i=0; i < 4; i++){
			ukeGeeks.canvasTools.drawText(ctx, {
				x: 1,
				y: (pos.y + (i + 0.3) * settings.lineSpacing)
			}, labels[i], settings.labelFont, settings.lineColor, 'left');
		}
	}
}
;/**
 * Finds page HTML elements & creates ukeGeek objects;
 * Reads song text, parses, draws choard diagrams.
 * 
 * @class scriptasaurus
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.scriptasaurus = new function(){
	/**
	 * Preps this class for running
	 * @method init
	 * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
	 * @return {void}
	 */
	this.init = function(isIeFamily){
		ukeGeeks.settings.environment.isIe = isIeFamily;
	};

	/**
	 * Runs all Scriptasaurus methods. This is your "Do All". See data.song for structure.
	 * @method run
	 * @param offset {int} (optional) default 0. Number of semitones to shif the tuning. See ukeGeeks.definitions.instrument.
	 * @return {songObject}
	 */
	this.run = function(offset){
		var offset = (arguments.length > 0) ? arguments[0] : ukeGeeks.definitions.instrument.sopranoUke;
		var h = document.getElementById(ukeGeeks.settings.ids.songText);
		if (!h) return null;
	
		ukeGeeks.definitions.useInstrument(offset);
		
		// read Music, find chords, generate HTML version of song:
		var cpm = new ukeGeeks.cpmParser;
		cpm.init();
		var song = cpm.parse(h.innerHTML);
		ukeGeeks.definitions.replace(song.defs);
	
		var chrdPrsr = new ukeGeeks.chordParser;
		chrdPrsr.init();
		h.innerHTML = chrdPrsr.parse(song.body);
		var chordsInUse = chrdPrsr.getChords();
	
		// Draw the Chord Diagrams:
		var painter = new ukeGeeks.chordPainter;
		painter.init();
		painter.show(ukeGeeks.settings.ids.canvas, chordsInUse);
		// Show chord diagrams inline with lyrics
		if (ukeGeeks.settings.inlineDiagrams){
			var b = document.getElementsByTagName('body')[0];
			ukeGeeks.toolsLite.addClass(b, 'ugsInlineDiagrams');
			painter.showInline(chordsInUse);
		}
	
		// Do Tablature:
		var tabs = new ukeGeeks.tabs;
		tabs.init();
		tabs.replace(h);
		
		// error reporting:
		showErrors(painter.getErrors());
		
		var container = document.getElementById(ukeGeeks.settings.ids.container);
		if (container){
			if (!song.hasChords){
				ukeGeeks.toolsLite.addClass(container, 'ugsNoChords');
			}
			else{
				ukeGeeks.toolsLite.removeClass(container, 'ugsNoChords');
			}
		}

		// done!
		return song;
	};

	/**
	 * Shows a JavaScript alert box containing list of unknown chords.
	 * @method showErrors
	 * @return {void}
	 */
	var showErrors = function(errs){
		if (errs.length > 0){
			var s = '';
			for(var i=0; i < errs.length; i++){
				s += errs[i]+(((i+1)==errs.length) ? '' : ', ');
			}
			alert('Forgive me, but I don\'t know the following chords: ' + s);
		}
	};
}
