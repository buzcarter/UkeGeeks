/**
 * Namespace
 * @type {Object}
 */
var ugsEditorPlus = window.ugsEditorPlus || {};

/**
 * Singleton class to attach Twitter Bootstrap Typeahead functions to a "Quick Search" field.
 * Uses exisiting data in the page's HTML to build the dataset.
 * Based on tutorial:
 * http://tatiyants.com/how-to-use-json-objects-with-twitter-bootstrap-typeahead/
 * @return {Oobject} Public interface methods
 */
ugsEditorPlus.typeahead = function(){

	// private
	// ---------------------------
	var _keysList = [];
	var _keysToDetailsDict = {};

	var _scrubbedQuery = '';
	var _regex;
	var _words = [];

	/**
	 * Public Interface object; attach all public members and methods to this
	 * @type {Object}
	 */
	var _publics = {};

	/**
	 * Scrapes HTML to build our list of
	 * keys, searchable text, and display text
	 * @return {[type]} [description]
	 */
	var listFromHtml = function(){

		$( 'li' ).each(function( index ) {
			var $this = $(this);

			var plainText = $this.text().replace(/\s\s+/g, ' ').trim();
			plainText = plainText.toLowerCase();

			var href = $this.children('a').attr('href');
			var key = href.toLowerCase();

			var html = $this.children('a').html();
			html = html.replace('<strong class="', '<span class="bigger ').replace('</strong>', '</span>');

			_keysToDetailsDict[key] = {
				// content displayed in drop down list
				html : html,
				// what we'll match against
				searchText : plainText,
				// unique key/id
				code : key,
				// when a selection is made this is the location we'll launch
				href : href
			};
			_keysList.push(key);
		});

	};

	/**
	 * does more than just return data; preps the Regular Expressions
	 * and search term query used in subsequent methods (triggered by "Process")
	 * @param  {string} query  user's search phrase
	 * @param  {function} process  method to be called upon completion
	 * @return {void}
	 */
	var _ta_source = function (query, process) {
		_scrubbedQuery = query.trim().toLowerCase();
		_words = _scrubbedQuery.split(' ');
		var regGroup = '';
		for (var i = 0; i < _words.length; i++) {
			_words[i] = _words[i].trim();
			if (_words[i].length > 0){
				regGroup += (regGroup.length > 0 ? '|' : '') + _words[i];
			}
		};
		_regex = new RegExp( '(' + regGroup + ')', 'gi');
		process(_keysList);
	};

	/**
	 * called when user has made a choice; performs redirect to selected song
	 * @param  {string} item selected item value (key)
	 * @return {string} selected value
	 */
	var _ta_updater = function (item) {
		window.location = _keysToDetailsDict[item].href;
		return _keysToDetailsDict[item].searchText;
	};

	/**
	 * using regular expressions build in "_ta_source" checks wheter a given item matches the search term(s)
	 * @param  {string} item current item to be checked
	 * @return {boolean}      true if matches
	 */
	var _ta_matcher = function (item) {
		var detailed = _keysToDetailsDict[item];
		for (var i = 0; i < _words.length; i++) {
			if (detailed.searchText.indexOf(_words[i]) == -1) {
				return false;
			}
		}
		return true;
	};

	/**
	 * sorts the passed in list
	 * @param  {array} items list of matched items to be sorted
	 * @return {array}  sorted list
	 */
	var _ta_sorter = function (items) {
		return items.sort(function(a, b) {
			return (_keysToDetailsDict[a].searchText > _keysToDetailsDict[b].searchText);
		});
	};

	/**
	 * preps item for displaying in UI; since we're not using the passed in item (it's just the key)
	 * we'll build an HTML snippet and return that.
	 * @param  {string} item key to be formatted (highlighted)
	 * @return {string}  HTML/string that will be added to matches display list
	 */
	var _ta_highligher = function (item) {
		var $temp = $('<div/>').html(_keysToDetailsDict[item].html);

		$('em, .bigger', $temp).each(function( index ){
			var $ele = $(this);
			var text = $ele.html();
			$ele.html(text.replace( _regex, "<strong>$1</strong>" ))
		});
		return $temp.html();
	};

	/**
	 * attaches events and does all other seup operations required
	 * @return {void}
	 */
	_publics.initialize = function(){
		listFromHtml();

		$('#quickSearch')
			.typeahead({
				source: _ta_source,
				updater: _ta_updater,
				matcher: _ta_matcher,
				sorter: _ta_sorter,
				highlighter: _ta_highligher,
				minLength: 2,
				items: 50
			})
			.val('')
			.focus();
		};

	/**
	 * return object with all public accesors
	 */
	return _publics;
};
