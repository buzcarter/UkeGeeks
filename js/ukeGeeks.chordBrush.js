/**
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