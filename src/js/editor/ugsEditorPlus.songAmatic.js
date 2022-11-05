/**
 * Exposes the only method required to attach UkeGeeks Scriptasaurus Song-a-matic editor functionality.
 *
 * @class songAmatic
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
fdRequire.define('ugsEditorPlus/songAmatic', (require, module) => {
  const $ = require('jQuery');

  /**
   * attaches event handlers, preps variables, and runs UGS
   * @method init
   * @param options {OBJECT} (optional) Object/JSON with any of the ugsEditorPlus.options
   * @return {void}
   */
  function init(options) {
    const opts = mergeOptions(options);

    ukeGeeks.settings.opts.retainBrackets = !opts.hideChordEnclosures;
    $('#songSourceDlg').toggle(opts.showEditOnLoad);

    ukeGeeks.scriptasaurus.init(opts.useLegacyIe);

    ugsEditorPlus.actions.init();
    ugsEditorPlus.topMenus.init();
    ugsEditorPlus.submenuUi.init();
    ugsEditorPlus.optionsDlg.init();
    ugsEditorPlus.chordBuilder.init();
    ugsEditorPlus.actions.run();
  }

  function mergeOptions(options) {
    const opts = {
      hideChordEnclosures: !ukeGeeks.settings.opts.retainBrackets,
      sortAlphabetical: ukeGeeks.settings.opts.sortAlphabetical,
      ignoreCommonChords: ukeGeeks.settings.opts.ignoreCommonChords,
      commonChords: ukeGeeks.settings.commonChords,
    };

    return $.extend(ugsEditorPlus.options, opts, (typeof options === 'object') ? options : {});
  }

  module.exports = {
    init,
  };
});
