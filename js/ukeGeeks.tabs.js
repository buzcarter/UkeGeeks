/**
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
	 * Removes all white space at the begining and end of a string.
	 * @method trim
	 * @param str {String} String to trim.
	 * @return {String} Returns string without leading and following white space characters.
	 */
	trim: function(str){
		return str.replace(/^\s+|\s+$/g, '');
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
			var s = this.trim(lns[i]);
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
		if (inTabs.length < 4) return;
		// read tabs
		var tabInfo = this._readTabs(inTabs);
		var labelOffset = (tabInfo.hasLabels)? ukeGeeks.settings.tabs.labelWidth: 0;
		var tabs = tabInfo.tabs;
		// how much space?
		var length = (ukeGeeks.settings.tabs.noteSpacing * tabs[0].length + labelOffset) + (ukeGeeks.settings.tabs.dotRadius) ;
		var height = (3 * ukeGeeks.settings.tabs.lineSpacing) + (2 * ukeGeeks.settings.tabs.dotRadius) + ukeGeeks.settings.tabs.bottomPadding;
		// prep canvas
		outElement = (typeof(outElement) == 'string') ? document.getElementById(outElement) : outElement;
		var ctx = ukeGeeks.canvasTools.addCanvas(outElement, length, height);
		var pos = {
			x: ukeGeeks.settings.tabs.dotRadius + labelOffset,
			y: 1 + ukeGeeks.settings.tabs.dotRadius
			};
		this._drawStaff(ctx, pos, length, ukeGeeks.settings.tabs);
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
					this._drawMeasure(ctx, {
						x: center.x,
						y: pos.y
						}, settings);
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
	 * @return {void}
	 */
	_drawMeasure: function(ctx, pos, settings){
		var offset = settings.lineWidth / 2;
		ctx.beginPath();
		ctx.moveTo(pos.x + offset, pos.y);  
		ctx.lineTo(pos.x + offset, pos.y + 3 * settings.lineSpacing);
		ctx.strokeStyle = settings.lineColor;
		ctx.lineWidth = settings.lineWidth;
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
		var labels = ukeGeeks.settings.tuning.reverse();// ['A','E','C','G'];
		for (var i=0; i < 4; i++){
			ukeGeeks.canvasTools.drawText(ctx, {
				x: 1,
				y: (pos.y + (i + 0.3) * settings.lineSpacing)
				}, labels[i], settings.labelFont, settings.lineColor, 'left');
		}
	}
}