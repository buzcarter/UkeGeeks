/**
 * Can shift a single chord or list of chords up/down by a series of steps. Hangles
 * finding equivalent chord names (i.e. A# is same as Bb)
 *
 * @class transpose
 * @namespace ukeGeeks
 * @static
 * @singleton
 */
ukeGeeks.transpose = (function () {
  /**
   * attach public members to this object
   * @property _public
   * @type {Object}
   */
  const _public = {};

  const re = /^([A-G][#b]?)(.*)/;
  const tones = {
    A: 0,
    'A#': 1,
    Bb: 1,
    B: 2,
    C: 3,
    'C#': 4,
    Db: 4,
    D: 5,
    'D#': 6,
    Eb: 6,
    E: 7,
    F: 8,
    'F#': 9,
    Gb: 9,
    G: 10,
    'G#': 11,
    Ab: 11,
  };

  /**
   * Pass in a chord name returns new chord name for the original chord shifted by "steps" semitones.
   * @method shift
   * @param name (string) chord name, should be in chord dictionary
   * @param steps (int) number of semitones to transpose
   * @return string
   */
  _public.shift = function (name, steps) {
    const t = getTone(name);
    if (t === null) {
      return null;
    }
    let tone = (t.tone + steps) % 12;
    // TODO: negative steps are allowed!!!
    if (tone < 0) {
      tone += 12;
    }
    for (const key in tones) {
      if (tone == tones[key]) {
        return key + t.suffix;
      }
    }
    return null;
  };

  /**
   * Returns object with name (A - G with flat/sharp), integer value (0 - 11), and its "suffix" (minor, 7th, etc)
   * @method getTone
   * @param name (string)
   * @return JSON
   */
  var getTone = function (name) {
    const m = name.match(re);
    if (!m || m.length < 1) {
      return null;
    }
    return {
      tone: parseInt(tones[m[1]], 10),
      prefix: m[1],
      suffix: m[2],
    };
  };

  /**
   * Returns a mapping -- an array of JSON with "original" chord name and "transposed" chord names.
   * @method retune
   * @param offset (int) optional
   * @return {array}
   */
  _public.retune = function () {
    const offset = (arguments.length > 0) ? arguments[0] : 0;
    const chords = ukeGeeks.definitions.getChords();
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
          transposed: _public.shift(chords[z].name, offset),
        });
      }
    }
    return s;
  };

  /**
   * returns copy of input string array shifted by number of steps
   * @method shiftChords
   * @param  array<strings> chords chord names to be shifted
   * @param  int steps  number of semitone steps (up or down)
   * @return array<strings>
   */
  _public.shiftChords = function (chords, steps) {
    const newChords = [];
    for (let i = 0; i < chords.length; i++) {
      newChords.push(_public.shift(chords[i], steps));
    }
    return newChords;
  };

  // ---------------------------------------
  // return public interface
  // ---------------------------------------
  return _public;
}());
