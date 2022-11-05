/**
 * Updates an exising song via AJAX.
 * Dependencies: jQuery
 * @class updateSong
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/updateSong', (require, module) => {
  const $ = require('jQuery');

  let _ajaxUri = '';
  let _filename = '';

  /**
   * Name / Value pairs for jQuery selectors of HTML elements to be manipulated
   * @property _selectors
   * @type {JSON}
   */
  const _selectors = {
    messageBox: '#messageBox',
    message: '#sourceFeedback',
    button: '#saveBtn',
    spinner: '#loadingSpinner',
    song: '#chordProSource',
  };

  /**
   * lock-down the Submit (Update) button to avoid double posts;
   * @property _isUpdating
   * @type {Boolean}
   */
  let _isUpdating = false;

  function init(ajaxUri, filename) {
    _ajaxUri = ajaxUri;
    _filename = filename;

    $(_selectors.button).click((event) => {
      doUpdate();
      return false;
    });

    $(_selectors.messageBox).hide();
    $(document)
      .ajaxStart(() => {
        showBusy();
        _isUpdating = true;
      })
      .ajaxStop(() => {
        hideMessage();
        _isUpdating = false;
      });
  }

  function showBusy() {
    $(_selectors.message).hide().html();
    $(_selectors.messageBox).slideDown('fast');
    $(_selectors.spinner).show();
  }

  function showMessage(message) {
    $(_selectors.spinner).hide();
    $(_selectors.message).show().html(message);
  }

  function hideMessage() {
    $(_selectors.messageBox).delay(3000).fadeOut('slow');
  }

  function doUpdate() {
    if (_isUpdating) {
      return;
    }

    $(_selectors.message).show();

    const data = {
      handler: 'ugs_update_81jr',
      filename: _filename,
      song: $(_selectors.song).val(),
    };

    $.ajax({
      url: _ajaxUri,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success(data) {
        doAjaxOk(data);
      },
      error(data) {
        alert('Encountered a problem saving your Song. Please copy your song to another program until this issue is resolved.');
      },
    });
  }

  function doAjaxOk(data) {
    // if (data.HasErrors)
    showMessage(data.Message);
  }

  module.exports = {
    init,
  };
});
