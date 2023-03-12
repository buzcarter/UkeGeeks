fdRequire.define('scriptasaurus/ukeGeeks.toolsLite', (require, module) => {
  const regEx = {
    dbleSpace: /\s{2,}/g,
  };

  function pack(value) {
    return value.replace(regEx.dbleSpace, ' ').trim();
  }

  /**
   * Searches within Node for tags with specified CSS class.
   * @param searchClass {string}  CSS Classname
   * @param node {HtmlNode} parent node to begin search within. Defaults to entire document.
   * @param tag {string} restrict search to a specific tag name. defaults to all tags.
   * @return {arrayDomElements}
   * @deprecated
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

  /**
 * @module
 * some jQuery-like tools (very, very crappy. wish we could count on jQuery being on the page.)
 * if you do want to use jQuery (and why wouldn't you) I'm not offended if you yank this out.
 */
  module.exports = {
    getElementsByClass,
    pack,
  };
});
