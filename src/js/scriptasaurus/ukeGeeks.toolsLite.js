fdRequire.define('ukeGeeks/toolsLite', (require, module) => {
/**
 * some jQuery-like tools (very, very crappy. wish we could count on jQuery being on the page.)
 * if you do want to use jQuery (and why wouldn't you) I'm not offended if you yank this out.
 * @class toolsLite
 * @namespace ukeGeeks
 * @singleton
 */

  const regEx = {
    dbleSpace: /\s{2,}/g,
    trim: /^\s+|\s+$/g,
  };

  /**
   * adds className to element.
   * @method addClass
   * @param element {DOM_element} target element
   * @param className {string} CSS classname to add
   * @return {void}
   */
  function addClass(element, className) {
    if (!hasClass(element, className)) {
      element.className += ` ${className}`;
    }
  }

  function hasClass(element, className) {
    return element.className.match(getRegEx(className));
  }

  function removeClass(element, className) {
    if (hasClass(element, className)) {
      const reg = getRegEx(className);
      element.className = element.className.replace(reg, ' ');
    }
  }

  function setClass(element, className, isActive) {
    if (isActive) {
      addClass(element, className);
    } else {
      removeClass(element, className);
    }
  }

  function getRegEx(className) {
    return new RegExp(`(\\s|^)${className}(\\s|$)`);
  }

  /**
   * Removes all white space at the begining and end of a string.
   * @method trim
   * @param str {String} String to trim.
   * @return {String} Returns string without leading and following white space characters.
   */
  function trim(str) {
    return str.replace(regEx.trim, '');
  }

  function pack(value) {
    return value.replace(regEx.dbleSpace, ' ').replace(regEx.trim, '');
  }

  /**
   * Searches within Node for tags with specified CSS class.
   * @method getElementsByClass
   * @param searchClass {string}  CSS Classname
   * @param node {HtmlNode} parent node to begin search within. Defaults to entire document.
   * @param tag {string} restrict search to a specific tag name. defaults to all tags.
   * @return {arrayDomElements}
   */
  function getElementsByClass(searchClass, node, tag) {
    let i;
    let j;
    // use falsey -- if ((node === null) || (node === undefined)) {
    if (!node) {
      node = document;
    }
    if (node.getElementsByClassName) {
      return node.getElementsByClassName(searchClass);
    }

    const classElements = [];
    if (!tag) {
      tag = '*';
    }
    const els = node.getElementsByTagName(tag);
    const elsLen = els.length;
    const pattern = new RegExp(`(^|\\s)${searchClass}(\\s|$)`);
    for (i = 0, j = 0; i < elsLen; i++) {
      if (pattern.test(els[i].className)) {
        classElements[j] = els[i];
        j++;
      }
    }
    return classElements;
  }

  module.exports = {
    addClass,
    getElementsByClass,
    hasClass,
    pack,
    removeClass,
    setClass,
    trim,
  };
});
