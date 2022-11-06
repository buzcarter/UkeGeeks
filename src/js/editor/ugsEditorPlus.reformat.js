const ugsEditorPlus = window.ugsEditorPlus || {};

/**
 * TK
 * @class reformat
 * @namespace ugsEditorPlus
 * @singleton
 */
fdRequire.define('ugsEditorPlus/reformat', (require, module) => {
  let _hasChords = false;

  /**
   *
   * @property _enums
   * @private
   */
  const _enums = {
    lineTypes: {
      blank: 0,
      chords: 1,
      lyrics: 2,
      tabs: 3,
    },
  };

  /**
   * Line Object Class Definition (sets defaults)
   * @class reformat.LineObj
   * @private
   * @constructor
   * @for reformat
   */
  function LineObj() {
    this.source = '';
    this.wordCount = 0;
    this.spaceCount = 0;
    this.words = [];
    this.chordCount = 0;
    this.lineType = _enums.lineTypes.blank;
  }

  const _re = {
    words: /\b(\S+)\b/gi,
    spaces: /(\s+)/g,
    leadingSpace: /(^\s+)/,
    chordNames: /\b[A-G][#b]?(m|m6|m7|m9|dim|dim7|maj7|sus2|sus4|aug|6|7|9|add9|7sus4)?\b/,
    chrdBlock: /\b(\S+\s*)/g,
    tabs: /^\s*(\|{0,2}[A-Gb]?\|{0,2}[-x0-9|:]{4,})/,
  };

  // Hal Leonard Uke Chord Finder:
  // + aug
  // o dim
  // -----------------
  // F Fm F+ Fdim
  // F5 Fadd9 Fm(add9) Fsus4
  // Fsus2 F6 Fm6 Fmaj7
  // Fmaj9 Fm7 Fm(maj7) Fm7b5
  // Fm9 Fm11 F7 Fsus4
  // F+7 F7b5 F9 F7#9
  // F7b9 F11 F13 Fdim7

  /**
   * Accepts a text block, returns "ChordPro" text block with chord lines merged into lyric lines with chords enclosed in square-brackets (i.e. [Cdim])
   * @method run
   * @public
   * @param text {string} songstring
   * @return {string} ChordPro format text block
   * @for reformat
   */
  function run(text) {
    _hasChords = false;
    const lines = read(text);
    return merge(lines);
  }

  /**
   * TRUE if one or more chord lines detected
   * @method hasChords
   * @return {bool}
   */
  function hasChords() {
    return _hasChords;
  }

  /**
   * Accepts a text block
   * @method read
   * @param text {string} string RAW song
   * @return {array of Lines}
   */
  function read(text) {
    const lineAry = [];
    text = text.replace('  ', '    ');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const words = lines[i].match(_re.words);
      const l = new LineObj();
      l.source = lines[i];
      if ((words != null) && (words.length > 0)) {
        l.wordCount = words.length;
        l.words = words;
        l.chordCount = countChords(words);
      }
      const spaces = lines[i].match(_re.spaces);
      if ((spaces != null) && (spaces.length > 0)) {
        l.spaceCount = spaces.length;
      }
      l.lineType = toLineType(l);
      lineAry.push(l);
    }
    return lineAry;
  }

  /**
   * Guesses as to the line's tyupe --
   * @method toLineType
   * @param line {line}
   * @return {_enums.lineTypes}
   */
  function toLineType(line) {
    if ((line.spaceCount + line.wordCount) < 1) {
      return _enums.lineTypes.blank;
    }

    const tabs = line.source.match(_re.tabs);
    if (tabs != null) {
      return _enums.lineTypes.tabs;
    }

    let t = _enums.lineTypes.lyrics;
    if ((line.chordCount > 0) && (line.wordCount == line.chordCount)) {
      t = _enums.lineTypes.chords;
      _hasChords = true;
    }

    return t;
  }

  /**
   * Looks for supported chords.
   * @method countChords
   * @param words {array of words}
   * @return [int] number found
   */
  function countChords(words) {
    let count = 0;
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(_re.chordNames)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Return merged song -- chords embedded within lyrics
   * @method merge
   * @param lines {array of Lines}
   * @return [string]
   */
  function merge(lines) {
    let s = '';
    let thisLine;
    let nextLine;
    for (let i = 0; i < lines.length;) {
      thisLine = lines[i];
      nextLine = lines[i + 1];
      i++;
      // If this line's blank or its the last line...
      if (!nextLine || (thisLine.lineType == _enums.lineTypes.blank)) {
        s += `${thisLine.source}\n`;
        continue;
      }

      // OK, we've complicated things a bit by adding tabs, so we'll handle this in a helper...
      if ((thisLine.lineType == _enums.lineTypes.tabs) && isTabBlock(lines, i)) {
        s += `{start_of_tab}\n${thisLine.source.replace(_re.leadingSpace, '')}\n${nextLine.source.replace(_re.leadingSpace, '')}\n${lines[i + 1].source.replace(_re.leadingSpace, '')}\n${lines[i + 2].source.replace(_re.leadingSpace, '')}\n` + '{end_of_tab}\n';
        i += 3;
        continue;
      }

      // finally, look for a "mergable" pair: this line is chords and the next is lyrics -- if not this we'll just output the current line
      if ((thisLine.lineType != _enums.lineTypes.chords) || (nextLine.lineType != _enums.lineTypes.lyrics)) {
        s += (thisLine.lineType == _enums.lineTypes.chords) ? `${wrapChords(thisLine.source)}\n` : `${thisLine.source}\n`;
        continue;
      }

      // OK, if you're here it's because the current line is chords and the next lyrics, meaning, we're gonna merge them!
      i++;
      s += `${mergeLines(thisLine.source, nextLine.source)}\n`;
    }
    return s;
  }

  /**
   * TRUE if we can make a Tab block using this and the following 3 linrd (we need a set of four tab lines followed by a non-tab line)
   * @method isTabBlock
   * @param lines {array of Lines}
   * @param index {int} current line's index within line array
   * @return [bool]
   */
  function isTabBlock(lines, index) {
    if (index + 3 >= lines.length) {
      return false;
    }
    for (let i = index; i < index + 3; i++) {
      if (lines[i].lineType != _enums.lineTypes.tabs) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return a single line
   * @method mergeLines
   * @param chordLine {string} the line containing the chord names
   * @param lyricsLine {string} the line of lyrics
   * @return [string] merged lines
   */
  function mergeLines(chordLine, lyricsLine) {
    while (lyricsLine.length < chordLine.length) {
      lyricsLine += ' ';
    }
    let s = '';
    const blocks = chordLine.match(_re.chrdBlock);
    const lead = chordLine.match(_re.leadingSpace);
    let offset = 0;
    if (lead) {
      s += lyricsLine.substr(offset, lead[0].length);
      offset = lead[0].length;
    }
    for (let j = 0; j < blocks.length; j++) {
      s += `[${blocks[j].replace(_re.spaces, '')}]${lyricsLine.substr(offset, blocks[j].length)}`;
      offset += blocks[j].length;
    }
    if (offset < lyricsLine.length) {
      s += lyricsLine.substr(offset, lyricsLine.length);
    }
    return s;
  }

  /**
   * Wraps the words on the line within square brackets " C D " is returned as "[C] [D]"
   * @method wrapChords
   * @param chordLine {string} the line containing the chord names
   * @return [string] each word of input line gets bracketed
   */
  function wrapChords(chordLine) {
    const chords = chordLine.replace(_re.spaces, ' ').split(' ');
    let s = '';
    for (let i = 0; i < chords.length; i++) {
      if (chords[i].length > 0) {
        s += `[${chords[i]}] `;
      }
    }
    return s;
  }

  module.exports = {
    run,
    hasChords,
  };
});
