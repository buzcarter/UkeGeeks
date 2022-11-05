fdRequire.define('ugsEditorPlus/typeahead', (require, module) => {
  const $ = require('jQuery');

  /**
 * Search on the song list page for songs.
 * Dependencies: jQuery and Twitter Bootstrap's typeahead plugin
 * Based on tutorial:
 * http://tatiyants.com/how-to-use-json-objects-with-twitter-bootstrap-typeahead/
 * @class typeahead
 * @constructor
 * @namespace ugsEditorPlus
 */

  // private
  // ---------------------------
  const _keysList = [];
  const _keysToDetailsDict = {};

  let _scrubbedQuery = '';
  let _regex;
  let _words = [];

  const _re = {
    space: /\s{2,}/g,
    // everything except for alphanumeric gets nuked
    common: /([^a-z0-9]+)/gi,
    // treat quotes as invisible
    noise: /['`’-]/g,
  };

  /**
   * Scrapes HTML to build our list of
   * keys, searchable text, and display text
   * @method listFromHtml
   */
  function listFromHtml() {
    $('li').each(function () {
      const $this = $(this);
      const plainText = crushText($this.text());
      const href = $this.children('a').attr('href');
      const key = href.toLowerCase();

      let html = $this.children('a').html();
      html = html.replace('<strong class="', '<span class="bigger ').replace('</strong>', '</span>');

      _keysToDetailsDict[key] = {
        // content displayed in drop down list
        html,
        // what we'll match against
        searchText: plainText,
        // unique key/id
        code: key,
        // when a selection is made this is the location we'll launch
        href,
      };
      _keysList.push(key);
    });
  }

  function crushText(value) {
    return value
      .toLowerCase()
      .replace(_re.noise, '')
      .replace(_re.common, ' ')
      .replace(_re.space, ' ')
      .trim();
  }

  function taSource(query, process) {
    _scrubbedQuery = crushText(query);
    _words = _scrubbedQuery.split(' ');
    let regGroup = '';
    for (let i = 0; i < _words.length; i++) {
      _words[i] = _words[i].trim();
      if (_words[i].length > 0) {
        regGroup += (regGroup.length > 0 ? '|' : '') + _words[i];
      }
    }
    _regex = new RegExp(`(${regGroup})`, 'gi');
    process(_keysList);
  }

  function taUpdater(item) {
    window.location = _keysToDetailsDict[item].href;
    return _keysToDetailsDict[item].searchText;
  }

  function taMatcher(item) {
    const detailed = _keysToDetailsDict[item];
    for (let i = 0; i < _words.length; i++) {
      if (detailed.searchText.indexOf(_words[i]) == -1) {
        return false;
      }
    }
    return true;
  }

  function taSorter(items) {
    return items.sort((a, b) => (_keysToDetailsDict[a].searchText > _keysToDetailsDict[b].searchText));
  }

  function taHighligher(item) {
    const $temp = $('<div/>').html(_keysToDetailsDict[item].html);

    $('em, .bigger', $temp).each(function () {
      const $ele = $(this);
      const text = $ele.html();
      $ele.html(text.replace(_regex, '<strong>$1</strong>'));
    });
    return $temp.html();
  }

  function initialize() {
    listFromHtml();

    $('#quickSearch')
      .typeahead({
        source: taSource,
        updater: taUpdater,
        matcher: taMatcher,
        sorter: taSorter,
        highlighter: taHighligher,
        minLength: 2,
        items: 50,
      })
      .val('')
      .focus();
  }

  module.exports = {
    initialize,
  };
});
