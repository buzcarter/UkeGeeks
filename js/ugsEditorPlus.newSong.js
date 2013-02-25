var ugsEditorPlus = window.ugsEditorPlus || {};

ugsEditorPlus.newSong = (function() {
	var _ajaxUri = '';

	this.init = function(ajaxUri) {
		_ajaxUri = ajaxUri;

		$('#newSongBtn').click(function(e) {
			if(doValidate(this)) {
				doPost();
			}
		});

		$('#openNewDlgBtn').click(function(e) {
			$('#newSongForm').fadeIn();
			$('#songTitle').focus();
		});

		$('#hideNewSongBtn').click(function(e) {
			$('#newSongForm').fadeOut();
		});
	};

	var doAjaxOk = function(data) {
			showErrors(data.HasErrors, data.Message);
			if(data.HasErrors) {
				return;
			}
			document.location.href = data.ContinueUri;
		};

	var doPost = function() {
			var data = {
				'handler': 'ugs_new',
				'songTitle': $('#songTitle').val(),
				'songArtist': $('#songArtist').val()
			};

			$.ajax({
				url: _ajaxUri,
				type: "POST",
				dataType: 'json',
				data: data,
				success: function(data) {
					doAjaxOk(data);
				}
			});
		};

	var doValidate = function() {
			var title = $('#songTitle').val();
			var ok = title.length > 0;
			showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later)</em>');
			return ok;
		};

	var showErrors = function(hasErrors, message) {
			var $err = $('#newSongForm .errorMessage');
			if(hasErrors) {
				$err.show().html(message);
				$('#songTitle').focus();
			} else {
				$err.hide();
			}
		};

	return this;
})();