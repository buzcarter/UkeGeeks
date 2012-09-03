/**
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
		canvas: 'ukeChordsCanvas' // canvas 
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