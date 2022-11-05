/**
 * Updates an exising song via AJAX.
 * Dependencies: jQuery
 * @class updateSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.updateSong = (function () {
  /**
   * attach public members to this object
   * @property _public
   * @type JsonObject
   */
  const _public = {};

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

  _public.init = function (ajaxUri, filename) {
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
  };

  var showBusy = function () {
    $(_selectors.message).hide().html();
    $(_selectors.messageBox).slideDown('fast');
    $(_selectors.spinner).show();
  };

  const showMessage = function (message) {
    $(_selectors.spinner).hide();
    $(_selectors.message).show().html(message);
  };

  var hideMessage = function () {
    $(_selectors.messageBox).delay(3000).fadeOut('slow');
  };

  var doUpdate = function () {
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
  };

  var doAjaxOk = function (data) {
    // if (data.HasErrors)
    showMessage(data.Message);
  };

  // ---------------------------------------
  // return public interface "JSON handle"
  // ---------------------------------------
  return _public;
}());
