/**
 *
 * Dependencies: jQuery & ugsChordBuilder classes
 * @class chordBuilder
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/chordBuilder', (require, module) => {
  const $ = require('jQuery');

  let _builder = null;

  /**
   * Standard event wire up and prep method. Handles "finding" the Builder's "Hand Cursor" based
   * on the location of the background image used on the Finger Tool.
   * @method  init
   */
  function init() {
    const fingerToolImage = $('.fingerToolImage').css('background-image');
    ugsChordBuilder.settings.cursor.imageUri = fingerToolImage.replace(/url\("(.*)hand.png"\)/i, '$1hand-cursor.png');
    _builder = new ugsChordBuilder.editorUi();
    _builder.init();

    $('#cdBldOpenBtn').click(onShowDlgBtnClick);
  }

  /**
   * Button/Link click handler (shows the Chord Builder Overlay)
   * @method onShowDlgBtnClick
   * @param  {event} evt
   */
  function onShowDlgBtnClick(evt) {
    evt.preventDefault();
    _builder.reload();
    const id = $(this).data('dialog');
    $(`#${id}`).fadeIn();
  }

  module.exports = {
    init,
  };
});
