/**
 * Creates a new song via AJAX.
 * Dependencies: ugsEditorPlus.dom

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

		var dom = ugsEditorPlus.dom;

		dom.on('#newSongBtn', 'click', function(e) {
			if(doValidate(this)) {
				doPost();
			}
		});

		dom.on('#openNewDlgBtn', 'click', function(e) {
			resetFields();
			dom.fadeIn(document.getElementById('newSongForm'));
			document.getElementById('songTitle').focus();
		});

		dom.on('#hideNewSongBtn', 'click', closeDlg);

		// handle escape key
		dom.on('#newSongForm', 'keydown', onEscape);

		dom.hide(document.getElementById('loadingSpinner'));

		var dlg = document.getElementById('newSongForm');
		if (dlg) {
			dom.draggable(dlg, 'hgroup');
		}
	};

	/**
	 * shows/hides the "Saving..." spinner, (un)locks the form
	 * @method setBusy
	 * @param isBusy {bool}
	 */
	var setBusy = function(isBusy) {
		_isUpdating = isBusy;
		ugsEditorPlus.dom.toggle(document.getElementById('loadingSpinner'), isBusy);
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
				'songTitle': document.getElementById('songTitle').value,
				'songArtist': document.getElementById('songArtist').value
			};

			setBusy(true);
			ugsEditorPlus.dom.postJson(_ajaxUri, data)
				.then(function(data) {
					setBusy(false);
					doAjaxOk(data);
				}, function() {
					setBusy(false);
					showErrors(true, 'Failed to create the song file.\nPlease have your admin check the CPM directory permissions.');
				});
		};

	var doValidate = function() {
		var titleInput = document.getElementById('songTitle');
		var title = titleInput.value.trim();
		titleInput.value = title;
		/*
		var ok = title.length > 2;
		showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later, must be at least 2 characters)</em>');
		return ok;
		*/
		return true;
	};

	var showErrors = function(hasErrors, message) {
		var err = ugsEditorPlus.dom.one('#newSongForm .errorMessage');
		if(hasErrors) {
			// plain text (the message may echo back what the user typed); newlines become line breaks
			err.textContent = '';
			String(message).split('\n').forEach(function(line, i) {
				if (i > 0) {
					err.appendChild(document.createElement('br'));
				}
				err.appendChild(document.createTextNode(line));
			});
			ugsEditorPlus.dom.show(err);
			document.getElementById('songTitle').focus();
		}
		else {
			ugsEditorPlus.dom.hide(err);
		}
		};

	var closeDlg = function(e) {
		if (e && e.type == 'click') {
			e.preventDefault();
		}
		ugsEditorPlus.dom.fadeOut(document.getElementById('newSongForm'));
	};

	var resetFields = function(){
		document.getElementById('songTitle').value = '';
		document.getElementById('songArtist').value = '';
	};

	var onEscape = function(e){
		if (e.key == 'Escape' || e.keyCode == 27) {
			closeDlg();
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();
