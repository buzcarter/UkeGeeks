/**
 * Draws large chord diagram grid on canvas
 * @class chordPainter
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus
 */
ukeGeeks.chordPainter = function(){

	/**
	 * attach public members to this object
	 * @type {Object}
	 */
	var publics = {};

	/**
	 * ukeGeeks.canvas object handle
	 * @property brush
	 * @type ukeGeeks.chordBrush instance handle
	 * @private
	 */
	var brush = null;

	/**
	 * keep an array of missing chords (strings)
	 * @property errors
	 * @type array
	 * @private
	 */
	var errors = [];

	var handles = null;

	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @param htmlHandles {ukeGeeks.data.htmlHandles} DOM Element object
	 * @return {void}
	 */
	publics.init = function(htmlHandles){
		brush = new ukeGeeks.chordBrush;
		brush.init();
		handles = htmlHandles;
	};

	var	ignoreMatchList = [];

		/**
		 * Checks whether speicified chord (name) is on the ignore list.
		 * @param  {string} chord Chord name
		 * @return {boolean}	return TRUE if "chord" is on ignore list.
		 */
	var ignoreChord = function(chord){
		for (var i = 0; i < ukeGeeks.settings.commonChords.length; i++) {
			if (chord == ukeGeeks.settings.commonChords[i]){
				return true;
			}
		};
		return false;
	};

	/**
	 * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
	 * @method show
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	publics.show = function(chords){
		handles.diagrams.innerHTML = '';
		errors = [];
		ignoreMatchList = [];
		for (var i=0; i < chords.length; i++){
			if (ukeGeeks.settings.ignoreCommonChords && ignoreChord(chords[i])){
				ignoreMatchList.push(chords[i]);
				continue;
			}
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				errors.push(chords[i]);
				continue;
			}
			brush.plot(handles.diagrams,c,ukeGeeks.settings.fretBox);
		}
		// console.log(ignoreMatchList);
	};

	/**
	 * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;.
	 * When found adds canvas element and draws chord named in data-chordName attribute
	 * @method showInline
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	publics.showInline = function (chords){
		var e = handles.text.getElementsByTagName('code');
		if (e.length < 1) return;
		for (var i=0; i < chords.length; i++){
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				/* TODO: error reporting if not found */
				// errors.push(chords[i]);
				continue;
			}
			for (var j=0; j < e.length; j++){
				if (e[j].getAttribute('data-chordName') == c.name){
					brush.plot(e[j],c,ukeGeeks.settings.inlineFretBox);
				}
			}
		}
	};

	/**
	 * returns array of unknown chords
	 * @method getErrors
	 * @return {array}
	 */
	publics.getErrors = function(){
		return errors;
	};

	/**
	 * List of chords excluded from the master chord diagrams
	 * @method getIgnoredChords
	 * @return {array} array of strings
	 */
	publics.getIgnoredChords = function(){
		return ignoreMatchList;
	};

	/* return our public interface
	 *
	 */
	return publics;
}
