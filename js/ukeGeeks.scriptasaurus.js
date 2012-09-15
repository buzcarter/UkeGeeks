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
	
	// =================================================================
	this.run = function(){
		console.log('run');
		var songWraps = ukeGeeks.toolsLite.getElementsByClass(ukeGeeks.settings.wrapClasses.wrap);
		console.log(songWraps);
		for(var i = 0; i < songWraps.length; i++){
			console.log('running loop: '+ i);
			var nodes = _makeNode(songWraps[i]);
			if (nodes == null){
				console.log('problem with nodes');
				continue;
			}
			//addCanvas(preTags[i]);
			runOnce(nodes);
		}
	//var h = document.getElementById(ukeGeeks.settings.ids.songText);
	//if (!h) return null;
	};
	
	// =================================================================
	var runOnce = function(nodes){
		console.log('runOnce');
		console.log(nodes.wrap);
		console.log(nodes.diagrams);
		console.log(nodes.text);
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
	
	var _makeNode = function(wrap){
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
}
