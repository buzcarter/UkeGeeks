/**
 * Delete an exising song via AJAX.
 * Dependencies: jQuery
 * @class deleteSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.deleteSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _ajaxUri = '';
	var _filename = '';

	/**
	 * Name / Value pairs for jQuery selectors of HTML elements to be manipulated
	 * @property _selectors
	 * @type {JSON}
	 */
	var _selectors = {
		messageBox : '#messageBox',
		message : '#sourceFeedback',
		button : '#deleteBtn',
		spinner : '#loadingSpinner',
		song : '#chordProSource'
	};

	/**
	 * lock-down the Submit (delete) button to avoid double posts;
	 * @property _isDeleting
	 * @type {Boolean}
	 */
	var _isDeleting = false;

	_public.init = function(ajaxUri, filename) {
		_ajaxUri = ajaxUri;
		_filename = filename;

		$(_selectors.button).click(function(event) {
      if( !confirm( "Do you REALLY want to DELETE this song ?" ) ) {  return false; }
			doDelete();
			return false;
		});

		$(_selectors.messageBox).hide();
		$(document)
			.ajaxStart(function() {
				showBusy();
				_isDeletinh = true;
			})
			.ajaxStop(function() {
				hideMessage();
				_isDeleting = false;
			});
	};

	var showBusy = function(){
		$(_selectors.message).hide().html();
		$(_selectors.messageBox).slideDown('fast');
		$(_selectors.spinner).show();
	};

	var showMessage = function(message){
		$(_selectors.spinner).hide();
		$(_selectors.message).show().html(message);
	};

	var hideMessage = function(){
		$(_selectors.messageBox).delay(3000).fadeOut('slow');
	};

	var doDelete = function() {
		if (_isDeleting){
			return;
		}

		$(_selectors.message).show();

		var data = {
			'handler': 'ugs_delete_49fz',
			'filename': _filename,
			'song': $(_selectors.song).val()
		};

		$.ajax({
			url: _ajaxUri,
			type: 'POST',
			dataType: 'json',
			contentType:"application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function(data) {
				doAjaxOk(data);
			},
			error: function(data) {
				alert('Encountered a problem deleting your Song.');
			}
		});
	};

	var doAjaxOk = function(data) {
		if (!data.HasErrors)
    {
      document.location.href = '/';
    }
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();
