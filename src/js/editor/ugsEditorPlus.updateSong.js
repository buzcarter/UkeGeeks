/**
 * Updates an exising song via AJAX.
 * Dependencies: ugsEditorPlus.dom

 * @class updateSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.updateSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var _ajaxUri = '';
	var _filename = '';

	/**
	 * Name / Value pairs for CSS selectors of HTML elements to be manipulated
	 * @property _selectors
	 * @type {JSON}
	 */
	var _selectors = {
		messageBox : '#messageBox',
		message : '#sourceFeedback',
		button : '#saveBtn',
		spinner : '#loadingSpinner',
		song : '#chordProSource'
	};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 * @property _isUpdating
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	_public.init = function(ajaxUri, filename) {
		_ajaxUri = ajaxUri;
		_filename = filename;

		ugsEditorPlus.dom.on(_selectors.button, 'click', function(e) {
			e.preventDefault();
			doUpdate();
		});

		ugsEditorPlus.dom.hide(ele('messageBox'));
	};

	/**
	 * pending "fade out the message" timer
	 * @property _hideTimer
	 * @type {Number}
	 */
	var _hideTimer = null;

	var ele = function(name) {
		return ugsEditorPlus.dom.one(_selectors[name]);
	};

	var showBusy = function(){
		var dom = ugsEditorPlus.dom;
		clearTimeout(_hideTimer);
		dom.hide(ele('message'));
		if (dom.isVisible(ele('messageBox'))) {
			// still showing (or fading out) the last message
			dom.show(ele('messageBox'));
		}
		else {
			dom.slideDown(ele('messageBox'), 'fast');
		}
		dom.show(ele('spinner'));
	};

	var showMessage = function(message){
		var msg = ele('message');
		ugsEditorPlus.dom.hide(ele('spinner'));
		msg.textContent = message;
		ugsEditorPlus.dom.show(msg);
	};

	var hideMessage = function(){
		clearTimeout(_hideTimer);
		_hideTimer = setTimeout(function() {
			ugsEditorPlus.dom.fadeOut(ele('messageBox'), 'slow');
		}, 3000);
	};

	var doUpdate = function() {
		if (_isUpdating){
			return;
		}

		var data = {
			'handler': 'ugs_update_81jr',
			'filename': _filename,
			'song': ele('song').value
		};

		_isUpdating = true;
		showBusy();
		ugsEditorPlus.dom.postJson(_ajaxUri, data)
			.then(function(data) {
				doAjaxOk(data);
			}, function() {
				alert('Encountered a problem saving your Song. Please copy your song to another program until this issue is resolved.');
			})
			.then(function() {
				hideMessage();
				_isUpdating = false;
			});
	};

	var doAjaxOk = function(data) {
		//if (data.HasErrors)
		showMessage(data.Message);
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();