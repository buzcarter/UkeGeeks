/**
 * Reads a text block and returns an object containing whatever ChordPro elements it recognizes.
 * 
 * A cleaned, HTML version of song is included.
 *
 * @class cpmParser
 * @namespace ukeGeeks
 */
ukeGeeks.cpmParser = function(){};
ukeGeeks.cpmParser.prototype = {
	/**
	* While debugging this prevents run-away (infinite) loops. Pseudo-constant.
	* @property runaway
  * @private 
	* @type int
	*/
	runaway: 30,
	
	/**
	* Number of columns defined
	* @property columnCount
  * @private 
	* @type int
	*/
	columnCount: 1,
	
	/**
	* Under development, bool indicating whether any chords were found within the lyrics. 
	* Helpful for tablature-only arrangements.
	* TODO: do not rely on this!!!
	* @property hasChords
  * @private 
	* @type bool
	*/
	hasChords: false, // TODO: 
	
	/**
	 * Again this is a constructor replacement. Just here for consistency. Does nothing.
	 * @method init
	 * @return {void}
	 */
	init: function(){
	},

	/**
	 * Accepts CPM text, returning HTML marked-up text 
	 * @method parse
	 * @param text {string} string RAW song
	 * @return {songObject}
	 */
	parse: function(text){
		var song = new ukeGeeks.data.song;
		text = this._stripHtml(text);
		var songDom = this._domParse(text);
		songDom = this._parseInstr(songDom);
		songDom = this._parseSimpleInstr(songDom);
		songDom = this._markChordLines(songDom);
		song.body = this._export(songDom);
		if (this.columnCount > 1){
			song.body = '<div class="' + this.classNames.ColumnWrap + ' ' + this.classNames.ColumnCount + this.columnCount + '">' 
			+ '<div class="' + this.classNames.Column + '">'
			+ song.body
			+ '</div>'
			+ '</div>';
		}
		song.hasChords = this.hasChords;
		var tmp;
		// Song Title
		tmp = this._getInfo(songDom, this.blockTypeEnum.Title);
		if (tmp.length > 0){
			song.title = tmp[0];
		}
		// Artist
		tmp = this._getInfo(songDom, this.blockTypeEnum.Artist);
		if (tmp.length > 0){
			song.artist = tmp[0];
		}
		// Song Subtitle
		tmp = this._getInfo(songDom, this.blockTypeEnum.Subtitle);
		if (tmp.length > 0){
			song.st = tmp[0];
		}
		if (tmp.length > 1){
			song.st2 = tmp[1];
		}
		// Album
		tmp = this._getInfo(songDom, this.blockTypeEnum.Album);
		if (tmp.length > 0){
			song.album = tmp[0];
		}
		// UkeGeeks "Extras"
		tmp = this._getInfo(songDom, this.blockTypeEnum.UkeGeeksMeta);
		if (tmp.length > 0){
			song.ugsMeta = tmp;
		}
		// Chord Definitions
		tmp = this._getInfo(songDom, this.blockTypeEnum.ChordDefinition);
		if (tmp.length > 0){
			for(var i in tmp){
				song.defs.push(ukeGeeks.chordImport.runLine('{define: ' + tmp[i] + '}'));
			}
		}
		return song;
	},
	
	/*
		TODO: add ukeGeeks Meta support:
		$regEx = "/{(ukegeeks-meta|meta)\s*:\s*(.+?)}/i";
	*/
	regEx : {
		blocks : /\s*{\s*(start_of_tab|sot|start_of_chorus|soc|end_of_tab|eot|end_of_chorus|eoc)\s*}\s*/im,
		tabBlock : /\s*{\s*(start_of_tab|sot)\s*}\s*/im,
		chorusBlock : /\s*{\s*(start_of_chorus|soc)\s*}\s*/im
	},

	/**
	* All of the CSS classnames used by UkeGeeks JavaScript
	* @property classNames
	* @private
	* @type JSON 
	*/
	classNames : {
		Comment: 'ugsComment',
		Tabs: 'ugsTabs',
		Chorus: 'ugsChorus',
		PreChords: 'ugsChords', // preformatted with chords
		PrePlain: 'ugsPlain', // preformated, no chords
		NoLyrics: 'ugsNoLyrics', // preformated, chords ONLY -- no lyrics (text) between 'em
		ColumnWrap: 'ugsWrap',
		ColumnCount: 'ugsColumnCount',
		Column: 'ugsColumn'
	},
	
	/**
	* Enumeration defining the types of nodes used within this class to parse CPM
	* @property blockTypeEnum
	* @private
	* @type JSON-enum 
	*/
	blockTypeEnum: {
		// Multiline Nodes
		TextBlock: 1, // temporary type, should be replaced with Chord Text or Plain Text
		ChorusBlock: 2,
		TabBlock: 3,
		// Single Line "Instruction" Nodes
		Comment: 101,
		Title: 102,
		Subtitle: 103,
		Album: 104,
		ChordDefinition: 105,
		UkeGeeksMeta: 106,
		ColumnBreak: 107, // Defining this as an instruction instead of a node since I'm not requiring a Begin/End syntax and it simplifies processing
		Artist: 108,
		// Text Types
		ChordText: 201,
		PlainText: 202,
		ChordOnlyText: 203, // 
		// Undefined
		Undefined: 666
	},
	
	/**
	 * Retuns the block type (blockTypeEnum) of passed in line. 
	 * @method _getBlockType
	 * @private
	 * @param line {songNode} 
	 * @return {blockTypeEnum} 
	 */
	_getBlockType: function(line){
		// TODO: verify line's type in documentation
		if (this.regEx.chorusBlock.test(line)){
			return this.blockTypeEnum.ChorusBlock;
		}
		else if (this.regEx.tabBlock.test(line)){
			return this.blockTypeEnum.TabBlock;
		}
		return this.blockTypeEnum.TextBlock;
	},
	
	/**
	 * Convert passed in song to HTML block
	 * @method _export
	 * @private
	 * @param song {songNodeArray} 
	 * @return {strings} 
	 */
	_export: function(song){
		var nl = "\n";
		var html = '';
		for (var i=0; i < song.length; i++){
			/*
			if (song[i].type == this.blockTypeEnum.Title){
				html += '<h1>' + song[i].lines[0] + '</h1>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.Subtitle){
				html += '<h2>' + song[i].lines[0] + '</h2>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.Album){
				html += '<h3 class="ugsAlbum">' + song[i].lines[0] + '</h3>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.UkeGeeksMeta){
				html += '<h3>' + song[i].lines[0] + '</h3>' + nl;
			}
			else 
			*/
			if (song[i].type == this.blockTypeEnum.Comment){
				html += '<h6 class="' + this.classNames.Comment + '">' + song[i].lines[0] + '</h6>' + nl;
			}
			else if ((song[i].type == this.blockTypeEnum.ChordText) || (song[i].type == this.blockTypeEnum.PlainText ) || (song[i].type == this.blockTypeEnum.ChordOnlyText)){
				// TODO: beware undefined's!!!
				// Repack the text, only open/close <pre> tags when type changes
				// problem: exacerbates WebKit browsers' first chord position bug.
				var myClass = (song[i].type == this.blockTypeEnum.PlainText) ? this.classNames.PrePlain : this.classNames.PreChords;
				if (song[i].type == this.blockTypeEnum.ChordOnlyText){
					myClass += ' ' +this.classNames.NoLyrics;
				}
				var myType = song[i].type;
				var lastType = ((i - 1) >= 0) ? song[i - 1].type : this.blockTypeEnum.Undefined;
				var nextType = ((i + 1) < song.length) ? nextType = song[i + 1].type : this.blockTypeEnum.Undefined;
				html += (lastType != myType) ? ('<pre class="' + myClass + '">') : nl;
				html += song[i].lines[0];
				html += (nextType != myType) ? ('</pre>' + nl) : '';
			}
			else if (song[i].type == this.blockTypeEnum.ChorusBlock){
				html += '<div class="' + this.classNames.Chorus + '">' + nl;
				html += this._export(song[i].lines);
				html += '</div>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.TabBlock){
				html += '<pre class="' + this.classNames.Tabs + '">';
				for (var j in song[i].lines){
					html += song[i].lines[j] + nl;
				}
				html += '</pre>' + nl;
			}
			else if (song[i].type == this.blockTypeEnum.TextBlock){
				html += this._export(song[i].lines);
			}
			else if (song[i].type == this.blockTypeEnum.ColumnBreak){
				html += '</div><div class="' + this.classNames.Column + '">' ;
			}
			else{
		}
		}
		return html;
	},

	/**
	 * Debugging tool for Firebug. Echos the song's structure.
	 * @method _echo
	 * @private
	 * @param song {songNodeArray} 
	 * @return {void} 
	 */
	_echo: function(song){
		for (var i in song){
			console.log('>> '+i + '. ' + song[i].type + ' node, '+song[i].lines.length +' lines');
			for (var j in song[i].lines){
				console.log(song[i].lines[j]);
			}
		}
	},
		
	/**
	 * Explodes passed in text block into an array of songNodes ready for further parsing.
	 * @method _domParse
	 * @private
	 * @param text {string} 
	 * @return {songNodeArray} 
	 */
	_domParse: function(text){
		// var ezBlock = function(){};
		var lines = text.split('\n');
		var song = [];
		var tmpBlk = null;
		var isMarker; // block marker
		for (var i in lines){
			isMarker = this.regEx.blocks.test(lines[i]);
			if (isMarker || tmpBlk == null){
				// save last block, start new one...
				if (tmpBlk != null){
					song.push(tmpBlk);
				}
				tmpBlk = {
					type: this._getBlockType(lines[i]),
					lines : []
				};
				if (!isMarker){
					// Don't miss that first line!
					tmpBlk.lines.push(lines[i]);
				}
			}
			else{
				var s = ukeGeeks.toolsLite.trim(lines[i]);
				if (s.length > 0){
					tmpBlk.lines.push(s);
				}
			}
		}
		if (tmpBlk.lines.length > 0){
			song.push(tmpBlk);
		}
		return song;
	},

	/**
	 * Goes through songNodes, those nodes that are "instructions" are exploded and 
	 * a "the resulting "songDomElement" built, this songDomElement then replaces the 
	 * original line. 
	 * 
	 * The regular expression look for instructions with this format: 
	 * {commandVerb: commandArguments}
	 * 
	 * @method _parseInstr
	 * @private
	 * @param song {songNodeArray} 
	 * @return {songNodeArray} 
	 */
	_parseInstr: function(song){
		var regEx = {
			instr : /\{[^}]+?:.*?\}/im,
			cmdArgs : /\{.+?:(.*)\}/gi,
			cmdVerb : /\{(.+?):.*\}/gi
		};
		for (var i in song){
			for (var j in song[i].lines){
				if (regEx.instr.test(song[i].lines[j])){
					var args = song[i].lines[j].replace(regEx.cmdArgs,'$1');
					var verb = song[i].lines[j].replace(regEx.cmdVerb,'$1').toLowerCase();
					var tmpBlk = {
						type: '',
						lines : []
					};
					switch (verb){
						case 'title':
						case 't':
							tmpBlk.type = this.blockTypeEnum.Title;
							break;
						case 'artist':
							tmpBlk.type = this.blockTypeEnum.Artist;
							break;
						case 'subtitle':
						case 'st':
							tmpBlk.type = this.blockTypeEnum.Subtitle;
							break;
						case 'album':
							tmpBlk.type = this.blockTypeEnum.Album;
							break;
						case 'comment':
						case 'c':
							tmpBlk.type = this.blockTypeEnum.Comment;
							break;
						case 'define':
							tmpBlk.type = this.blockTypeEnum.ChordDefinition;
							break;
						case 'ukegeeks-meta':
							tmpBlk.type = this.blockTypeEnum.UkeGeeksMeta;
							break;
						default:
							tmpBlk.type = 'Undefined-'+verb;
							break;
					}
					tmpBlk.lines[0] = ukeGeeks.toolsLite.trim(args);
					song[i].lines[j] = tmpBlk;
				}
			}
		}
		return song;
	},
	
	/**
	 * A "Simple Instruction" is one that accepts no arguments. Presently this only handles Column Breaks.
	 * @method _parseSimpleInstr
	 * @private
	 * @param song {songNodeArray} 
	 * @return {songNodeArray} 
	 */
	_parseSimpleInstr: function(song){
		var regEx = {
			columnBreak : /\s*{\s*(column_break|colb)\s*}\s*/im
		};
		for (var i in song){
			for (var j in song[i].lines){
				if (regEx.columnBreak.test(song[i].lines[j])){
					this.columnCount++;
					song[i].lines[j] = {
						type: this.blockTypeEnum.ColumnBreak,
						lines : []
					};
				}
			}
		}
		return song;
	},

	/**
	 * Runs through songNodes and if the line contains at least one chord it's type is et to 
	 * ChordText, otherwise it's marked as "PlainText", meaning straight lyrics
	 * @method _markChordLines
	 * @private
	 * @param song {songNodeArray} 
	 * @return {songNodeArray} 
	 */
	_markChordLines: function(song){
		var regEx = {
			chord : /\[(.+?)]/i,
			allChords : /\[(.+?)]/img
		};
		
		var hasChrd;
		var isChrdOnly;
		var line;
		for (var i in song){
			if (song[i].type == this.blockTypeEnum.TextBlock || song[i].type == this.blockTypeEnum.ChorusBlock){
				for (var j in song[i].lines){
					line = song[i].lines[j];
					if (typeof(line) == 'string'){
						hasChrd = regEx.chord.test(line);
						this.hasChords = this.hasChords || hasChrd;
						isChrdOnly = hasChrd && (ukeGeeks.toolsLite.trim(line.replace(regEx.allChords, '')).length < 1);
						// need to find
						song[i].lines[j] = {
							type: (isChrdOnly ? this.blockTypeEnum.ChordOnlyText
								: (hasChrd ? this.blockTypeEnum.ChordText : this.blockTypeEnum.PlainText)), 
							lines : [line]
						};
					}
				}
			}
		}
		return song;
	},
	
	/**
	 * Searches the songNodes for the specified block type, retunrs all matching node line (text) values.
	 * @method _getInfo
	 * @private
	 * @param song {songNodeArray} 
	 * @param type {blockTypeEnum} 
	 * @return {array} 
	 */
	_getInfo: function(song, type){
		var rtn = [];
		for (var i in song){
			if (song[i].type == type){
				rtn.push(song[i].lines[0]);
			}
			else if (song[i].type == this.blockTypeEnum.TextBlock){
				for (var j in song[i].lines){
					if (song[i].lines[j].type == type){
						rtn.push(song[i].lines[j].lines[0]);
					}
				}
			}
		}
		return rtn;
	},
	
	/**
	 * Removes HTML "pre" tags and comments.
	 * @method _stripHtml
	 * @private
	 * @param text {string} 
	 * @return {string} 
	 */
	_stripHtml: function(text){
		var regEx = {
			pre : /<\/?pre>/img, // HTML <pre></pre>
			htmlComment : /<!--(.|\n)*?-->/gm // HTML <!-- Comment -->
		};
		return text.replace(regEx.pre, '').replace(regEx.htmlComment, '');
	}

};
