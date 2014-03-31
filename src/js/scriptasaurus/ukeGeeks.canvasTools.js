/**
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

	return _public;
}());