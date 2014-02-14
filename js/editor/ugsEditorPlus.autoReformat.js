/**
 *
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.autoReformat = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
	 * @property _ele
	 * @type {JSON}
	 */
	var _ele = {};

	var _formatted;
	var _isDisabled = false;

	_public.run = function(elements){
		if (_isDisabled){
			return;
		}
		_ele = elements;
		_ele.reformatTextBox = document.getElementById('reformatSource');
		_ele.reformatDlg = document.getElementById('reformatDlg');

		document.getElementById('reformatYesBtn').onclick = function() {
			doOk();
			return false;
		};
		document.getElementById('reformatNoBtn').onclick = function() {
			doClose();
			return false;
		};

		// need to reset on reload
		var chk = document.getElementById('reformatDisable');
		chk.checked = false;
		chk.onclick = function() {
			doDisable(this.checked);
		};

		runNow();
	};

	var doOk = function(){
		_ele.cpmSource.value = _formatted;
		doClose();
		ugsEditorPlus.actions.run(true);
	};

	var doClose = function(){
		ukeGeeks.toolsLite.addClass(_ele.reformatDlg, 'isHidden');
	};

	var doDisable = function(isDisabled){
		_isDisabled = isDisabled;
	};

	var runNow = function(){
		_formatted = ugsEditorPlus.reformat.run(_ele.cpmSource.value);
		_ele.reformatTextBox.innerHTML = _formatted;

		if (!ugsEditorPlus.reformat.hasChords()){
			return;
		}

		ukeGeeks.toolsLite.removeClass(_ele.reformatDlg, 'isHidden');
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());