fdRequire.define('scriptasaurus/ukeGeeks.transpose', (require, module) => {
  const definitions = require('scriptasaurus/ukeGeeks.definitions');

  const re = /^([A-G][#b]?)(.*)/;
  /* eslint-disable key-spacing */
  const tones = {
    A:      0,
    'A#':   1,
    Bb:     1,
    B:      2,
    C:      3,
    'C#':   4,
    Db:     4,
    D:      5,
    'D#':   6,
    Eb:     6,
    E:      7,
    F:      8,
    'F#':   9,
    Gb:     9,
    G:     10,
    'G#':  11,
    Ab:    11,
  };
  /* eslint-enable key-spacing */

  /**
   * Pass in a chord name returns new chord name for the original chord shifted by "steps" semitones.
   * @method shift
   * @param name (string) chord name, should be in chord dictionary
   * @param steps (int) number of semitones to transpose
   * @return string
   */
  function shift(name, steps) {
    const t = getTone(name);
    if (t === null) {
      return null;
    }
    let tone = (t.tone + steps) % 12;
    // TODO: negative steps are allowed!!!
    if (tone < 0) {
      tone += 12;
    }

    const result = Object.keys(tones)
      .filter((key) => tone == tones[key])
      .reduce((acc, key) => key + t.suffix);

    return result || null;
  }

  /**
   * Returns object with name (A - G with flat/sharp), integer value (0 - 11), and its "suffix" (minor, 7th, etc)
   * @method getTone
   * @param name (string)
   * @return JSON
   */
  function getTone(name) {
    const m = name.match(re);
    if (!m?.length) {
      return null;
    }
    return {
      tone: parseInt(tones[m[1]], 10),
      prefix: m[1],
      suffix: m[2],
    };
  }

  /**
   * Returns a mapping -- an array of JSON with "original" chord name and "transposed" chord names.
   * @method retune
   * @param offset (int) optional
   * @return {array}
   */
  function retune() {
    const offset = (arguments.length > 0) ? arguments[0] : 0;
    const chords = definitions.getChords();
    const s = [];
    if (offset === 0) {
      for (const i in chords) {
        s.push({
          original: chords[i].name,
          transposed: chords[i].name,
        });
      }
    } else {
      for (const z in chords) {
        s.push({
          original: chords[z].name,
          transposed: shift(chords[z].name, offset),
        });
      }
    }
    return s;
  }

  /**
   * returns copy of input string array shifted by number of steps
   * @method shiftChords
   * @param  array<strings> chords chord names to be shifted
   * @param  int steps  number of semitone steps (up or down)
   * @return array<strings>
   */
  function shiftChords(chords, steps) {
    const newChords = [];
    for (let i = 0; i < chords.length; i++) {
      newChords.push(shift(chords[i], steps));
    }
    return newChords;
  }

  /**
 * Can shift a single chord or list of chords up/down by a series of steps. Hangles
 * finding equivalent chord names (i.e. A# is same as Bb)
 *
 * @module
 */
  module.exports = {
    shift,
    getTone,
    retune,
    shiftChords,
  };
});
