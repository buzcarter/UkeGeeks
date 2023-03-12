fdRequire.define('scriptasaurus/ukeGeeks.scriptasaurus', (require, module) => {
  const chordPainter = require('scriptasaurus/ukeGeeks.chordPainter');
  const chordParser = require('scriptasaurus/ukeGeeks.chordParser');
  const cpmParser = require('scriptasaurus/ukeGeeks.cpmParser');
  const definitions = require('scriptasaurus/ukeGeeks.definitions');
  const overlapFixer = require('scriptasaurus/ukeGeeks.overlapFixer');
  const settings = require('scriptasaurus/ukeGeeks.settings');
  const sopranoUkuleleGcea = require('scriptasaurus/ukeGeeks.definitions.sopranoUkuleleGcea');
  const tabs = require('scriptasaurus/ukeGeeks.tabs');
  const toolsLite = require('scriptasaurus/ukeGeeks.toolsLite');
  const ugsData = require('scriptasaurus/ukeGeeks.data');

  let errList = [];

  /**
   * Preps this class for running
   * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
   * @return {void}
   */
  function init(isIeFamily) {
    settings.environment.isIe = isIeFamily;
    // TODO: known problem -- need to preload Sorprano chord libarary then we can retune if needed
    definitions.addInstrument(sopranoUkuleleGcea.definitions);
    definitions.useInstrument(definitions.instrument.sopranoUke);
    if (settings.defaultInstrument != definitions.instrument.sopranoUke) {
      definitions.useInstrument(settings.defaultInstrument);
    }
  }

  /**
   * Runs all Scriptasaurus methods using the element Ids defined in the settings class.
   * This is your "Do All". See data.song for structure.
   * @return {songObject}
   */
  function run() {
    // console.log('run (Classic Mode)');
    const handles = getHandlesFromId();
    if (!handles || !handles.diagrams || !handles.text || !handles.wrap) {
      return null;
    }
    errList = [];
    const song = runSong(handles);
    showErrors(errList[0]);
    return song;
  }

  /**
   * Same as "run" except runs using class names, this allows you to have multiple songs on a single page.
   * @return {Array of songObject}
   */
  function runByClasses() {
    const songs = [];
    const songWraps = toolsLite.getElementsByClass(settings.wrapClasses.wrap);
    for (let i = 0; i < songWraps.length; i++) {
      const handles = getHandlesFromClass(songWraps[i]);
      if (handles === null) {
        continue;
      }
      songs.push(runSong(handles));
    }
    return songs;
  }

  /**
   * Is this really nececessary?
   * @param offset {int} (optional) default 0. Number of semitones to shift the tuning. See ukeGeeks.definitions.instrument.
   */
  function setTuningOffset(offset) {
    definitions.useInstrument(offset);
  }

  // song

  /**
   * @param handles {ukeGeeks.data.htmlHandles}
   * @return {songObj}
   */
  function runSong(handles) {
    // console.log('run Song');

    // read Music, find chords, generate HTML version of song:
    cpmParser.init();
    const song = cpmParser.parse(handles.text.innerHTML);
    definitions.replace(song.defs);

    chordParser.init();
    handles.text.innerHTML = chordParser.parse(song.body);
    song.chords = chordParser.getChords();

    // Draw the Chord Diagrams:
    chordPainter.init(handles);
    chordPainter.show(song.chords);
    // Show chord diagrams inline with lyrics
    if (settings.inlineDiagrams) {
      handles.wrap.classList.add('ugsInlineDiagrams');
      chordPainter.showInline(song.chords);
    }

    // Do Tablature:
    tabs.init();
    tabs.replace(handles.text);

    // error reporting:
    errList.push(chordPainter.getErrors());

    const container = handles.wrap;
    if (container) {
      container.classList.toggle('ugsNoChords', !song.hasChords);
    }

    if (settings.opts.autoFixOverlaps) {
      overlapFixer.Fix(handles.text);
    }

    // done!
    return song;
  }

  /**
   * Shows a JavaScript alert box containing list of unknown chords.
   * @return {void}
   */
  function showErrors(errs) {
    if (!errs.length) {
      return;
    }

    // console.log(typeof(errs[0]));
    let errStr = '';
    for (let i = 0; i < errs.length; i++) {
      errStr += (errStr.length > 0) ? ', ' : '';
      errStr += errs[i];
    }
    alert(`Forgive me, but I don't know the following chords: ${errStr}`);
  }

  /**
   * @param wrap {domElement}
   * @return {ukeGeeks.data.htmlHandles}
   */
  function getHandlesFromClass(wrap) {
    const diagrams = toolsLite.getElementsByClass(settings.wrapClasses.diagrams, wrap);
    const text = toolsLite.getElementsByClass(settings.wrapClasses.text, wrap);
    if ((diagrams === undefined) || (diagrams.length < 1) || (text === undefined) || (text.length < 1)) {
      return null;
    }
    return new ugsData.htmlHandles(wrap, diagrams[0], text[0]);
  }

  /**
   * @return {data.htmlHandles}
   */
  function getHandlesFromId() {
    return new ugsData.htmlHandles(
      document.getElementById(settings.ids.container),
      document.getElementById(settings.ids.canvas),
      document.getElementById(settings.ids.songText),
    );
  }

  /**
 * Finds page HTML elements & creates ukeGeek objects;
 * Reads song text, parses, draws choard diagrams.
 *
 * @module
 */
  module.exports = {
    init,
    run,
    runByClasses,
    setTuningOffset,
  };
});
