fdRequire.define('scriptasaurus/ukeGeeks.chordPainter', (require, module) => {
  const definitions = require('scriptasaurus/ukeGeeks.definitions');
  const settings = require('scriptasaurus/ukeGeeks.settings');
  const chordBrush = require('scriptasaurus/ukeGeeks.chordBrush');

  /**
   * keep an array of missing chords (strings)
   * @type {[string]}
   */
  let errors = [];

  let handles = null;

  /**
   * If ignoreCommonChords option is true then this will contain list of
   * matched chords: ones defined in the ignore list that were also found in the song
   * @type {[string]}
   */
  let ignoreMatchList = [];

  const regExes = {
    /** Ignore "tacet" or "no chord" chords */
    tacet: /^(n.?\/?c.?|tacet)$/i,
  };

  /**
   * Again this is a constructor replacement
   * @param htmlHandles {ukeGeeks.data.htmlHandles} DOM Element object
   */
  function init(htmlHandles) {
    chordBrush.init();
    handles = htmlHandles;
  }

  /**
   * Checks whether speicified chord (name) is on the ignore list.
   * @param  {string} chord Chord name
   * @return {boolean}  return TRUE if "chord" is on ignore list.
   */
  function ignoreChord(chord) {
    return settings.commonChords.includes(chord);
  }

  /**
   * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
   * @param chords {array<expandedChord>} Array of chord objects to be plotted
   */
  function show(chords) {
    handles.diagrams.innerHTML = '';
    errors = [];
    ignoreMatchList = [];

    if (settings.opts.sortAlphabetical) {
      chords.sort();
    }

    for (let i = 0; i < chords.length; i++) {
      if (regExes.tacet.test(chords[i])) {
        continue;
      }
      if (settings.opts.ignoreCommonChords && ignoreChord(chords[i])) {
        if ((typeof Array.prototype.indexOf === 'function') && (ignoreMatchList.indexOf(chords[i]) == -1)) {
          ignoreMatchList.push(chords[i]);
        }
        continue;
      }
      const chord = definitions.get(chords[i]);
      if (!chord) {
        errors.push(chords[i]);
        continue;
      }
      chordBrush.plot(handles.diagrams, chord, settings.fretBox);
    }

    if (ignoreMatchList.length > 0) {
      const para = Object.assign(document.createElement('p'), {
        className: 'ugsIgnoredChords',
        innerHTML: `Also uses: ${ignoreMatchList.sort().join(', ')}`,
      });
      handles.diagrams.appendChild(para);
    }
  }

  /**
   * Plots chords "inline" with the lyrics. Searches for `<code data-chordName="Am7"></code>;`.
   * When found adds canvas element and draws chord named in data-chordName attribute
   * @param chords {[expandedChord]} Array of chord objects to be plotted
   */
  function showInline(chords) {
    const e = handles.text.getElementsByTagName('code');
    if (e.length < 1) {
      return;
    }
    for (let i = 0; i < chords.length; i++) {
      const chord = definitions.get(chords[i]);
      if (!chord) {
        /* TODO: error reporting if not found */
        // _errors.push(chords[i]);
        continue;
      }
      for (let j = 0; j < e.length; j++) {
        if (e[j].getAttribute('data-chordName') == chord.name) {
          chordBrush.plot(e[j], chord, settings.inlineFretBox, settings.inlineFretBox.fonts);
        }
      }
    }
  }

  /**
   * returns array of unknown chords
   */
  function getErrors() {
    return errors;
  }

  /**
   * List of chords excluded from the master chord diagrams
   */
  function getIgnoredChords() {
    return ignoreMatchList;
  }

  /**
   * Draws large chord diagram grid (aka "reference" diagrams) on canvas
   * @module
   */
  module.exports = {
    init,
    show,
    showInline,
    getErrors,
    getIgnoredChords,
  };
});
