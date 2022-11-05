fdRequire.define('ukeGeeks/chordPainter', (require, module) => {
/**
 * Draws large chord diagram grid (aka "reference" diagrams) on canvas
 * @class chordPainter
 * @namespace ukeGeeks
 */

  /**
   * ukeGeeks.chordBrush object handle
   * @property _brush
   * @type ukeGeeks.chordBrush instance handle
   * @private
   */
  let brush = null;

  /**
   * keep an array of missing chords (strings)
   * @property _errors
   * @type array
   * @private
   */
  let errors = [];

  let handles = null;

  /**
   * If ignoreCommonChords option is true then this will contain list of
   * matched chords: ones defined in the ignore list that were also found in the song
   * @property _ignoreMatchList
   * @type {Array}
   * @private
   */
  let ignoreMatchList = [];

  /**
   * Ignore "tacet" or "no chord" chords
   * @property _tacet
   * @type {RegExp}
   * @private
   */
  const regExes = {
    tacet: /^(n.?\/?c.?|tacet)$/i,
  };

  /**
   * Again this is a constructor replacement
   * @method init
   * @param htmlHandles {ukeGeeks.data.htmlHandles} DOM Element object
   * @return {void}
   */
  function init(htmlHandles) {
    brush = new ukeGeeks.chordBrush();
    brush.init();
    handles = htmlHandles;
  }

  /**
     * Checks whether speicified chord (name) is on the ignore list.
   * @method ignoreChord
     * @param  {string} chord Chord name
     * @return {boolean}  return TRUE if "chord" is on ignore list.
     */
  function ignoreChord(chord) {
    for (let i = 0; i < ukeGeeks.settings.commonChords.length; i++) {
      if (chord == ukeGeeks.settings.commonChords[i]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
   * @method show
   * @param chords {array<expandedChord>} Array of chord objects to be plotted
   * @return {void}
   */
  function show(chords) {
    handles.diagrams.innerHTML = '';
    errors = [];
    ignoreMatchList = [];

    if (ukeGeeks.settings.opts.sortAlphabetical) {
      chords.sort();
    }

    for (let i = 0; i < chords.length; i++) {
      if (regExes.tacet.test(chords[i])) {
        continue;
      }
      if (ukeGeeks.settings.opts.ignoreCommonChords && ignoreChord(chords[i])) {
        if ((typeof Array.prototype.indexOf === 'function') && (ignoreMatchList.indexOf(chords[i]) == -1)) {
          ignoreMatchList.push(chords[i]);
        }
        continue;
      }
      const chord = ukeGeeks.definitions.get(chords[i]);
      if (!chord) {
        errors.push(chords[i]);
        continue;
      }
      brush.plot(handles.diagrams, chord, ukeGeeks.settings.fretBox);
    }

    if (ignoreMatchList.length > 0) {
      const para = document.createElement('p');
      para.className = 'ugsIgnoredChords';
      para.innerHTML = `Also uses: ${ignoreMatchList.sort().join(', ')}`;
      handles.diagrams.appendChild(para);
    }
  }

  /**
   * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;.
   * When found adds canvas element and draws chord named in data-chordName attribute
   * @method showInline
   * @param chords {array<expandedChord>} Array of chord objects to be plotted
   * @return {void}
   */
  function showInline(chords) {
    const e = handles.text.getElementsByTagName('code');
    if (e.length < 1) {
      return;
    }
    for (let i = 0; i < chords.length; i++) {
      const chord = ukeGeeks.definitions.get(chords[i]);
      if (!chord) {
        /* TODO: error reporting if not found */
        // _errors.push(chords[i]);
        continue;
      }
      for (let j = 0; j < e.length; j++) {
        if (e[j].getAttribute('data-chordName') == chord.name) {
          brush.plot(e[j], chord, ukeGeeks.settings.inlineFretBox, ukeGeeks.settings.inlineFretBox.fonts);
        }
      }
    }
  }

  /**
   * returns array of unknown chords
   * @method getErrors
   * @return {array}
   */
  function getErrors() {
    return errors;
  }

  /**
   * List of chords excluded from the master chord diagrams
   * @method getIgnoredChords
   * @return {array} array of strings
   */
  function getIgnoredChords() {
    return ignoreMatchList;
  }

  module.exports = {
    init,
    show,
    showInline,
    getErrors,
    getIgnoredChords,
  };
});
