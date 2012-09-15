/**
 * Finds page HTML elements & creates ukeGeek objects;
 * Reads song text, parses, draws choard diagrams.
 * 
 * @class scriptasaurus
 * @namespace ukeGeeks
 * @static
 */
ukeGeeks.scriptasaurus = new function(){
	/**
	 * Preps this class for running
	 * @method init
	 * @param isIeFamily {bool} TRUE if UserAgent (Browser to you and me) is Internet Explorer
	 * @return {void}
	 */
	this.init = function(isIeFamily){
		ukeGeeks.settings.environment.isIe = isIeFamily;
	};
	

	/**
	 * Runs all Scriptasaurus methods. This is your "Do All". See data.song for structure.
	 * @method run
	 * @param offset {int} (optional) default 0. Number of semitones to shift the tuning. See ukeGeeks.definitions.instrument.
	 * @return {songObject}
	 */
	this.run = function(offset){
		console.log('run (Classic Mode)');
		var offset = (arguments.length > 0) ? arguments[0] : ukeGeeks.definitions.instrument.sopranoUke;
		var node = _makeNodeById();
		if (!node.diagrams || !node.text || !node.wrap) {
			return null;
		}
		_runSong(node);
	};
	
	// =================================================================
	this.runByClasses = function(){
		console.log('runByClasses');
		var songWraps = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.wrap);
		console.log(songWraps);
		for(var i = 0; i < songWraps.length; i++){
			console.log('running loop: '+ i);
			var node = _makeNodeByClass(songWraps[i]);
			if (node == null){
				console.log('problem with nodes');
				continue;
			}
			//addCanvas(preTags[i]);
			_runSong(node);
		}
	};
	
	// =================================================================
	var _runSong = function(nodes){
		console.log('run Song');
		var offset = ukeGeeks.definitions.instrument.sopranoUke;//(arguments.length > 0) ? arguments[0] : ukeGeeks.definitions.instrument.sopranoUke;
	
		ukeGeeks.definitions.useInstrument(offset);
		
		// read Music, find chords, generate HTML version of song:
		var cpm = new ukeGeeks.cpmParser;
		cpm.init();
		var song = cpm.parse(nodes.text.innerHTML);
		ukeGeeks.definitions.replace(song.defs);
	
		var chrdPrsr = new ukeGeeks.chordParser;
		chrdPrsr.init();
		nodes.text.innerHTML = chrdPrsr.parse(song.body);
		var chordsInUse = chrdPrsr.getChords();
	
		// Draw the Chord Diagrams:
		var painter = new ukeGeeks.chordPainter;
		painter.init(nodes);
		painter.show(chordsInUse);
		// Show chord diagrams inline with lyrics
		if (true || ukeGeeks.settings.inlineDiagrams){
			ukeGeeks.toolsLite.addClass(nodes.wrap, 'ugsInlineDiagrams');
			painter.showInline(chordsInUse);
		}
	
		// Do Tablature:
		var tabs = new ukeGeeks.tabs;
		tabs.init();
		tabs.replace(nodes.text);
		
		// error reporting:
		//showErrors(painter.getErrors());
		
		var container = nodes.wrap;
		if (container){
			if (!song.hasChords){
				ukeGeeks.toolsLite.addClass(container, 'ugsNoChords');
			}
			else{
				ukeGeeks.toolsLite.removeClass(container, 'ugsNoChords');
			}
		}

		// done!
		return song;
	};
	
	var _makeNodeByClass = function(wrap){
		var diagrams = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.diagrams, wrap);
		var text = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.text, wrap);
		if ((diagrams == undefined) || (diagrams.length < 1) || (text == undefined) || (text.length < 1)){
			return null;
		}
		var node = 
		{
			wrap : wrap,
			diagrams : diagrams[0],
			text : text[0]
		};
		return node;
	};

	var _makeNodeById = function(){
		var node = 
		{
			wrap : document.getElementById(ukeGeeks.settings.ids.container),
			diagrams : document.getElementById(ukeGeeks.settings.ids.canvas),
			text : document.getElementById(ukeGeeks.settings.ids.songText)
		};
		return node;
	}
}
