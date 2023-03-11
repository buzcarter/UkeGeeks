/* eslint-disable max-classes-per-file */
fdRequire.define('scriptasaurus/ukeGeeks.data', (require, module) => {
  /**
   * Chord info sutiable for plotting on Canvas; has name and dot positions
   */
  class ExpandedChord {
    constructor(name) {
      this.name = name;
    }

    /**
     * string, i.e. 'C#6'
     */
    name = '';

    /**
     * @type {[Dots]}
     */
    dots = [];

    /**
     * Array of bools, true means that string is not played (muted). i.e. chord.mute[2] means third string is muted.
     * @type {[boolean]}
     */
    muted = [];
  }

  /**
   * Song object holds all meta info (Title, Subtitles) plus an array of plot
   */
  class Song {
    title = '';

    album = '';

    artist = '';

    /**
     * Subtitle, often Artist Info
     */
    st = '';

    /**
     * Subtitle Number 2, subtitle2 (not used yet)
     */
    st2 = '';

    /**
     * Song's Key ('A', 'C', etc)
     */
    key = '';

    body = '';

    /**
     * True if there is at least one chord in use, false otherwise. Useful for laying out tablature, which might have no chords.
     */
    hasChords = false;

    ugsMeta = [];

    /**
     * array of data.dots (wrong)
     */
    defs = [];

    /**
     * array of chord names found in current song
     * @type {[string]}
     */
    chords = [];
  }

  /**
   * A single fretboard fingering "dot".
   *
   * Add-in fingerings. Frequently you'll add this to indicate
   * "nutting" or "barring" with one or more fingers.
   *
   * For example, the D7 is often played by laying the index finger across the entire
   * second fret and then placing middle finger on 3rd fret of "A" string like this:
   *
   * ```
   *  G C E A
   *  - - - -  (1st fret)
   *  X X X X
   *  - - - X
   *  - - - -  (4th fret)
   * ```
   *
   * The "A" string has two fingers on it, obviously one does nothing -- except to make the
   * chord much easier to play.
   */
  class Dot {
    constructor(string, fret, finger) {
      this.string = string;
      this.fret = fret;
      this.finger = finger;
    }

    /**
     * The ukulele's string, numbered from "top" (1) to "bottom" (4). Sporano uke strings would be ['G' => 1,'C' => 2,'E' => 3,'A' => 4]
     * TODO: do "add-ins" use char or int?
     * @type {int}
     */
    string = null;

    /**
     * Fret position, i.e. 0-12
     * @type {int}
     */
    fret = null;

    /**
     * ex: 0-4 (where 1 = index finger and 4 = pinky)
     * @type {int}
     */
    finger = null;
  }

  /**
   * @prop  {string} key
   * @prop  {string} name
   * @prop  {string} tuning
   * @prop  {array} chords
   */
  class Instrument {
    constructor(key, name, tuning, chords) {
      this.key = key;
      this.name = name;
      this.tuning = tuning;
      this.chords = chords;
    }
  }

  class HTMLHandles {
    constructor(wrap, diagrams, text) {
      this.wrap = wrap;
      this.diagrams = diagrams;
      this.text = text;
    }
  }

  /**
   * A container or Models library. ukegeeks.data is really a "Models" namespace. Please refactor.
   * @module
   */
  module.exports = {
    expandedChord: ExpandedChord,
    song: Song,
    dot: Dot,
    instrument: Instrument,
    htmlHandles: HTMLHandles,
  };
});
