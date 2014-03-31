/**
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
		for (var i in tabBlocks){
			if (tabBlocks[i].className == 'ugsTabs'){
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
			if (s.length > 0){
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
		if (tabInfo.hasLabels){
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
		if (hasLabels){
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
		if (!isTruncate){
			return (tab_settings.noteSpacing * tabs[0].length) + labelOffset + tab_settings.dotRadius;
		}
		
		var len = tabs[0].length;
		var plusDot = tab_settings.dotRadius;
		if (tabs[0][len - 1] == '|'){
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
			symbols[i] = ukeStrings[i].replace(reDoubles,'-*');
			symbols[i] = symbols[i].replace(reSingle,'*');
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
		for(var i=0; i < minLength; i++){
			if (symbols[0][i] == '|'){
				guide += '|';
			}
			else{
				// TODO: assumes 4 strings, use NUM_STRINGS
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
					else{
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
				if (c == '|'){
					var jnum = parseInt(chrIdx, 10);
					var heavy = (((jnum + 1) < (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum + 1] == '|')) || ((jnum == (tabs[strIdx].length - 1)) && (tabs[strIdx][jnum - 1] == '|'));
					drawMeasure(ctx, {
						x: (chrIdx == tabs[strIdx].length - 1) ? pos.x + lineWidth : center.x,
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
