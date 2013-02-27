var ugsEditorPlus = window.ugsEditorPlus || {};

ugsEditorPlus.updateSong = (function() {
	var _ajaxUri = '';
	var _filename = '';
	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	this.init = function(ajaxUri, filename) {
		_ajaxUri = ajaxUri;
		_filename = filename;

		$('#saveBtn').click(function(event) {
			doUpdate();
			return false;
		});

		$spinner = $( "#loadingSpinner" );
		$spinner.hide();
		$(document)
			.ajaxStart(function() {
				$spinner.show();
				_isUpdating = true;
			})
			.ajaxStop(function() {
				$spinner.hide();
				_isUpdating = false;
			});
	};

var doUpdate = function() {
	if (_isUpdating){
		return;
	}

	var data = {
		'handler': 'ugs_update_81jr',
		'filename': _filename,
		'song': $('#chordProSource').val()
	};

	$.ajax({
		url: _ajaxUri,
		type: "POST",
		dataType: 'json',
		contentType:"application/json; charset=utf-8",
		data: JSON.stringify(data),
		success: function(data) {
			doAjaxOk(data);
		}
	});
};

var doAjaxOk = function(data) {
		//if (data.HasErrors)
		//	console.log(data);
		$('#sourceFeedback').html(data.Message);
	};

	return this;
})();