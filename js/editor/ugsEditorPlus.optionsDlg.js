/**
 * UI mechanics of the Other Options dialog
 * @class options
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * borrow the "doAction" method from Actions class
	 * @property _doAction
	 * @type {function}
	 */
	var _doAction = null;

	// DOM handles (mostly for options dialog elements only)
	var _ele = {};

	/**
	 * Sets up this class by attaching event handlers to form elements;
	 * @method init
	 * @public
	 * @param doAction {function} handle to method to actually DO the job
	 */
	_public.init = function(doAction){
		_doAction = doAction;

		_ele = {
			inputIgnoreList : document.getElementById('commonChordList'),
			chkIgnore : document.getElementById('chkIgnoreCommon'),
			//pageWidth : document.getElementById('pageWidth'),
			chkEnclosures : document.getElementById('chkEnclosures')
		};

		restoreDefaults();

		// button clicks
		document.getElementById('updateBtn').onclick = function() {
			onUpdateBtnClick();
			return false;
		};

		//_ele.pageWidth.onchange = function(){doSetWidth(this.value); };
		_ele.chkEnclosures.onclick = function() {
			onSetEnclosureClick(!this.checked);
		};
		_ele.inputIgnoreList.onchange = function() {
			onCommonChordFieldChange();
		};
		_ele.chkIgnore.onclick = function() {
			onIgnoreCommonClick(this.checked);
		};

		// ugh! Event bubbling!
		$('.checkboxBlock label, input[type=checkbox]').click(function(e) {
			e.stopPropagation();
		});
		//$('#helpDlg a').click(function(e){console.log('anchor click');});

		$('.overlay').draggable({
			handle: 'hgroup'
			//containParent: true
    });
	};

	var restoreDefaults = function(){
		// initialize the common list
		_ele.inputIgnoreList.value = ukeGeeks.settings.commonChords.join(", ");
		//_ele.pageWidth.value = 'letter';
		_ele.chkIgnore.checked = ukeGeeks.settings.opts.ignoreCommonChords;
		_ele.chkEnclosures.checked = !ukeGeeks.settings.opts.retainBrackets;
	};

	var onUpdateBtnClick = function(){
		_doAction( 'update', null);
	};

	/**
	 * (option dialog) change whether to show/hide the bracket characters
	 * @method onSetEnclosureClick
	 * @private
	 * @param isVisible {bool}
	 */
	var onSetEnclosureClick = function(isVisible){
		_doAction( 'showEnclosures', isVisible);
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method onIgnoreCommonClick
	 * @private
	 * @param isIgnore {bool}
	 */
	var onIgnoreCommonClick = function(isIgnore){
		_doAction( 'hideCommonChords', isIgnore);
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * and _possible_ rerun
	 * @method onCommonChordFieldChange
	 * @private
	 * @return {void}
	 */
	var onCommonChordFieldChange = function(){
		_doAction( 'setCommonChords', _ele.inputIgnoreList.value);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());