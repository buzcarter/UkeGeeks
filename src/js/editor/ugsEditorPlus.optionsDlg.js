/**
 * UI mechanics of the Other Options "dialog"'s checkboxes and input
 * fields (does NOT manage "pageWidth" since its standard submenu behavior
 * is already handled in that class)
 * @class optionsDlg
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/optionsDlg', (require, module) => {
  const $ = require('jQuery');

  /**
   * Sets up this class by attaching event handlers to form elements;
   * @method init
   * @public
   */
  function init() {
    let ele;
    const { options } = ugsEditorPlus;

    // Update Button
    document.getElementById('updateBtn').onclick = function () {
      triggerNotify('update', '');
      return false;
    };

    // show/hide square bracket (chord enclosure)
    ele = document.getElementById('chkEnclosures');
    ele.checked = options.hideChordEnclosures;
    ele.onclick = function () {
      // Boolean "isVisible"
      triggerNotify('showEnclosures', !this.checked);
    };

    // list of chord names to ignore
    ele = document.getElementById('commonChordList');
    ele.value = (typeof options.commonChords === 'string') ? options.commonChords : options.commonChords.join(', ');
    ele.onchange = function () {
      triggerNotify('setCommonChords', this.value);
    };

    // toggle order of reference diagrams
    ele = document.getElementById('chkSortAlpha');
    if (ele) {
      ele.checked = options.sortAlphabetical;
      ele.onclick = function () {
        triggerNotify('sortAlphabetical', this.checked);
      };
    }

    // toggle ignore common chords
    ele = document.getElementById('chkIgnoreCommon');
    ele.checked = options.ignoreCommonChords;
    ele.onclick = function () {
      // Boolean for "isIgnore"
      triggerNotify('hideCommonChords', this.checked);
    };

    // ugh! Event bubbling!
    $('.checkboxBlock label, input[type=checkbox]').click((e) => {
      e.stopPropagation();
    });

    $('.overlay').draggable({
      handle: 'hgroup',
      // containParent: true
    });
  }

  function triggerNotify(action, value) {
    $.event.trigger('option:click', {
      action,
      value,
    });
  }

  module.exports = {
    init,
  };
});
