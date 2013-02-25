var ugsEditorPlus = window.ugsEditorPlus || {};

ugsEditorPlus.updateSong = (function() {
	var _ajaxUri = '';
	var _filename = '';

	this.init = function(ajaxUri, filename) {
		_ajaxUri = ajaxUri;
		_filename = filename;

		$('#saveBtn').click(function(event) {
			doUpdate();
			return false;
		});
	};

	var doUpdate = function() {
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