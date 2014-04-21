/**
 * Exposes the only method required to attach UkeGeeks Scriptasaurus Song-a-matic editor functionality.
 *
 * @class songAmatic
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.songAmatic = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * attaches event handlers, preps variables, and runs UGS
	 * @method init
	 * @param options {OBJECT} (optional) Object/JSON with any of the ugsEditorPlus.options
	 * @return {void}
	 */
	_public.init = function(options) {
		var opts = mergeOptions(options);

		ukeGeeks.settings.opts.retainBrackets = !opts.hideChordEnclosures;
		$('#songSourceDlg').toggle(opts.showEditOnLoad);

		ukeGeeks.scriptasaurus.init(opts.useLegacyIe);

		ugsEditorPlus.actions.init();
		ugsEditorPlus.topMenus.init();
		ugsEditorPlus.submenuUi.init();
		ugsEditorPlus.optionsDlg.init();
		ugsEditorPlus.chordBuilder.init();
		ugsEditorPlus.actions.run();
	};

	var mergeOptions = function(options) {
		var opts = {
			hideChordEnclosures: !ukeGeeks.settings.opts.retainBrackets,
			sortAlphabetical: ukeGeeks.settings.opts.sortAlphabetical,
			ignoreCommonChords: ukeGeeks.settings.opts.ignoreCommonChords,
			commonChords: ukeGeeks.settings.commonChords
		};

		return $.extend(ugsEditorPlus.options, opts, (typeof options === "object") ? options : {});
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());