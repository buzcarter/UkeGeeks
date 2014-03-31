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

	// DOM handles (mostly for options dialog elements only)
	var _ele = {};

	/**
	 * Sets up this class by attaching event handlers to form elements;
	 * @method init
	 * @public
	 */
	_public.init = function() {
		_ele = {
			inputIgnoreList : document.getElementById('commonChordList'),
			chkIgnore : document.getElementById('chkIgnoreCommon'),
			//pageWidth : document.getElementById('pageWidth'),
			chkEnclosures : document.getElementById('chkEnclosures')
		};

		restoreDefaults();

		// button clicks
		document.getElementById('updateBtn').onclick = function() {
			triggerNotify('update', '');
			return false;
		};

		//_ele.pageWidth.onchange = function(){doSetWidth(this.value); };

		// Change whether to show/hide the bracket characters
		_ele.chkEnclosures.onclick = function() {
			// Boolean "isVisible"
			triggerNotify('showEnclosures', !this.checked);
		};

		// the list of common chords has been change; update UGS setting and _possibly_ rerun
		_ele.inputIgnoreList.onchange = function() {
			triggerNotify('setCommonChords', _ele.inputIgnoreList.value);
		};

		// "Ignore Common" was checked, need to update master chord diagrams
		_ele.chkIgnore.onclick = function() {
			// Boolean for "isIgnore"
			triggerNotify('hideCommonChords', this.checked);
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

	var triggerNotify = function(action, value) {
		$.event.trigger('option:click', {
			action: action,
			value: value
		});
	};

	var restoreDefaults = function(){
		// initialize the common list
		_ele.inputIgnoreList.value = ukeGeeks.settings.commonChords.join(", ");
		//_ele.pageWidth.value = 'letter';
		_ele.chkIgnore.checked = ukeGeeks.settings.opts.ignoreCommonChords;
		_ele.chkEnclosures.checked = !ukeGeeks.settings.opts.retainBrackets;
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());