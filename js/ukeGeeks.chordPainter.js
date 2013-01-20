/**
 * Draws large chord diagram grid on canvas 
 * @class chordPainter
 * @namespace ukeGeeks
 * @project UkeGeeks' Scriptasaurus 
 */
ukeGeeks.chordPainter = function(){};
ukeGeeks.chordPainter.prototype = {
	/**
	 * ukeGeeks.canvas object handle
	 * @property brush
	 * @type ukeGeeks.chordBrush instance handle
	 * @private
	 */
	brush: null,

	/**
	 * keep an array of missing chords (strings)
	 * @property errors
	 * @type array
	 * @private
	 */
	errors: [],

	handles: null,
	
	/**
	 * Again this is a constructor replacement
	 * @method init
	 * @param handles {ukeGeeks.data.htmlHandles} DOM Element object 
	 * @return {void}
	 */
	init: function(handles){
		this.brush = new ukeGeeks.chordBrush;
		this.brush.init();
		this.handles = handles;
	},
	
	/**
	 * Plots the passed in chords (array of ) by adding canvas elements inside passed DOM element.
	 * @method show
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	show: function(chords){
		this.handles.diagrams.innerHTML = '';
		this.errors = [];
		for (var i=0; i < chords.length; i++){
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				this.errors.push(chords[i]);
				continue;
			}
			this.brush.plot(this.handles.diagrams,c,ukeGeeks.settings.fretBox);
		}
	},

	/**
	 * Plots chords "inline" with the lyrics. Searches for &lt;code data-chordName=&quot;Am7&quot;&gt;&lt;/code&gt;. 
	 * When found adds canvas element and draws chord named in data-chordName attribute
	 * @method showInline
	 * @param chords {array<expandedChord>} Array of chord objects to be plotted
	 * @return {void}
	 */
	showInline: function (chords){
		var e = this.handles.text.getElementsByTagName('code');
		if (e.length < 1) return;
		for (var i=0; i < chords.length; i++){
			var c = ukeGeeks.definitions.get(chords[i]);
			if (!c){
				/* TODO: error reporting if not found */
				// this.errors.push(chords[i]);
				continue;
			}
			for (var j=0; j < e.length; j++){
				if (e[j].getAttribute('data-chordName') == c.name){
					this.brush.plot(e[j],c,ukeGeeks.settings.inlineFretBox);
				}
			}
		}
	},
	
	/**
	 * returns array of unknown chords
	 * @method getErrors
	 * @return {array}
	 */
	getErrors: function(){
		return this.errors;
	}
}
