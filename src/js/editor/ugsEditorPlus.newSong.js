/**
 * Creates a new song via AJAX.
 * Dependencies: jQuery
 * @class newSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.newSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 *  @attribute _isUpdating
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	var _ajaxUri = '';

	_public.init = function(ajaxUri) {
		_ajaxUri = ajaxUri;

		$('#newSongBtn').click(function(e) {
			if(doValidate(this)) {
				doPost();
			}
		});

		$('#openNewDlgBtn').click(function(e) {
			resetFields();
			$('#newSongForm').fadeIn();
			$('#songTitle').focus();
		});

		$('#hideNewSongBtn').click(closeDlg);

		// handle escape key
		$('#newSongForm').bind('keydown', onEscape);

		var $spinner = $("#loadingSpinner");
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

	var doAjaxOk = function(data) {
			showErrors(data.HasErrors, data.Message);
			if(data.HasErrors) {
				return;
			}
			document.location.href = data.ContinueUri;
		};

	var doPost = function() {
			if (_isUpdating){
				return;
			}

			var data = {
				'handler': 'ugs_new',
				'songTitle': $('#songTitle').val(),
				'songArtist': $('#songArtist').val()
			};

			$.ajax({
				url: _ajaxUri,
				type: "POST",
				dataType: 'json',
				data: JSON.stringify(data),
				success: function(data) {
					doAjaxOk(data);
			},
			error: function(data) {
				showErrors(true, 'Failed to create the song file.<br/>Please have your admin check the CPM directory permissions.');
				}
			});
		};

	var doValidate = function() {
		var $title = $('#songTitle');
		var title = $title.val().trim();
		$title.val(title);
		var ok = title.length > 2;
		showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later, must be at least 2 characters)</em>');
		return ok;
	};

	var showErrors = function(hasErrors, message) {
			var $err = $('#newSongForm .errorMessage');
			if(hasErrors) {
				$err.show().html(message);
				$('#songTitle').focus();
		}
		else {
				$err.hide();
			}
		};

	var closeDlg = function(e) {
		$('#newSongForm').fadeOut();
	};

	var resetFields = function(){
		$('#songTitle, #songArtist').val('');
	};

	var onEscape = function(e){
		if (e.which == 27) {
			closeDlg();
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();