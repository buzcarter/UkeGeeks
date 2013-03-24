/**
  * This library implments the editor functions, bridging the page UI and scriptasaurus methods.
  * @module  UkeGeeksScriptasaurus Editor+
  * @namespace  ugsEditorPlus
  * @class ugsEditorPlus
  */
var ugsEditorPlus = new function(){
	/**
	 * attaches event handlers, preps variables, and runs UGS
	 * @method init
	 * @private
	 * @param isLegacyIe {bool} pre-IE 9 versions
	 */
	var init = function(isLegacyIe){
		// ukeGeeks.tumblr.opts.diagramResizeTo = 1;
		ukeGeeks.settings.opts.retainBrackets = false;

		ukeGeeks.scriptasaurus.init(isLegacyIe);

		ugsEditorPlus.menus.init();
		ugsEditorPlus.actions.init(isLegacyIe);
		ugsEditorPlus.actions.run();
	};

	/**
	 * wraps the private Init method for modern browsers
	 * @method attach
	 * @public
	 */
	this.attach = function(){
		init(false);
	};

	/**
	 * wraps the private Init method, required for Legacy Internet Exploere (pre-9)
	 * @method attach
	 * @public
	 */
	this.attachIe = function(){
		init(true);
	};

};
