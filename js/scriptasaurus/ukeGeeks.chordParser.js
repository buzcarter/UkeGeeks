/**
 * Reads an HTML (text) block looking for chords in format: [Emaj7]
 * Returns the HTML block with wrapped chords: &lt;code&gt;&lt;strong&gt;&lt;em&gt; 
 * @class chordParser
 * @namespace ukeGeeks
 */
ukeGeeks.chordParser = function() {

	/**
	 * attach public members to this object
	 * @property _public
	 * @type {Object}
	 */
	var _public = {};

	var _chords = [];

	/////////////////////////////////////////////////////////////////////////////
	//
	// PUBLIC methods
	//
	/////////////////////////////////////////////////////////////////////////////
	/**
	 * Again this is a constructor replacement. Just here for consistency. Does nothing.
	 * @method init
	 * @return {void}
	 */
	_public.init = function() {};

	/**
	 * This does all of the work -- it's a Wrapper method that calls all of this classes other 
	 * (private) methods in correct order.
	 * @method parse
	 * @param text {string} CPM Text Block to be parsed
	 * @return {string}
	 */
	_public.parse = function(text) {
		_chords = _findChords(text);
		text = _encloseChords(text, _chords);
		text = _packChords(text);
		return text;
	};
	
	/**
	 * Getter method for _chords
	 * @method getChords
	 * @return {Array-chords}
	 */
	_public.getChords = function() {
		return _chords;
	};
	
	/////////////////////////////////////////////////////////////////////////////
	//
	// PRIVATE methods
	//
	/////////////////////////////////////////////////////////////////////////////
	/**
	 * Returns an array of all of the unique bracket chord names. So even if [D7] appears a 
	 * dozen times you'll only see it once in this list.
	 * @method _findChords
	 * @private
	 * @param text {string} CPM Text Block to be parsed
	 * @return {StringArray}
	 */
	var _findChords = function(text) {
		var i, j;
		var re = /\[(.+?)]/img;
		var m = text.match(re);
		if (!m) {
			return [];
		}
		
		// why not use associative array?
		var chords = [];
		var found;
		for (i = 0; i < m.length; i++) {
			found = false;
			for (j = 0; j < chords.length; j++) {
				if (chords[j] == m[i]) {
					found = true;
					break;
				}
			}
			if (!found){
				chords.push(m[i]);
			}
		}
		// clean 'em
		for (j in chords) {
			chords[j] = chords[j].replace('[','').replace(']','');
		}
		// done
		return chords;
	};

	/**
	 * Returns the input string having replaced all of the "bracketed chord names" (i.e. [D7]) with HTML 
	 * marked-up version (i.e. &lt;code&gt;&lt;strong&gt;[&lt;em&gt;D7&lt;/em&gt;]&lt;/strong&gt;&lt;/code&gt;)
	 * @method _encloseChords
	 * @private
	 * @param text {string} 
	 * @param chords {StringArray}
	 * @return {string}
	 */
	var _encloseChords = function(text, chords) {
		var openBracket = ukeGeeks.settings.opts.retainBrackets ? '[' : ' ';
		var closeBracket = ukeGeeks.settings.opts.retainBrackets ? ']' : ' ';
		for(var i in chords){
			do {} 
			while(text.length != (text = text.replace(
				'[' + chords[i] + ']', 
				'<code data-chordName="' + chords[i] + '"><strong>' + openBracket + '<em>' + chords[i] + '</em>' + closeBracket + '</strong></code>')).length);
		}
		return text;
		/*
		// need to handle chords such as: [A7+5]
		var escapeRegEx = new RegExp('([+])','g');
		for (var j = 0; j < this.chords.length; j++){
			var s = this.chords[j].replace(escapeRegEx, '\\\$1')
			var re = new RegExp('[[]' + s + ']', 'img');
			text = text.replace(re, '<code data-chordName="' + this.chords[j] + '"><strong>[<em>' + this.chords[j] + '</em>]</strong></code>');
		}
		*/
	};

	/**
	 * Looks for consecutive chords and strips the whitespace between them -- thus "packing" the 
	 * chords against each other with only a single space separating them.
	 * @method _packChords
	 * @private
	 * @param text {string} 
	 * @return {string}
	 */
	var _packChords = function(text) {
		var re;

		if (ukeGeeks.settings.inlineDiagrams){
			/* TODO: problem with packing */
			re = /(<\/strong><\/code>)[ \t]*(<code data-chordName="[^"]*"><strong>)/ig;
			return text.replace(re,'$1<span class="ugsInlineSpacer">&nbsp;</span>$2');
		}

		re = /<\/strong><\/code>[ \t]*<code data-chordName="[^"]*"><strong>/ig;
			return text.replace(re,' ');
	};

	/* return our public interface
	 */
	return _public;
};