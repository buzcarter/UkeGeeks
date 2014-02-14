/**
 * Handles transfering the easy text bits of a Song -- title, artist, etc -- to the page.
 * @class songUi
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.songUi = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * Sets an element's Inner HTML and sets visibility based on whether the value is empty (or not)
	 * @method trySet
	 * @private
	 * @param id {string} element's Id
	 * @param value {string} content value
	 */
	var trySet = function(id, value){
		var hasValue = value && (value.length > 0);
		var h = document.getElementById(id);
		if (!h){
			return;
		}
		h.innerHTML = hasValue ? value : "";
		h.style.display = hasValue ? 'block' : 'none';
	};

 /**
	 * Update various HTML parts (H1 &amp; H2 etc.) using TEXT values of Song
	 * @method updateUi
	 * @private
	 * @param song {Song(Object)}
	 */
	_public.update = function(song){
		var h = document.getElementById('songTitle');
		h.innerHTML = (song.title.length > 0) ? song.title : 'Untitled-Song';

		trySet('songArtist', song.artist);
		trySet('songAlbum', song.album);
		trySet('songSubtitle', song.st);

		h = document.getElementById('songMeta');
		if (!song.ugsMeta || (song.ugsMeta.length < 1)){
			h.style.display = 'none';
		}
		else {
			var s = '';
			for(var i = 0; i < song.ugsMeta.length; i++){
				s += '<p>' + song.ugsMeta[i] + '</p>';
			}
			h.innerHTML = s;
			h.style.display = 'block';
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}()
);
