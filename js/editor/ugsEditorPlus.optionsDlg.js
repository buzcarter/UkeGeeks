/**
 * Mechanics of the Optiones/Settings dialog
 * @class options
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.optionsDlg = new function(){
	// borrow the "run" method from Actions class
	var run = null;

	// DOM handles (mostly for options dialog elements only)
	var _ele = {};

	this.init = function(actionsController, elements){
		run = actionsController.run;

		_ele = {
			docBody : elements.docBody,
			inputIgnoreList : document.getElementById('commonChordList'),
			chkIgnore : document.getElementById('chkIgnoreCommon'),
			pageWidth : document.getElementById('pageWidth'),
			chkEnclosures : document.getElementById('chkEnclosures')
		};

		restoreDefaults();

		_ele.pageWidth.onchange = function(){doSetWidth(this.value); };
		_ele.chkEnclosures.onclick = function(){doSetEnclosure(!this.checked); };
		_ele.inputIgnoreList.onchange = function(){doSetCommon(); };
		_ele.chkIgnore.onclick = function(){doIgnoreChkClk(this.checked); };
	};

	var restoreDefaults = function(){
		// initialize the common list
		_ele.inputIgnoreList.value = ukeGeeks.settings.commonChords.join(", ");
		_ele.pageWidth.value = 'letter';
		_ele.chkIgnore.checked = ukeGeeks.settings.opts.ignoreCommonChords;
		_ele.chkEnclosures.checked = !ukeGeeks.settings.opts.retainBrackets;
	};

	/**
	 * (option dialog) changes body class, moving the right page edge
	 * @method doSetWidth
	 * @private
	 * @param value {string} currently selected option value
	 */
	var doSetWidth = function(value){
		var opts = ['letter', 'a4', 'screen'];
		for(var i = 0; i < opts.length; i++){
			ukeGeeks.toolsLite.removeClass(_ele.docBody, 'pageWidth_' + opts[i]);
		}
		ukeGeeks.toolsLite.addClass(_ele.docBody, 'pageWidth_' + value);
	};

	/**
	 * (option dialog) change whether to show/hide the bracket characters
	 * @method doSetEnclosure
	 * @private
	 * @param isVisible {bool}
	 */
	var doSetEnclosure = function(isVisible){
		ukeGeeks.settings.opts.retainBrackets = isVisible;
		run();
	};

	/**
	 * "Ignore Common" was checked, need to update master chord diagrams
	 * @method doIgnoreChkClk
	 * @param isIgnore {bool}
	 */
	var doIgnoreChkClk = function(isIgnore){
		ukeGeeks.settings.opts.ignoreCommonChords = isIgnore;
		run();
	};

	/**
	 * the list of common chords has been change; update UGS setting
	 * and _possible_ rerun
	 * @method doSetCommon
	 * @return {void}
	 */
	var doSetCommon = function(){
		var inputList = _ele.inputIgnoreList.value.split(/[ ,]+/);
		var chordList = [];
		for (var i = 0; i < inputList.length; i++) {
			var c = ukeGeeks.toolsLite.trim(inputList[i]);
			if (c.length > 0){
				chordList.push(c);
			}
		};

		ukeGeeks.settings.commonChords = chordList;

		if (_ele.chkIgnore.checked){
			run();
		}
	};


};
