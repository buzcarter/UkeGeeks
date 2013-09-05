/**
 *
 * Dependencies: jQuery & ugsChordBuilder classes
 * @class chordBuilder
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.chordBuilder = (function() {
	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var _public = {};

	var _builder = null;

	_public.init = function() {
		_builder = new ugsChordBuilder.editorUi();
		_builder.init();

		$('#cdBldOpenBtn').click(onShowDlgBtnClick);
	};

	var onShowDlgBtnClick = function(evt){
		evt.preventDefault();
		_builder.reload();
		var id = $(this).data('dialog');
		$('#' + id).fadeIn();
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());