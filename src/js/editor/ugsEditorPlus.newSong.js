/**
 * Creates a new song via AJAX.
 * Dependencies: jQuery
 * @class newSong
 * @namespace ugsEditorPlus
 */
fdRequire.define('ugsEditorPlus/newSong', (require, module) => {
  const $ = require('jQuery');

  /**
   * lock-down the Submit (Update) button to avoid double posts;
   *  @attribute _isUpdating
   * @type {Boolean}
   */
  let _isUpdating = false;

  let _ajaxUri = '';

  function init(ajaxUri) {
    _ajaxUri = ajaxUri;

    $('#newSongBtn').click(function (e) {
      if (doValidate(this)) {
        doPost();
      }
    });

    $('#openNewDlgBtn').click((e) => {
      resetFields();
      $('#newSongForm').fadeIn();
      $('#songTitle').focus();
    });

    $('#hideNewSongBtn').click(closeDlg);

    // handle escape key
    $('#newSongForm').bind('keydown', onEscape);

    const $spinner = $('#loadingSpinner');
    $spinner.hide();
    $(document)
      .ajaxStart(() => {
        $spinner.show();
        _isUpdating = true;
      })
      .ajaxStop(() => {
        $spinner.hide();
        _isUpdating = false;
      });
  }

  function doAjaxOk(data) {
    showErrors(data.HasErrors, data.Message);
    if (data.HasErrors) {
      return;
    }
    document.location.href = data.ContinueUri;
  }

  function doPost() {
    if (_isUpdating) {
      return;
    }

    const data = {
      handler: 'ugs_new',
      songTitle: $('#songTitle').val(),
      songArtist: $('#songArtist').val(),
    };

    $.ajax({
      url: _ajaxUri,
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      success(data) {
        doAjaxOk(data);
      },
      error(data) {
        showErrors(true, 'Failed to create the song file.<br/>Please have your admin check the CPM directory permissions.');
      },
    });
  }

  function doValidate() {
    const $title = $('#songTitle');
    const title = $title.val().trim();
    $title.val(title);
    const ok = title.length > 2;
    showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later, must be at least 2 characters)</em>');
    return ok;
  }

  function showErrors(hasErrors, message) {
    const $err = $('#newSongForm .errorMessage');
    if (hasErrors) {
      $err.show().html(message);
      $('#songTitle').focus();
    } else {
      $err.hide();
    }
  }

  function closeDlg(e) {
    $('#newSongForm').fadeOut();
  }

  function resetFields() {
    $('#songTitle, #songArtist').val('');
  }

  function onEscape(e) {
    if (e.which == 27) {
      closeDlg();
    }
  }

  module.exports = {
    init,
  };
});
