/**
  * This library implments the editor functions, bridging the page UI and scriptasaurus methods.
  * @module  UkeGeeksScriptasaurus Editor+
  * @namespace  ugsEditorPlus
  * @class ugsEditorPlus
  */
var ugsEditorPlus = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

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

		ugsEditorPlus.actions.init(isLegacyIe);
		ugsEditorPlus.topMenus.init();
		ugsEditorPlus.submenuUi.init(ugsEditorPlus.actions.doAction);
		ugsEditorPlus.optionsDlg.init(ugsEditorPlus.actions.doAction);

		ugsEditorPlus.actions.run();
	};

	/**
	 * wraps the private Init method for modern browsers
	 * @method attach
	 * @public
	 */
	_public.attach = function(){
		init(false);
	};

	/**
	 * wraps the private Init method, required for Legacy Internet Exploere (pre-9)
	 * @method attach
	 * @public
	 */
	_public.attachIe = function(){
		init(true);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
