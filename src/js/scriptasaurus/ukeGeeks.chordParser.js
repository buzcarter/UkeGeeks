fdRequire.define('ukeGeeks/chordParser', (require, module) => {
/**
 * Reads an HTML (text) block looking for chords in format: [Emaj7]
 * Returns the HTML block with wrapped chords: &lt;code&gt;&lt;strong&gt;&lt;em&gt;
 * @class chordParser
 * @namespace ukeGeeks
 */

  let underscoreChords = [];

  /// //////////////////////////////////////////////////////////////////////////
  //
  // PUBLIC methods
  //
  /// //////////////////////////////////////////////////////////////////////////
  /**
   * Again this is a constructor replacement. Just here for consistency. Does nothing.
   * @method init
   * @return {void}
   */
  function init() {}

  /**
   * This does all of the work -- it's a Wrapper method that calls all of this classes other
   * (private) methods in correct order.
   * @method parse
   * @param text {string} CPM Text Block to be parsed
   * @return {string}
   */
  function parse(text) {
    underscoreChords = findChords(text);
    text = encloseChords(text, underscoreChords);
    text = packChords(text);
    return text;
  }

  /**
   * Getter method for _chords
   * @method getChords
   * @return {Array-chords}
   */
  function getChords() {
    return underscoreChords;
  }

  /// //////////////////////////////////////////////////////////////////////////
  //
  // PRIVATE methods
  //
  /// //////////////////////////////////////////////////////////////////////////
  /**
   * Returns an array of all of the unique bracket chord names. So even if [D7] appears a
   * dozen times you'll only see it once in this list.
   * @method _findChords
   * @private
   * @param text {string} CPM Text Block to be parsed
   * @return {StringArray}
   */
  function findChords(text) {
    let i;
    let j;
    const re = /\[(.+?)]/img;
    const m = text.match(re);
    if (!m) {
      return [];
    }

    // why not use associative array?
    const chords = [];
    let found;
    for (i = 0; i < m.length; i++) {
      found = false;
      for (j = 0; j < chords.length; j++) {
        if (chords[j] == m[i]) {
          found = true;
          break;
        }
      }
      if (!found) {
        chords.push(m[i]);
      }
    }
    // clean 'em
    for (j in chords) {
      chords[j] = chords[j].replace('[', '').replace(']', '');
    }
    // done
    return chords;
  }

  /**
   * Returns the input string having replaced all of the "bracketed chord names" (i.e. [D7]) with HTML
   * marked-up version (i.e. &lt;code&gt;&lt;strong&gt;[&lt;em&gt;D7&lt;/em&gt;]&lt;/strong&gt;&lt;/code&gt;)
   * @method _encloseChords
   * @private
   * @param text {string}
   * @param chords {StringArray}
   * @return {string}
   */
  function encloseChords(text, chords) {
    const openBracket = ukeGeeks.settings.opts.retainBrackets ? '[' : ' ';
    const closeBracket = ukeGeeks.settings.opts.retainBrackets ? ']' : ' ';
    for (const i in chords) {
      do {}
      while (text.length != (text = text.replace(
        `[${chords[i]}]`,
        `<code data-chordName="${chords[i]}"><strong>${openBracket}<em>${chords[i]}</em>${closeBracket}</strong></code>`)).length);
    }
    return text;
    /*
    // need to handle chords such as: [A7+5]
    var escapeRegEx = new RegExp('([+])','g');
    for (var j = 0; j < this.chords.length; j++){
      var s = this.chords[j].replace(escapeRegEx, '\\\$1')
      var re = new RegExp('[[]' + s + ']', 'img');
      text = text.replace(re, '<code data-chordName="' + this.chords[j] + '"><strong>[<em>' + this.chords[j] + '</em>]</strong></code>');
    }
    */
  }

  /**
   * Looks for consecutive chords and strips the whitespace between them -- thus "packing" the
   * chords against each other with only a single space separating them.
   * @method _packChords
   * @private
   * @param text {string}
   * @return {string}
   */
  function packChords(text) {
    let re;

    if (ukeGeeks.settings.inlineDiagrams) {
      /* TODO: problem with packing */
      re = /(<\/strong><\/code>)[ \t]*(<code data-chordName="[^"]*"><strong>)/ig;
      return text.replace(re, '$1<span class="ugsInlineSpacer">&nbsp;</span>$2');
    }

    re = /<\/strong><\/code>[ \t]*<code data-chordName="[^"]*"><strong>/ig;
    return text.replace(re, ' ');
  }

  module.exports = {
    init,
    parse,
    getChords,
  };
});
