/**
 *
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/autoReformat', (require, module) => {
  const actions = require('ugsEditorPlus/actions');
  // const autoReformat = require('ugsEditorPlus/autoReformat');
  const toolsLite = require('scriptasaurus/ukeGeeks.toolsLite');
  const reformat = require('ugsEditorPlus/reformat');

  /**
   * associative array/JSON handles to key/frequently accessed DOM Elements (see init()
   * @property _ele
   * @type {JSON}
   */
  let _ele = {};

  let _formatted;
  let _isDisabled = false;

  function run(elements) {
    if (_isDisabled) {
      return;
    }
    _ele = elements;
    _ele.reformatTextBox = document.getElementById('reformatSource');
    _ele.reformatDlg = document.getElementById('reformatDlg');

    document.getElementById('reformatYesBtn').onclick = () => {
      doOk();
      return false;
    };
    document.getElementById('reformatNoBtn').onclick = () => {
      doClose();
      return false;
    };

    // need to reset on reload
    const chk = document.getElementById('reformatDisable');
    chk.checked = false;
    chk.onclick = () => {
      doDisable(this.checked);
    };

    runNow();
  }

  function doOk() {
    _ele.cpmSource.value = _formatted;
    doClose();
    actions.run(true);
  }

  function doClose() {
    _ele.reformatDlg.classList.add('isHidden');
  }

  function doDisable(isDisabled) {
    _isDisabled = isDisabled;
  }

  function runNow() {
    _formatted = reformat.run(_ele.cpmSource.value);
    _ele.reformatTextBox.innerHTML = _formatted;

    if (!reformat.hasChords()) {
      return;
    }

    _ele.reformatDlg.classList.remove('isHidden');
  }

  module.exports = {
    run,
  };
});
