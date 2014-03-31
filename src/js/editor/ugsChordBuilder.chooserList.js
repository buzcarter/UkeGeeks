/**
 *
 * @class chooserList
 * @namespace ugsChordBuilder
 * @static
 * @singleton
 */
ugsChordBuilder.chooserList = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	// array of custom chords defined in this song
	var _chordDictionary = [];
	// handle to HTML UL element
	var _eleChordList = null;

	/**
	 * magic value for start a new chord (constant)
	 * @final
	 * @attribute C_NEW_CHORD
	 * @type {Int}
	 */
	var C_NEW_CHORD = -1;

	// next available Id used on LI's
	var _nextId = 0;

	// HTML element Ids
	var _ids = {
		// ChordPro Song -- the unmodified source
		source: 'chordProSource',
		// the UL where we'll be loading the chords
		chordList: 'cdBldPick',
		builderPanel: 'cdBldBuilderPanel',
		chooserPanel: 'cdBldChooserPanel'
	};

	/**
	 * Chord current sent to the editor.
	 * @attribute _currentChord
	 */
	var _currentChord = null;

	/**
	 * Handle to the chordBuilder (UI) "setChord" method
	 * @attribute _setChordMethod
	 */
	var _setChordMethod = function() {};

	/**
	 * Hanlde to instance of Scriptasaurus chord brush class, to paint the wee little
	 * chord diagrams onto the Chooser List.
	 * @attribute _ugsBrushTool
	 * @type {Object}
	 */
	var _ugsBrushTool = null;

	/**
	 * Required settings for the Chord Brush -- dimensions, fonts, and colors.
	 * @attribute _diagramSettings
	 * @type {JSON}
	 */
	var _diagramSettings = {
		dimensions: {
			showText: false,
			height: 50,
			width: 40,
			fretSpace: 9,
			stringSpace: 7,
			dotRadius: 3,
			lineWidth: 1,
			topLeftPos: {
				x: 10,
				y: 2
			},
			xWidth: 0.7 * 7,
			xStroke: 1.4 * 1
		},
		fonts: {
			dot: '8pt Arial',
			text: '8pt Arial',
			fret: '8pt Arial'
		},
		colors: {
			fretLines: '#EED18E',
			dots: '#551D00', //'#9A532D',
			dotText: '#ffffff',
			text: '#000000',
			fretText: '#EED18E',
			xStroke: '#551D00'
		}
	};

	/**
	 * entity for storing raw chord info; attached to the LI via id
	 * @class ChordDefinition
	 * @param {string} name
	 * @param {string} definition
	 */
	var ChordDefinition = function(name, definition) {
		this.id = _nextId++;
		this.name = name;
		this.definition = definition;
	};

	/**
	 * @method init
	 * @param  {function} setChordFunction
	 */
	_public.init = function(setChordFunction) {
		_setChordMethod = setChordFunction;
		_eleChordList = document.getElementById(_ids.chordList);
		// attach click handler to the UL avoids need to attach to individual LI items (these get added & deleted frequently)
		_eleChordList.addEventListener('click', onClick, false);
		_start();
	};

	var _start = function() {
		songGetDefinitions(document.getElementById(_ids.source).value);
		listLoad(_eleChordList, _chordDictionary);
	};

	_public.reset = function() {
		_chordDictionary = [];
		document.getElementById(_ids.chordList).innerHTML = '';
		_nextId = 0;
		_currentChord = null;
		_start();
	};

	/**
	 * Shows either the "Chooser" or "Chord Builder/Editor" panel.
	 * @method show
	 * @public
	 * @param {bool} isChooserPanel
	 */
	_public.show = function(isChooserPanel) {
		document.getElementById(_ids.chooserPanel).style.display = isChooserPanel ? 'block' : 'none';
		document.getElementById(_ids.builderPanel).style.display = !isChooserPanel ? 'block' : 'none';
		$('#' + _ids.chooserPanel).closest('.overlay').toggleClass('chordBuilderNarrow', isChooserPanel);
	};

	/**
	 * Returns TRUE if Save completed OK, false otherwise (duplicate name or unable to update)
	 * @method save
	 * @param  {JSON} data
	 * @return {bool}
	 */
	_public.save = function(data) {
		if (dictionaryFindDupes(_currentChord == null ? -1 : _currentChord.id, data.name) >= 0) {
			alert('Hey, this chord name is already being used.');
			return false;
		}
		var id = -1;
		if (_currentChord == null) {
			id = definitionAdd(data.name, data.definition);
			_currentChord = dictionaryFind(id);
			songAddDefinition(data.definition);
		}
		else {
			var i = dictionaryGetIndex(_currentChord.id);
			if (i < 0) {
				// console.log('error: not found');
				return false;
			}
			var oldDefinition = _chordDictionary[i].definition;
			_chordDictionary[i].name = data.name;
			_chordDictionary[i].definition = data.definition;
			id = _chordDictionary[i].id;
			songReplace(oldDefinition, _chordDictionary[i].definition);
		}
		listUpdate(id);
		_public.show(true);
		return true;
	};

	/**
	 * Handles confirming & removing a chord from the list and the song.
	 * @method doDelete description]
	 * @param  {ChordDefinition} chord
	 * @return {void}
	 */
	var doDelete = function(chord) {
		if (!confirm('Delete definition for "' + chord.name + '"?')) {
			return;
		}
		var item = listGetItem(chord.id);
		if (!item) {
			return;
		}
		_eleChordList.removeChild(item);
		songReplace(chord.definition, '');

	};

	/**
	 * ListItem click event handler
	 * @method onClick
	 * @param  {Event} evt
	 */
	var onClick = function(evt) {
		evt.preventDefault();
		_currentChord = dictionaryFind(evt.target.getAttribute('data-id'));
		if (evt.target.getAttribute('data-action') == 'delete') {
			doDelete(_currentChord);
			return;
		}

		var chord = null;
		if (_currentChord != null) {
			chord = ukeGeeks.chordImport.runLine(_currentChord.definition);
			if (hasMutedStrings(chord)) {
				alert('Uh-oh! This chord uses muted strings!\nCurrently the Chord Builder does not support muted strings -- \nsaving edits will result in mutes being lost.');
			}
		}
		_setChordMethod(chord);
		_public.show(false);
	};

	/**
	 * Checks whether any of the Chord's strings have been muted.
	 * @method hasMutedStrings
	 * @param  {ugs.chord}  chord
	 * @return {Boolean}
	 */
	var hasMutedStrings = function(chord) {
		if (chord.muted) {
			for (var i = 0; i < chord.muted.length; i++) {
				if (chord.muted[i]) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * updates an exiting HTML ListItem (LI) using the info stored for Id in
	 * the chord dictionary (array). Appends new ListItem if not found.
	 * @method listUpdate
	 * @param  {int} id
	 * @return {DOM_LI}
	 */
	var listUpdate = function(id) {
		var def = dictionaryFind(id);
		var item = listGetItem(id);
		if (!item) {
			item = listAddItem(id, def.name);
		}
		else {
			item.innerHTML = listHtmlString(id, def.name, true);
		}
		listAddDiagram(id);
		return item;
	};

	/**
	 * finds the HTML ListItem corresponding to Id
	 * @method listGetItem
	 * @param  {int} id
	 * @return {DOM_LI}
	 */
	var listGetItem = function(id) {
		var items = _eleChordList.getElementsByTagName('li');
		for (var i = 0; i < items.length; i++) {
			if (items[i].getAttribute('data-id') == ('' + id)) {
				return items[i];
			}
		}
		return null;
	};

	/**
	 * Returns HTML snippet for an LI
	 * @method listHtmlString
	 * @param  {int} id
	 * @param  {string} name
	 * @param  {bool} isInner (optional) if TRUE only reutrns the inner HTML part, otherwise returns complete LI tag
	 * @return {string}
	 */
	var listHtmlString = function(id, name, isInner) {
		isInner = (arguments.length > 2) ? isInner : false;
		var innerHtml = '<span class="deleteChord" data-id="' + id + '" data-action="delete" title="Remove this definition"></span>' + name;
		return isInner ? innerHtml : '<li data-id="' + id + '" title="Edit this definition" class="ugs-grouped">' + innerHtml + '</li>';
	};

	/**
	 * Clears and loads the HTML UL using currently values in Chord Dictionary
	 * @method listLoad
	 * @param {DOM_UL} ul
	 * @param {array} chordDefs
	 */
	var listLoad = function(ul, chordDefs) {
		var i, s = '';
		for (i = 0; i < chordDefs.length; i++) {
			s += listHtmlString(chordDefs[i].id, chordDefs[i].name);
		}
		ul.innerHTML = '<li data-id="' + C_NEW_CHORD + '" class="newChord">+ Add New Chord</li>' + s;

		var items = ul.getElementsByTagName('li');
		for (i = items.length - 1; i >= 0; i--) {
			if (i < 1) {
				continue;
			}
			listAddDiagram(items[i].getAttribute('data-id'));
		}
	};

	/**
	 * Appends a new HTML ListItem to our UL.
	 * @method listAddItem
	 * @param  {int} id
	 * @param  {string} name
	 */
	var listAddItem = function(id, name) {
		var temp = document.createElement('ul');
		temp.innerHTML = listHtmlString(id, name);
		_eleChordList.appendChild(temp.childNodes[0]);
	};

	/**
	 * Adds mini-chord diagram to the list item found by Id.
	 * @method listAddDiagram
	 */
	var listAddDiagram = function(id) {
		var element = listGetItem(id);
		var defintion = dictionaryFind(id);
		var chord = ukeGeeks.chordImport.runLine(defintion.definition);
		//var fretBox = ukeGeeks.settings.inlineFretBox;
		//var fontSettings = ukeGeeks.settings.inlineFretBox.fonts;
		if (_ugsBrushTool == null) {
			_ugsBrushTool = new ukeGeeks.chordBrush();
		}
		_ugsBrushTool.plot(element, chord, _diagramSettings.dimensions, _diagramSettings.fonts, _diagramSettings.colors);
	};

	/**
	 * Using just a bit of recursion performs as advertised: replaces all occurences of
	 * searchValue with newValue within text (haystack).
	 * DANGER: it is, of course, for this to get hung in an infinite loop if new value
	 * inclues complete search value. :D
	 * @method replaceAll
	 * @param  {string} text
	 * @param  {string} searchValue
	 * @param  {string} newValue
	 * @return {string}
	 */
	var replaceAll = function(text, searchValue, newValue) {
		var newText = text.replace(searchValue, newValue);
		return (newText == text) ? text : replaceAll(newText, searchValue, newValue);
	};

	/**
	 * Updates Source and Runs Scriptasaurus after updaint the definition
	 * @method songReplace
	 * @param  {string} oldDefinition
	 * @param  {string} newDefinition
	 * @return {void}
	 */
	var songReplace = function(oldDefinition, newDefinition) {
		var e = document.getElementById(_ids.source);
		e.value = replaceAll(e.value, oldDefinition, newDefinition);
		ugsEditorPlus.actions.run();
	};

	/**
	 * Loops over all lines in "text" and extracts any {define:...} statements, adding
	 * them to the ChordDictionary.
	 * @method songGetDefinitions
	 */
	var songGetDefinitions = function(text) {
		var defineRegEx = /\{define:\s*([^}]+?)\s+frets[^}]+?\}/im;
		var lines = text.split('\n');
		for (var i = lines.length - 1; i >= 0; i--) {
			if (!defineRegEx.test(lines[i])) {
				continue;
			}
			definitionAdd(lines[i].replace(defineRegEx, '$1'), lines[i]);
		}
	};

	/**
	 * Inserts the passed chord definition into the song (and reruns Sscriptasaurus).
	 * The chord insertion point is at the end of either the song meta tags or the
	 * existing chord defintion block. Determined by the _last_ "header" tag line.
	 * @method songAddDefinition
	 * @param {string} definition
	 */
	var songAddDefinition = function(definition) {
		var choProText = document.getElementById(_ids.source);
		var instructionRegEx = /\s*\{\s*(title|t|artist|subtitle|st|album|define):.*?\}/im;
		var lines = choProText.value.split('\n');
		var html = '';
		var inserted = false;
		for (var i = lines.length - 1; i >= 0; i--) {
			if (!inserted && instructionRegEx.test(lines[i])) {
				html = definition + '\n' + html;
				inserted = true;
			}
			html = lines[i] + '\n' + html;
		}
		if (!inserted) {
			html = definition + '\n' + choProText.value;
		}
		choProText.value = html;
		ugsEditorPlus.actions.run();
	};

	/**
	 * Returns Index of Id within the chord Dictionary or -1 if not found.
	 * @method dictionaryGetIndex
	 * @param  {int} id
	 * @return {int}
	 */
	var dictionaryGetIndex = function(id) {
		for (var i = 0; i < _chordDictionary.length; i++) {
			if ('' + _chordDictionary[i].id == id) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * Returns index of the duplicate chord name. Pass in Id of the chord to be ignored,
	 * (i.e. the one currently being edited). Comparison ignores case. Returns -1 if no
	 * dupe is found.
	 * @method dictionaryFindDupes
	 * @param  {int} id
	 * @param  {string} name
	 * @return {int}
	 */
	var dictionaryFindDupes = function(id, name) {
		var search = name.toLowerCase();
		for (var i = _chordDictionary.length - 1; i >= 0; i--) {
			if (('' + _chordDictionary[i].id != '' + id) && (_chordDictionary[i].name.toLowerCase() == search)) {
				return i;
			}
		}

		return -1;
	};

	/**
	 * Returns the entry for Id from Chord Dictionary
	 * @method dictionaryFind
	 * @param  {int} id
	 * @return {ChordDefinition}
	 */
	var dictionaryFind = function(id) {
		var i = dictionaryGetIndex(id);
		return i >= 0 ? _chordDictionary[i] : null;
	};

	/**
	 * Adds new chord definition to our Dictionary array. Returns the
	 * new item's Id (int).
	 * @method definitionAdd
	 * @param {string} name
	 * @param {string} definition
	 * @return {int}
	 */
	var definitionAdd = function(name, definition) {
		var chord = new ChordDefinition(name, definition);
		_chordDictionary.push(chord);
		return chord.id;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());