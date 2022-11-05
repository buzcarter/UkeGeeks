fdRequire.define('ukeGeeks/scriptasaurus', (require, module) => {
  let errList = [];

  /**
   * Preps this class for running
   * @method init
   * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
   * @return {void}
   */
  function init(isIeFamily) {
    const defs = ukeGeeks.definitions;

    ukeGeeks.settings.environment.isIe = isIeFamily;
    // TODO: known problem -- need to preload Sorprano chord libarary then we can retune if needed
    defs.addInstrument(defs.sopranoUkuleleGcea);
    defs.useInstrument(defs.instrument.sopranoUke);
    if (ukeGeeks.settings.defaultInstrument != defs.instrument.sopranoUke) {
      defs.useInstrument(ukeGeeks.settings.defaultInstrument);
    }
  }

  /**
   * Runs all Scriptasaurus methods using the element Ids defined in the settings class.
   * This is your "Do All". See data.song for structure.
   * @method run
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
   * @method runByClasses
   * @return {Array of songObject}
   */
  function runByClasses() {
    const songs = [];
    const songWraps = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.wrap);
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
   * @method setTuningOffset
   * @param offset {int} (optional) default 0. Number of semitones to shift the tuning. See ukeGeeks.definitions.instrument.
   */
  function setTuningOffset(offset) {
    ukeGeeks.definitions.useInstrument(offset);
  }

  // song

  /**
   *
   * @method _runSong
   * @private
   * @param handles {ukeGeeks.data.htmlHandles}
   * @return {songObj}
   */
  function runSong(handles) {
    // console.log('run Song');

    // read Music, find chords, generate HTML version of song:
    const cpm = new ukeGeeks.cpmParser();
    cpm.init();
    const song = cpm.parse(handles.text.innerHTML);
    ukeGeeks.definitions.replace(song.defs);

    const chrdPrsr = new ukeGeeks.chordParser();
    chrdPrsr.init();
    handles.text.innerHTML = chrdPrsr.parse(song.body);
    song.chords = chrdPrsr.getChords();

    // Draw the Chord Diagrams:
    const painter = new ukeGeeks.chordPainter();
    painter.init(handles);
    painter.show(song.chords);
    // Show chord diagrams inline with lyrics
    if (ukeGeeks.settings.inlineDiagrams) {
      ukeGeeks.toolsLite.addClass(handles.wrap, 'ugsInlineDiagrams');
      painter.showInline(song.chords);
    }

    // Do Tablature:
    const tabs = new ukeGeeks.tabs();
    tabs.init();
    tabs.replace(handles.text);

    // error reporting:
    errList.push(painter.getErrors());

    const container = handles.wrap;
    if (container) {
      ukeGeeks.toolsLite.setClass(container, 'ugsNoChords', !song.hasChords);
    }

    if (ukeGeeks.settings.opts.autoFixOverlaps) {
      ukeGeeks.overlapFixer.Fix(handles.text);
    }

    // done!
    return song;
  }

  /**
   * Shows a JavaScript alert box containing list of unknown chords.
   * @method showErrors
   * @return {void}
   */
  function showErrors(errs) {
    if (errs.length < 1) {
      return;
    }

    // console.log(typeof(errs[0]));
    let s = '';
    for (let i = 0; i < errs.length; i++) {
      s += (s.length > 0) ? ', ' : '';
      s += errs[i];
    }
    alert(`Forgive me, but I don't know the following chords: ${s}`);
  }

  /**
   *
   * @method _getHandlesFromClass
   * @private
   * @param wrap {domElement}
   * @return {ukeGeeks.data.htmlHandles}
   */
  function getHandlesFromClass(wrap) {
    const diagrams = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.diagrams, wrap);
    const text = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.text, wrap);
    if ((diagrams === undefined) || (diagrams.length < 1) || (text === undefined) || (text.length < 1)) {
      return null;
    }
    return new ukeGeeks.data.htmlHandles(wrap, diagrams[0], text[0]);
  }

  /**
   *
   * @method _getHandlesFromId
   * @private
   * @return {ukeGeeks.data.htmlHandles}
   */
  function getHandlesFromId() {
    return new ukeGeeks.data.htmlHandles(
      document.getElementById(ukeGeeks.settings.ids.container),
      document.getElementById(ukeGeeks.settings.ids.canvas),
      document.getElementById(ukeGeeks.settings.ids.songText),
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
