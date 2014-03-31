/**
 * from: http://www.javascriptkit.com/dhtmltutors/externalcss.shtml
 * @class styles
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.styles = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {
		Rules: null
	};

	var _sheet = null;
	
	_public.getSheet = function(title) {
		_sheet = _getSheet(title);
		_public.Rules = _getRules();
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
	
	var _getRules = function() {
		if (_sheet == null){
			return [];
		}
		return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
	};
	
	_public.find = function(selector) {
		selector = selector.toLowerCase();
		for (var i = 0; i < _public.Rules.length; i++) {
			if (!_public.Rules[i].selectorText) {
				continue;
			}
			if (_public.Rules[i].selectorText.toLowerCase() == selector) {
				return _public.Rules[i];
			}
		}
		return null;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());