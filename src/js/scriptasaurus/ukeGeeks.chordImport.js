fdRequire.define('scriptasaurus/ukeGeeks.chordImport', (require, module) => {
  const settings = require('scriptasaurus/ukeGeeks.settings');
  const toolsLite = require('scriptasaurus/ukeGeeks.toolsLite');
  const ugsData = require('scriptasaurus/ukeGeeks.data');

  /**
   * Internal storage of partially converted "define" statements.
   */
  class ChordParts {
    constructor(definition, addIns) {
      this.define = definition;
      this.adds = addIns || null;
    }

    definition = '';

    /**
     * @type {[string]}
     */
    adds = [];
  }

  /**
   * All regular expressions used in this class. Note, Changed parsing from "\n" to "{" which means "define: ..." cannot depend on that opening curly-brace!
   */
  /* eslint-disable key-spacing */
  const regExes = Object.freeze({
  // first pass filters
    define:     /\s*{?define\s*:(.*?)(}|add:)/i,
    add:        /(add:.*?)(}|add:)/i,
    // chord building filters
    name:       /(\S+)\s+/,
    frets:      /\s+frets\s+([\dx]{4}|(([\dx]{1,2}\s){3})[\dx]{1,2})/i,
    fingers:    /\s+fingers\s+((\d\s+){3}\d|\d{4})/i,
    muted:      /\s+mute\s+(\d\s){0,3}\d?/i,
    // TODO: ignores "base-fret 1"
    // filter "add-in" chord fingers
    addin:      /add:\s*string\s*(\S+)\s+fret\s+(\d+)\sfinger\s(\d)/i,
    // extra commands
    instr:      /{\s*instrument\s*:\s*(.*?)\s*}/i,
    tuning:     /{\s*tuning\s*:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*}/i,
    // single digit numbers
    // num: /(\d)/g,
    numOrX:     /(\d{1,2}|x)/gi,
    any:        /(.)/g,
  });
  /* eslint-enable key-spacing */

  /**
   * TODO:
   * @param {string} line Single line (string with one statment)
   * @return {[ChordParts]}
   */
  function getChordParts(line) {
    line = toolsLite.pack(line);
    if (line.length > 1 && line[0] != '#') {
      const matches = line.match(regExes.define);
      if (matches?.length > 1) {
        return new ChordParts(matches[1], getAddIns(line));
      }
    }
    return null;
  }

  /**
   * TODO:
   * @param {[string]} lines Array of lines (stings) each wtih one statment
   * @return {[ChordParts]}
   */
  function getChordPartsAry(lines) {
    return lines.reduce((acc, line) => {
      const chordPart = getChordParts(line);
      if (chordPart) {
        acc.push(chordPart);
      }
      return acc;
    }, []);
  }

  /**
   * TODO:
   * @param text {string}
   */
  function getAddIns(text) {
    const results = [];
    let matches = text.match(regExes.add);
    while (matches?.length > 1) {
      results.push(matches[1]);
      text = text.replace(matches[1], '');
      matches = text.match(regExes.add);
    }
    return results;
  }

  /**
   * TODO:
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  function getInstrument(text) {
    const matches = text.match(regExes.instr);
    return !matches ? null : toolsLite.pack(matches[1]);
  }

  /**
   * TODO: expects FOUR strings.
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  function getTuning(text) {
    const matches = text.match(regExes.tuning);
    return !matches ? null : [matches[1], matches[2], matches[3], matches[4]];
  }

  /**
   * TODO:
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  function getName(text) {
    const matches = text.match(regExes.name);
    return !matches ? null : matches[1];
  }

  /**
   * TODO:
   * @param name {string}
   * @param tuning {array<string>}
   * @return {string}
   */
  function getKey(name, tuning) {
    let result = name.replace(' ', '-');
    tuning.forEach((t) => {
      result += `-${t}`;
    });
    return result.toLowerCase();
  }

  /**
   * TODO: Change will affect "packed" chord fingers -- spaces required. No longer accepts "frets 1231", it must be "frets 1 2 3 1"
   * Replaces _getFrets. Sets frets and muted arrays.
   * @param text {string} string to be searched
   * @param frets {array<int>}
   * @param muted {array<bool>}
   * @return {void}
   */
  function fretOMatic(text, frets, muted) {
    const fretMatches = text.match(regExes.frets);
    if (!fretMatches) {
      return;
    }
    const matches = (fretMatches[1].length == 4) ? fretMatches[1].match(regExes.any) : fretMatches[1].match(regExes.numOrX);
    for (let i = 0; i < matches.length; i++) {
      const isX = matches[i] == 'x' || matches[i] == 'X';
      frets[i] = isX ? 0 : parseInt(matches[i], 10);
      muted[i] = isX;
    }
  }

  /**
   * TODO:
   * @param text {string} string to be searched
   * @return {array<string>}
   */
  function getFingers(text) {
    const matches = text.match(regExes.fingers);
    if (!matches) {
      return [];
    }
    let x = matches[1];
    if (x.length == 4) {
      x = x.replace(regExes.any, '$1 ');
    }
    return x.split(' ');
  }

  /**
   * Pass in integer arrays, frets is list of frets, plus corresponding fingers array
   * @param frets {array}
   * @param fingers {array}
   * @return {array<ukeGeeks.data.dot>} array of dots
   */
  function toDots(frets, fingers) {
    const dots = [];
    const { tuning } = settings;
    for (let j = 0; j < tuning.length; j++) {
      const fretNumber = parseInt(frets[j], 10);
      if (fretNumber > 0) {
        dots.push(new ugsData.dot(j, fretNumber, (fingers.length - 1 >= j) ? parseInt(fingers[j], 10) : 0));
      }
    }
    return dots;
  }

  /**
   * If a valid "add" instruction is present pushes a new dot object into dots array.
   * @param dots {array<ukeGeeks.data.dot>}
   * @param adds {array<string>} array of "add instruction" to be parsed (i.e. "add: string G fret 1 finger 1")
   * @return {void}
   */
  function addInDots(dots, adds) {
    if (!adds?.length) {
      return;
    }
    adds.forEach((value) => {
      const matches = value.match(regExes.addin);
      if (matches?.length > 2) {
        dots.push(new ugsData.dot(parseInt(matches[1], 10) - 1, parseInt(matches[2], 10), parseInt(matches[3], 10)));
      }
    });
  }

  /**
   * TODO:
   * @param text {string}
   * @param adds {type}
   * @return {expandedChord}
   */
  function getExpandedChord(text, adds) {
    const frets = [];
    const muted = [];
    fretOMatic(text, frets, muted);

    const name = getName(text);
    const fingers = getFingers(text);

    if (name === null || name == 'frets') {
      log(`bad "define" instruction: chord name not found: ${text}`);
      return null;
    }
    if (frets === null) {
      log(`bad "define" instruction: frets not found: ${text}`);
      return null;
    }
    const chrd = new ugsData.expandedChord(name);
    // chrd.name = name;
    const dots = toDots(frets, fingers);
    addInDots(dots, adds);
    chrd.dots = dots;
    chrd.muted = muted;
    return chrd;
  }

  /**
   * TODO:
   * @param parts {[ChordParts]}
   * @return {void}
   */
  function partsToChords(parts) {
    return parts.reduce((result, { define, adds }) => {
      const chord = getExpandedChord(define, adds);
      if (chord) {
        result.push(chord);
      }
      return result;
    }, []);
  }

  /**
   * Add an error. As one would with console.log("blah").
   * @param msg {string} Error message to be added
   * @return {void}
   */
  function log(msg) {
    errs.push(msg);
  }

  let errs = [];

  // eslint-disable-next-line no-unused-vars
  function echoLog() {
    // eslint-disable-next-line no-console
    errs.forEach((e, i) => console.log(`${i}. ${e}`));
  }

  /**
   * Returns an expandedChord object (JSON) converted from single statement text input line.
   * @param line {string} Single line (string with one statment)
   * @return {ukeGeeks.data.expandedChord}
   */
  function runLine(line) {
    const c = getChordParts(line);
    return !c ? null : getExpandedChord(c.define, c.adds);
  }

  /**
   * Returns array of expandedChord objects (JSON), converted from text input.
   * @param text {string} Multiline text block containing definition, instrument, and tuning statements.
   * @return {ukeGeeks.data.instrument}
   */
  function runBlock(text) {
    // TODO: newlines get lost in strings, do I always rely on "{"?
    let lines = text.split('\n');
    if (lines.length < 2) {
      lines = text.split('{');
    }
    const parts = getChordPartsAry(lines);
    const name = getInstrument(text);
    const tuning = getTuning(text);
    return new ugsData.instrument(
      getKey(name, tuning), // key
      name, // name
      tuning, // tuning
      partsToChords(parts), // chords
    );
  }

  /**
   * @module
   * Converts text to JSON objects. Accetps either large text blocks or single lines of
   * text written in CPM syntax (looks for instrument, tuning, and define statements).
   */
  module.exports = {
    runLine,
    runBlock,
  };
});
