/**
 * Resizes an overlay to fill the window (this is a 1.0, so "fill" is relative -- it gets much bigger)
 * @class resize
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.resize = (function(){
	var _public = {};

	/**
	 * the "Safe" position and dimensions to avoid going over the top menu
	 * @type {JSON}
	 */
	var safe = {
		top: 45,
		edge: 10,
		width: 450
	};

	var $w, $dlg;

	/**
	 * Hold the current state of the dialog, we'll store this on the element in "data-sized" attribute
	 * @type {Boolean}
	 */
	var isBig = false;

	/**
	 * Returns a snapshot of current positions and dimensions
	 * @method measure
	 * @private
	 * @return {JSON}
	 */
	var measure = function(){
		return {
			width: $w.width(),
			height: $w.height(),
			position: $dlg.position()
		};
	};

	/**
	 * Initializer: preps handles and sets state varables.
	 * @method setup
	 * @private
	 * @return {void}
	 */
	var setup = function(dlgElement){
		$w = $(window);
		$dlg = $(dlgElement);
		isBig = $dlg.data('sized') == true;
		$dlg.data('sized', isBig);
		// console.log($dlg.data('initialPos'));
	}

	/**
	 * Expands overlay to fill (reasonably) available area
	 * @method max
	 * @private
	 * @return {void}
	 */
	var max = function(){
		var info = measure();
		$dlg
			.css({left: info.position.left + "px"})
			.animate({left: safe.edge, right: safe.edge, top: safe.top, width: (info.width - 30)}, 800);
	};

	/**
	 * Restores overlay to original position(-ish -- not finished)
	 * @method reset
	 * @private
	 * @return {void}
	 */
	var reset = function(){
		//measure();
		$dlg.css({'left': 'auto'}).animate({right: safe.edge, width: safe.width}, 800);
	};

	/**
	 * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
	 * @method toggle
	 * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
	 * @return {void}
	 */
	_public.toggle = function(dlgElement){
		setup(dlgElement);
		if (isBig){
			reset();
		}
		else{
			max();
		}
		$dlg.data('sized', !isBig);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
