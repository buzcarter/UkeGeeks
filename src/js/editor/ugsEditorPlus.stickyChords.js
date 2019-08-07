/**
 * Exposes the only method required to sticky the chords in Scriptasaurus Song-a-matic editor.
 *
 * @class stickyChords
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.stickyChords = (function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	_public.init = function() {
    // EXTREMELY IMPORTANT !
    // Init the chord container height for it to match the height of the chords canvas
    $('#ukeChordsCanvasWrapper').height($('#ukeChordsCanvas').height());
  }

  // Sticky chords at the top
  _public.onScroll = function () {
    var $chords = $('#ukeChordsCanvas');
    var thresold = $chords.position().top - $('#ugsAppToolbar').height();

    if ($(document).scrollTop() > thresold && !$chords.hasClass('chordsAlwaysOnTop'))
    {
      $chords.addClass('chordsAlwaysOnTop');
    }

    if ($(document).scrollTop() < thresold && $chords.hasClass('chordsAlwaysOnTop'))
    {
      $chords.removeClass('chordsAlwaysOnTop');
    }
  }

	// ------------------------
	// return public interface 
	// ------------------------
	return _public;

}());
