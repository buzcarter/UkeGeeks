/**
 * some jQuery-like tools (very, very crappy. wish we could count on jQuery being on the page.)
 * if you do want to use jQuery (and why wouldn't you) I'm not offended if you yank this out.
 * @class toolsLite
 * @namespace ukeGeeks
 * @singleton
 */
ukeGeeks.toolsLite = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	var regEx = {
		dbleSpace: /\s{2,}/g,
		trim: /^\s+|\s+$/g
	};
	
	/**
	 * adds className to element. 
	 * @method addClass
	 * @param element {DOM_element} target element
	 * @param className {string} CSS classname to add
	 * @return {void}
	 */
	_public.addClass = function(element, className) {
		if (!_public.hasClass(element, className)) {
			element.className += ' ' + className; 
		}
	};
	
	_public.hasClass = function(element, className) {
		return element.className.match(getRegEx(className));
	};

	_public.removeClass = function(element, className) {
		if (_public.hasClass(element, className)) {
			var reg = getRegEx(className);
			element.className=element.className.replace(reg,' ');
		}
	};
	
	_public.setClass = function(element, className, isActive) {
		if (isActive){
			_public.addClass(element, className);
		}
		else{
			_public.removeClass(element, className);
		}
	};

	var getRegEx = function(className){
		return new RegExp('(\\s|^)'+className+'(\\s|$)');
	};
	
	/**
	 * Removes all white space at the begining and end of a string.
	 * @method trim
	 * @param str {String} String to trim.
	 * @return {String} Returns string without leading and following white space characters.
	 */
	_public.trim = function(str) {
		return str.replace(regEx.trim, '');
	};
	
	_public.pack = function(value) {
		return value.replace(regEx.dbleSpace, ' ').replace(regEx.trim, '');
	};
	
	/**
	 * Searches within Node for tags with specified CSS class.
	 * @method getElementsByClass
	 * @param searchClass {string}  CSS Classname
	 * @param node {HtmlNode} parent node to begin search within. Defaults to entire document.
	 * @param tag {string} restrict search to a specific tag name. defaults to all tags.
	 * @return {arrayDomElements}
	 */
	_public.getElementsByClass = function(searchClass, node, tag) {
		var i, j;
		// use falsey -- if ((node === null) || (node === undefined)) {
		if (!node) {
			node = document;
		}
		if (node.getElementsByClassName){
			return node.getElementsByClassName(searchClass);
		}

		var classElements = [];
		if (!tag) {
			tag = '*';
		}
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if (pattern.test(els[i].className)) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	};

	return _public;

}());