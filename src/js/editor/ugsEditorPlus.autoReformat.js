/**
 *
 * @class autoReformat
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/autoReformat', (require, module) => {
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

    document.getElementById('reformatYesBtn').onclick = function () {
      doOk();
      return false;
    };
    document.getElementById('reformatNoBtn').onclick = function () {
      doClose();
      return false;
    };

    // need to reset on reload
    const chk = document.getElementById('reformatDisable');
    chk.checked = false;
    chk.onclick = function () {
      doDisable(this.checked);
    };

    runNow();
  }

  function doOk() {
    _ele.cpmSource.value = _formatted;
    doClose();
    ugsEditorPlus.actions.run(true);
  }

  function doClose() {
    ukeGeeks.toolsLite.addClass(_ele.reformatDlg, 'isHidden');
  }

  function doDisable(isDisabled) {
    _isDisabled = isDisabled;
  }

  function runNow() {
    _formatted = ugsEditorPlus.reformat.run(_ele.cpmSource.value);
    _ele.reformatTextBox.innerHTML = _formatted;

    if (!ugsEditorPlus.reformat.hasChords()) {
      return;
    }

    ukeGeeks.toolsLite.removeClass(_ele.reformatDlg, 'isHidden');
  }

  module.exports = {
    run,
  };
});
