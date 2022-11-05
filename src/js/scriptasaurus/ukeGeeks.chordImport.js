/**
 * Converts text to JSON objects. Accetps either large text blocks or single lines of
 * text written in CPM syntax (looks for instrument, tuning, and define statements).
 * @class chordImport
 * @namespace ukeGeeks
 * @singleton
 */
ukeGeeks.chordImport = (function () {
  /**
   * attach public members to this object
   * @property _public
   * @type {Object}
   */
  const _public = {};

  /**
   * Internal storage of partially converted "define" statements. The Definition (string) and addIn (array<strings>)
   * @class chordImport.chordParts
   * @constructor
   * @type ClassDefinition
   * @private
   */
  const chordParts = function (definition, addIns) {
    this.define = definition;
    this.adds = addIns;
  };

  /**
   * All regular expressions used in this class. Note, Changed parsing from "\n" to "{" which means "define: ..." cannot depend on that opening curly-brace!
   * @property regEx
   * @type JSON Object of Regular Expressions
   * @private
   */
  const regEx = {
    // first pass filters
    define: /\s*{?define\s*:(.*?)(}|add:)/i,
    add: /(add:.*?)(}|add:)/i,
    // chord building filters
    name: /(\S+)\s+/,
    frets: /\s+frets\s+([\dx]{4}|(([\dx]{1,2}\s){3})[\dx]{1,2})/i,
    fingers: /\s+fingers\s+((\d\s+){3}\d|\d{4})/i,
    muted: /\s+mute\s+(\d\s){0,3}\d?/i,
    // TODO: ignores "base-fret 1"
    // filter "add-in" chord fingers
    addin: /add:\s*string\s*(\S+)\s+fret\s+(\d+)\sfinger\s(\d)/i,
    // extra commands
    instr: /{\s*instrument\s*:\s*(.*?)\s*}/i,
    tuning: /{\s*tuning\s*:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*}/i,
    // single digit numbers
    // num: /(\d)/g,
    numOrX: /(\d{1,2}|x)/gi,
    any: /(.)/g,
  };

  /**
   * TODO:
   * @method _lineToParts
   * @private
   * @param line {string} Single line (string with one statment)
   * @return {array<chordParts>}
   */
  const _lineToParts = function (line) {
    const s = ukeGeeks.toolsLite.pack(line);
    if (s.length > 1 && s[0] != '#') {
      const m = s.match(regEx.define);
      if (m && m.length > 1) {
        return new chordParts(m[1], _getAddIns(s));
      }
    }
    return null;
  };

  /**
   * TODO:
   * @method _textToParts
   * @private
   * @param line {array<string>} Array of lines (stings) each wtih one statment
   * @return {void}
   */
  const _textToParts = function (lines) {
    const p = [];
    for (const i in lines) {
      const c = _lineToParts(lines[i]);
      if (c) {
        p.push(c);
      }
    }
    return p;
  };

  /**
   * TODO:
   * @method _getAddIns
   * @private
   * @param txt {string}
   * @return {void}
   */
  var _getAddIns = function (txt) {
    const finds = [];
    let m = txt.match(regEx.add);
    while (m && m.length > 1) {
      finds.push(m[1]);
      txt = txt.replace(m[1], '');
      m = txt.match(regEx.add);
    }
    return finds;
  };

  /**
   * TODO:
   * @method _getInstrument
   * @private
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  const _getInstrument = function (text) {
    const c = text.match(regEx.instr);
    return !c ? null : ukeGeeks.toolsLite.pack(c[1]);
  };

  /**
   * TODO: expects FOUR strings.
   * @method _getTuning
   * @private
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  const _getTuning = function (text) {
    const c = text.match(regEx.tuning);
    return !c ? null : [c[1], c[2], c[3], c[4]];
  };

  /**
   * TODO:
   * @method _getName
   * @private
   * @param text {string} Single statement to be searched
   * @return {string}
   */
  const _getName = function (text) {
    const c = text.match(regEx.name);
    return !c ? null : c[1];
  };

  /**
   * TODO:
   * @method _getKey
   * @private
   * @param name {string}
   * @param tuning {array<string>}
   * @return {string}
   */
  const _getKey = function (name, tuning) {
    let s = name.replace(' ', '-');
    for (const i in tuning) {
      s += `-${tuning[i]}`;
    }
    return s.toLowerCase();
  };

  /**
   * TODO: Change will affect "packed" chord fingers -- spaces required. No longer accepts "frets 1231", it must be "frets 1 2 3 1"
   * Replaces _getFrets. Sets frets and muted arrays.
   * @method _fretOMatic
   * @private
   * @param text {string} string to be searched
   * @param frets {array<int>}
   * @param muted {array<bool>}
   * @return {void}
   */
  const _fretOMatic = function (text, frets, muted) {
    const f = text.match(regEx.frets);
    if (!f) {
      return;
    }
    const m = (f[1].length == 4) ? f[1].match(regEx.any) : f[1].match(regEx.numOrX);
    for (let i = 0; i < m.length; i++) {
      const isX = m[i] == 'x' || m[i] == 'X';
      frets[i] = isX ? 0 : parseInt(m[i], 10);
      muted[i] = isX;
    }
  };

  /**
   * TODO:
   * @method _getFingers
   * @private
   * @param text {string} string to be searched
   * @return {array<string>}
   */
  const _getFingers = function (text) {
    const f = text.match(regEx.fingers);
    if (!f) {
      return [];
    }
    let x = f[1];
    if (x.length == 4) {
      x = x.replace(regEx.any, '$1 ');
    }
    return x.split(' ');
  };

  /**
   * Pass in integer arrays, frets is list of frets, plus corresponding fingers array
   * @method _toDots
   * @private
   * @param frets {array}
   * @param fingers {array}
   * @return {array<ukeGeeks.data.dot>} array of dots
   */
  const _toDots = function (frets, fingers) {
    const dots = [];
    const { tuning } = ukeGeeks.settings;
    for (let j = 0; j < tuning.length; j++) {
      const n = parseInt(frets[j], 10);
      if (n > 0) {
        dots.push(new ukeGeeks.data.dot(j, n, (fingers.length - 1 >= j) ? parseInt(fingers[j], 10) : 0));
      }
    }
    return dots;
  };

  /**
   * If a valid "add" instruction is present pushes a new dot object into dots array.
   * @method _addInDots
   * @private
   * @param dots {array<ukeGeeks.data.dot>}
   * @param adds {array<string>} array of "add instruction" to be parsed (i.e. "add: string G fret 1 finger 1")
   * @return {void}
   */
  const _addInDots = function (dots, adds) {
    if (!adds || adds.length < 1) {
      return;
    }
    for (const i in adds) {
      const a = adds[i].match(regEx.addin);
      if (a && a.length > 2) {
        dots.push(new ukeGeeks.data.dot(parseInt(a[1], 10) - 1, parseInt(a[2], 10), parseInt(a[3], 10)));
      }
    }
  };

  /**
   * TODO:
   * @method _getExpandedChord
   * @private
   * @param text {type}
   * @param adds {type}
   * @return {void}
   */
  const _getExpandedChord = function (text, adds) {
    const frets = [];
    const muted = [];
    _fretOMatic(text, frets, muted);

    const name = _getName(text);
    const fingers = _getFingers(text);

    if (name === null || name == 'frets') {
      _log(`bad "define" instruction: chord name not found: ${text}`);
      return null;
    }
    if (frets === null) {
      _log(`bad "define" instruction: frets not found: ${text}`);
      return null;
    }
    const chrd = new ukeGeeks.data.expandedChord(name);
    // chrd.name = name;
    const dots = _toDots(frets, fingers);
    _addInDots(dots, adds);
    chrd.dots = dots;
    chrd.muted = muted;
    return chrd;
  };

  /**
   * TODO:
   * @method _partsToChords
   * @private
   * @param parts {type}
   * @return {void}
   */
  const _partsToChords = function (parts) {
    const c = [];
    let x = null;
    for (const i in parts) {
      x = _getExpandedChord(parts[i].define, parts[i].adds);
      if (x) {
        c.push(x);
      }
    }
    return c;
  };

  /**
   * Add an error. As one would with console.log("blah").
   * @private
   * @method _log
   * @param msg {string} Error message to be added
   * @return {void}
   */
  var _log = function (msg) {
    _errs.push(msg);
  };
  var _errs = [];

  const _echoLog = function () {
    for (const i in _errs) {
      console.log(`${i}. ${_errs[i]}`);
    }
  };

  /**
   * Returns an expandedChord object (JSON) converted from single statement text input line.
   * @method runLine
   * @param line {string} Single line (string with one statment)
   * @return {ukeGeeks.data.expandedChord}
   */
  _public.runLine = function (line) {
    const c = _lineToParts(line);
    return !c ? null : _getExpandedChord(c.define, c.adds);
  };

  /**
   * Returns array of expandedChord objects (JSON), converted from text input.
   * @method runBlock
   * @param text {string} Multiline text block containing definition, instrument, and tuning statements.
   * @return {ukeGeeks.data.instrument}
   */
  _public.runBlock = function (text) {
    // TODO: newlines get lost in strings, do I always rely on "{"?
    let linesAry = text.split('\n');
    if (linesAry.length < 2) {
      linesAry = text.split('{');
    }
    const parts = _textToParts(linesAry);
    const name = _getInstrument(text);
    const tuning = _getTuning(text);
    return new ukeGeeks.data.instrument(
      _getKey(name, tuning), // key
      name, // name
      tuning, // tuning
      _partsToChords(parts), // chords
    );
  };

  return _public;
}());
