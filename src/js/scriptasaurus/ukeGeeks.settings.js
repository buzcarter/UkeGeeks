/**
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
			x:22,
			y:25
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
			y:2
		},
		xWidth: 0.7 * 7,
		xStroke: 1.4 * 1,
		fonts : {
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
		ignoreCommonChords : false,
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
		autoFixOverlaps : true
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
	_public.environment = {
		/**
		 * set in scriptasaurus. True if UserAgent is Internet Explorer
		 * @property environment.isIe
		 * @type bool
		 */
		isIe : false
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
	var _scaleNode = function(node, mulitplier){
		if (typeof(node) == 'number'){
			return node * mulitplier;
		}
		else if (typeof(node) == 'object'){
			for(var i in node){
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
	var _scaleFont = function(font, mulitplier){
		var bits = font.match(_sizeRe);
		if (bits.length < 2){
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
		if (mulitplier == 1.0){
			return;
		}

		for(var i in this.fonts){
			this.fonts[i] = _scaleFont(this.fonts[i], mulitplier);
		}

		// Note getting x/y scaled.
		this.fretBox = _scaleNode(this.fretBox, mulitplier);
	};

	/* return our public interface
	 */
	return _public;
}());