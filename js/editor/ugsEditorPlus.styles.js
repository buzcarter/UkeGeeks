/**
 * from: http://www.javascriptkit.com/dhtmltutors/externalcss.shtml
 * @class styles
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.styles = new function(){
	var _sheet = null;
	this.Rules = null;
	
	this.getSheet = function(title){
		_sheet = _getSheet(title);
		this.Rules = getRules();
		return this;
	};
	
	var _getSheet = function(title){
		for (var i = 0; i < document.styleSheets.length; i++){
			if (document.styleSheets[i].title == title){
				return document.styleSheets[i];
			}
		}
		return null;
	};
	
	var getRules = function(){
		if (_sheet == null){
			return [];
		}
		return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
	};
	
	this.Find = function(selector){
		selector = selector.toLowerCase();
		for (var i = 0; i < this.Rules.length; i++) {
			if (!this.Rules[i].selectorText){
				continue;
			}
			if (this.Rules[i].selectorText.toLowerCase() == selector){
				return this.Rules[i];
			}
		}
		return null;
	};
}();