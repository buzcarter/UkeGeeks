
/**
 * Exposes the only method required for autoscrolling in Scriptasaurus Song-a-matic editor.
 *
 * @class autoscroll
 * @namespace ugsEditorPlus
 * @static
 * @singleton
 */
ugsEditorPlus.autoscroll = (function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

  var _currentScrollSpeed = 0;
  var _isPaused = true;
  var _scrollSpeeds = [200, 150, 100, 80, 60, 50, 30, 20, 10, 0];

	_public.init = function() {
    // Enable/disable autoscroll
		document.getElementById('autoscrollStateBtn').onclick = function() {
      if(_isPaused)
      {
        _isPaused = false;
        $('#autoscrollStateBtn').html('ON');
      }
      else
      {
        _isPaused = true;
        $('#autoscrollStateBtn').html('OFF');
      }

      _public.setScrollSpeed(_currentScrollSpeed);
			return false;
		};

    // Faster autoscroll
		document.getElementById('autoscrollFasterBtn').onclick = function() {
      _public.setScrollSpeed(_currentScrollSpeed + 1);
			return false;
		};

    // Slower autoscroll
		document.getElementById('autoscrollSlowerBtn').onclick = function() {
      _public.setScrollSpeed(_currentScrollSpeed - 1);
			return false;
		};

    _public.setScrollSpeed(1);
  }

  // AutoScroll magic !
  _public.autoScroll = function () {
    $(window).scrollTop($(window).scrollTop() + 1);

    // End of page ?
    if($(window).scrollTop() + $(window).height() == $(document).height())
    {
      _isPaused = true;
      _public.setScrollSpeed(_currentScrollSpeed);
    }
  }

  // Set scroll speed
  _public.setScrollSpeed = function (newScrollSpeed) {
    if(newScrollSpeed < 0)
    {
      newScrollSpeed = 0;
    }
    else if(newScrollSpeed >= _scrollSpeeds.length)
    {
      newScrollSpeed = _scrollSpeeds.length - 1;
    }

    clearInterval(window.AutoScrollTimer);
    _currentScrollSpeed = newScrollSpeed;

    if(!_isPaused)
    {
      window.AutoScrollTimer = setInterval('ugsEditorPlus.autoscroll.autoScroll()', _scrollSpeeds[_currentScrollSpeed]);
    }
  }

	// ------------------------
	// return public interface 
	// ------------------------
	return _public;

}());
