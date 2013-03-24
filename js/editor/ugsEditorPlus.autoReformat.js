/**
 * 
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.autoReformat = new function(){
	var _this = this;
	var _elements;
	var _formatted;
	var _isDisabled = false;
	
	this.run = function(elements){
		if (_isDisabled){
			return;
		}
		_elements = elements;
		_elements.reformatTextBox = document.getElementById('reformatSource');
		_elements.reformatDlg = document.getElementById('reformatDlg');
		
		document.getElementById('reformatYesBtn').onclick = function(){ doOk(); return false; };
		document.getElementById('reformatNoBtn').onclick = function(){ doClose(); return false; };
	
		// need to reset on reload
		var chk = document.getElementById('reformatDisable');
		chk.checked = false;
		chk.onclick = function(){ doDisable(this.checked); };
		
		runNow();
	};
	
	var doOk = function(){
		_elements.cpmSource.value = _formatted;
		doClose();
		ugsEditorPlus.actions.run(true);
	};
	
	var doClose = function(){
		ukeGeeks.toolsLite.addClass(_elements.reformatDlg, 'isHidden');
	};
	
	var doDisable = function(isDisabled){
		_isDisabled = isDisabled;
	};
	
	var runNow = function(){
		_formatted = ugsEditorPlus.reformat.run(_elements.cpmSource.value);
		_elements.reformatTextBox.innerHTML = _formatted;
		
		if (!ugsEditorPlus.reformat.hasChords()){
			return;
		}
		
		ukeGeeks.toolsLite.removeClass(_elements.reformatDlg, 'isHidden');
	};
}