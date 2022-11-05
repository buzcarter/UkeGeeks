/**
 * from: http://www.javascriptkit.com/dhtmltutors/externalcss.shtml
 * @class styles
 * @namespace ugsEditorPlus
 * @singleton
 */
fdRequire.define('ugsEditorPlus/styles', (require, module) => {
  let Rules = null;

  let _sheet = null;

  function getSheet(title) {
    _sheet = _getSheet(title);
    Rules = _getRules();
    return this;
  }

  function _getSheet(title) {
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].title == title) {
        return document.styleSheets[i];
      }
    }
    return null;
  }

  function _getRules() {
    if (_sheet == null) {
      return [];
    }
    return _sheet.cssRules ? _sheet.cssRules : _sheet.rules;
  }

  function find(selector) {
    selector = selector.toLowerCase();
    for (let i = 0; i < Rules.length; i++) {
      if (!Rules[i].selectorText) {
        continue;
      }
      if (Rules[i].selectorText.toLowerCase() == selector) {
        return Rules[i];
      }
    }
    return null;
  }

  module.exports = {
    find,
    getSheet,
  };
});
