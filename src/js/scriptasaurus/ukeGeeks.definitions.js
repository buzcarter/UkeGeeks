fdRequire.define('ukeGeeks/definitions', (require, module) => {
/**
 * Defines chords and provides simple lookup (find) tools.
 * @class definitions
 * @namespace ukeGeeks
 * @static
 * @singleton
 */

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
   * @property instrument
   * @type JSON
   */
  const instrument = {
    sopranoUke: 0, // GCEA
    baritoneUke: 5, // DGBA -- Baritone's "A" fingering is the Soprano's "D"
  };

  /* PUBLIC METHODS
  ------------------------------------ */
  /**
   * Define an instrument's chord dictionary, this makes this instrument avaiable for showing its chord diagrams.
   * @method addInstrument
   * @param definitions {mixed} (Either string or array of strings) Block of CPM text -- specifically looks for instrurment, tuning, and define statements.
   * @return {void}
   */
  function addInstrument(definitions) {
    if (typeof definitions === 'object') {
      // flatten the array
      definitions = definitions.join('\n');
    }
    instruments.push(definitions);
  }

  /**
   * Choose which instrument's chord dictionary you want used for the chord
   * diagrams. NOTE: .
   * @method useInstrument
   * @param offset {int} (optional) default 0. Number of semitones to shif the tuning.
   * @return {void}
   */
  function useInstrument(offset) {
    offset = (arguments.length > 0) ? offset : instrument.sopranoUke;
    underscoreOffset = parseInt(offset, 10);
    if (underscoreOffset > 0) {
      map = ukeGeeks.transpose.retune(underscoreOffset);
    }
    setChords(ukeGeeks.chordImport.runBlock(instruments[0]).chords);
  }

  /**
   * Returns expanded ChordObject for requested "chord"
   * @method get
   * @param chordName {string} Chord name
   * @return {expandedChord}
   */
  function get(chordName) {
    let i;
    let c;
    let chrd;
    let name;

    // try User Defined chords first
    for (i = 0; i < userChords.length; i++) {
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
    name = getAlias(chordName);
    for (i in map) {
      if (name == map[i].original) {
        c = underscoreGet(map[i].transposed);
        if (c) {
          chrd = new ukeGeeks.data.expandedChord(chordName);
          chrd.dots = c.dots;
          chrd.muted = c.muted;
          return chrd;
        }
      }
    }

    return null;
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
   * @method _getAlias
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
   * @method _get
   * @param chordName {string} Chord name
   * @return {expandedChord}
   */
  function underscoreGet(chordName) {
    let i;
    let chrd;
    const name = getAlias(chordName);
    for (i = 0; i < underscoreChords.length; i++) {
      if (name == underscoreChords[i].name) {
        chrd = new ukeGeeks.data.expandedChord(chordName);
        chrd.dots = underscoreChords[i].dots;
        chrd.muted = underscoreChords[i].muted;
        return chrd;
      }
    }
    return null;
  }

  /**
   * @method add
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
   * @method replace
   * @param data {array} array of expanded chord objects
   * @return {int}
   */
  function replace(data) {
    userChords = [];
    return add(data);
  }

  /**
   * Getter for chord array (compactChord format) -- full library of predefined chords. Mainly used for debugging.
   * @method getChords
   * @return {arrayChords}
   */
  function getChords() {
    return underscoreChords;
  }

  function setChords(value) {
    underscoreChords = value;
  }

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
