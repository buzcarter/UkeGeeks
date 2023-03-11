fdRequire.define('scriptasaurus/ukeGeeks.definitions', (require, module) => {
  const transpose = require('scriptasaurus/ukeGeeks.transpose');
  const chordImport = require('scriptasaurus/ukeGeeks.chordImport');
  const ugsData = require('scriptasaurus/ukeGeeks.data');

  /**
   * Array of "user" defined chords, in compactChord format. Use "Add" method.
   * @property _userChords
   * @type array
   * @private
   */
  let userChords = [];

  let underscoreChords = [];

  const instruments = [];

  let underscoreOffset = 0;
  let map = [];

  /**
   * Enum (simple JSON name/value pairs) defining instrument tunings (offsets from standard Soprano Ukulele)
   * @type JSON
   */
  const instrument = {
    /** GCEA */
    sopranoUke: 0,
    /** DGBA  -- Baritone's "A" fingering is the Soprano's "D" */
    baritoneUke: 5,
  };

  /* PUBLIC METHODS
  ------------------------------------ */
  /**
   * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
   * @param {[Defs]|string} definitions (Either string or array of strings) Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
   * @return {void}
   */
  function addInstrument(definitions) {
    if (Array.isArray(definitions)) {
      // flatten the array
      definitions = definitions.join('\n');
    }
    instruments.push(definitions);
  }

  /**
   * Choose which instrument's chord dictionary you want used for the chord
   * diagrams. NOTE: .
   * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
   * @return {void}
   */
  function useInstrument(offset) {
    offset = (arguments.length > 0) ? offset : instrument.sopranoUke;
    underscoreOffset = parseInt(offset, 10);
    if (underscoreOffset > 0) {
      map = transpose.retune(underscoreOffset);
    }
    setChords(chordImport.runBlock(instruments[0]).chords);
  }

  /**
   * Returns expanded ChordObject for requested "chord"
   * @param chordName {string} Chord name
   * @return {expandedChord}
   */
  function get(chordName) {
    // try User Defined chords first
    for (let i = 0; i < userChords.length; i++) {
      if (chordName == userChords[i].name) {
        return userChords[i];
      }
    }
    // next: built-in chords:
    if (underscoreOffset < 1) {
      return underscoreGet(chordName);
    }

    // user has retuned the chords, need to find chord name "as-is",
    // but get the fingering from the mapping
    const name = getAlias(chordName);
    const result = map
      .filter((t) => name == t.original)
      .map((t) => underscoreGet(t.transposed))
      .filter(Boolean)
      .reduce((acc, c) => Object.assign(
        new ugsData.expandedChord(chordName),
        {
          dots: c.dots,
          muted: c.muted,
        }));

    return result || null;
  }

  // local substitions (replacements for identical chord shapes)
  const chordNameAliases = {
    'A#': 'Bb',
    Db: 'C#',
    'D#': 'Eb',
    Gb: 'F#',
    Ab: 'G#',
  };

  /**
   * A chord name normalizer: We don't store any chord definitions for A#, Db, D#, Gb, or Ab. Instead
   * definitions of the more common notes are stored instead. So for the A# fingering we return the
   * Bb fingering and so on.
   *
   * Returns original chord name if there is no defined alias.
   *
   * @param  {string} chordName [
   * @return {string}
   */
  function getAlias(chordName) {
    const n = chordName.substr(0, 2);
    return !chordNameAliases[n] ? chordName : chordNameAliases[n] + chordName.substr(2);
  }

  /**
   * Pass in "standard" chord name, returns match from defined chords or null if not found
   * @private
   * @param chordName {string} Chord name
   * @return {expandedChord}
   */
  function underscoreGet(chordName) {
    let i;
    let chrd;
    const name = getAlias(chordName);
    for (i = 0; i < underscoreChords.length; i++) {
      if (name == underscoreChords[i].name) {
        chrd = new ugsData.expandedChord(chordName);
        chrd.dots = underscoreChords[i].dots;
        chrd.muted = underscoreChords[i].muted;
        return chrd;
      }
    }
    return null;
  }

  /**
   * @param data {array} array of expanded chord objects
   * @return {int}
   */
  function add(data) {
    if (data.length) {
      for (let i = 0; i < data.length; i++) {
        userChords.push(data[i]);
      }
    }
    return userChords.length;
  }

  /**
   * @param data {array} array of expanded chord objects
   * @return {int}
   */
  function replace(data) {
    userChords = [];
    return add(data);
  }

  /**
   * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
   * @return {arrayChords}
   */
  function getChords() {
    return underscoreChords;
  }

  function setChords(value) {
    underscoreChords = value;
  }

  /**
 * @module
 * Defines chords and provides simple lookup (find) tools.
 */
  module.exports = {
    add,
    addInstrument,
    get,
    getChords,
    instrument,
    replace,
    setChords,
    useInstrument,
  };
});
