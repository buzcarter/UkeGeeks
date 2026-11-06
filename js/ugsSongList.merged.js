/**
 * Search on the song list page for songs ("Quick search"): as you type a drop down list
 * of matching songs appears; arrow keys + Enter, or a click, open the song.
 * (Originally used Twitter Bootstrap's typeahead plugin; this is a small, dependency-free
 * version that keeps its markup -- ul.typeahead.dropdown-menu -- so the existing CSS still applies.)
 * @class typeahead
 * @constructor
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.typeahead = function(){
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * min number of characters typed before searching
	 * @property MIN_LENGTH
	 * @final
	 * @type {Number}
	 */
	var MIN_LENGTH = 2;

	/**
	 * max number of matches shown
	 * @property MAX_ITEMS
	 * @final
	 * @type {Number}
	 */
	var MAX_ITEMS = 50;

	// private
	// ---------------------------
	var _songs = [];

	var _regex = null;
	var _words = [];

	var _input = null;
	var _menu = null;
	var _activeIndex = -1;
	var _blurTimer = null;

	var _re = {
		space: /\s{2,}/g,
		// everything except letters & numbers (in ANY script: Latin, Chinese, Cyrillic...) gets nuked
		common: makeUnicodeRegEx('([^\\p{L}\\p{N}]+)', 'gu', /([^a-z0-9]+)/gi),
		// accents left over after NFD normalization ("é" -> "e" + "´"), so "beyonce" finds "Beyoncé"
		diacritics: makeUnicodeRegEx('\\p{M}+', 'gu', null),
		//treat quotes as invisible
		noise: /['`’-]/g,
		regExChars: /[.*+?^${}()|[\]\\]/g
	};

	/**
	 * Unicode property escapes (\p{L}) are a SyntaxError in pre-2018 browsers (IE etc),
	 * even inside a regex literal that never runs -- that would break this whole file.
	 * So build them at runtime and fall back to the old ASCII-only behavior.
	 * @method makeUnicodeRegEx
	 * @private
	 * @param pattern {string}
	 * @param flags {string}
	 * @param fallback {RegExp|null}
	 * @return {RegExp|null}
	 */
	function makeUnicodeRegEx(pattern, flags, fallback) {
		try {
			return new RegExp(pattern, flags);
		}
		catch (e) {
			return fallback;
		}
	}

	/**
	 * Scrapes the song list's HTML to build our list of
	 * searchable text, display content, and links
	 * @method listFromHtml
	 */
	var listFromHtml = function(){
		ugsEditorPlus.dom.all('.songList > li').forEach(function(li) {
			var link = li.querySelector('a');
			if (!link) {
				return;
			}
			_songs.push({
				// content displayed in drop down list (the song's link)
				link : link,
				// what we'll match against
				searchText : crushText(li.textContent),
				// when a selection is made this is the location we'll launch
				href : link.getAttribute('href')
			});
		});
	};

	var crushText = function(value){
		value = value.toLowerCase();
		if (_re.diacritics && value.normalize) {
			value = value.normalize('NFD').replace(_re.diacritics, '');
		}
		return value
			.replace(_re.noise, '')
			.replace(_re.common, ' ')
			.replace(_re.space, ' ')
			.trim();
	};

	/**
	 * Splits the query into words and builds the highlighter's RegEx
	 * @method setQuery
	 * @param query {string}
	 */
	var setQuery = function(query) {
		_words = crushText(query).split(' ').filter(function(word) {
			return word.length > 0;
		});
		var regGroup = _words.map(function(word) {
			return word.replace(_re.regExChars, '\\$&');
		}).join('|');
		_regex = regGroup.length > 0 ? new RegExp('(' + regGroup + ')', 'gi') : null;
	};

	/**
	 * true when every query word appears in the song's text
	 * @method isMatch
	 * @param song {JSON}
	 * @return {bool}
	 */
	var isMatch = function(song) {
		for (var i = 0; i < _words.length; i++) {
			if (song.searchText.indexOf(_words[i]) == -1) {
				return false;
			}
		}
		return true;
	};

	var bySearchText = function(a, b) {
		return (a.searchText > b.searchText) ? 1 : ((a.searchText < b.searchText) ? -1 : 0);
	};

	/**
	 * Wraps the query words found in the text nodes of ele in STRONG tags. Pure DOM: no innerHTML.
	 * @method highlight
	 * @param ele {DOM-element}
	 */
	var highlight = function(ele) {
		if (!_regex) {
			return;
		}
		var walker = document.createTreeWalker(ele, NodeFilter.SHOW_TEXT, null);
		var textNodes = [];
		while (walker.nextNode()) {
			textNodes.push(walker.currentNode);
		}
		textNodes.forEach(function(node) {
			var parts = node.nodeValue.split(_regex);
			if (parts.length < 2) {
				return;
			}
			var frag = document.createDocumentFragment();
			// split with a capture group: odd indexes are the matches
			parts.forEach(function(part, i) {
				if (part.length < 1) {
					return;
				}
				if (i % 2) {
					var strong = document.createElement('strong');
					strong.textContent = part;
					frag.appendChild(strong);
				}
				else {
					frag.appendChild(document.createTextNode(part));
				}
			});
			node.parentNode.replaceChild(frag, node);
		});
	};

	/**
	 * Builds the drop down's list item for the song: a copy of the song list's link
	 * (title made "bigger"), with the matched words highlighted
	 * @method makeItem
	 * @param song {JSON}
	 * @param index {int}
	 * @return {DOM-element}
	 */
	var makeItem = function(song, index) {
		var li = document.createElement('li');
		var a = document.createElement('a');
		li.id = 'quickSearchItem' + index;
		li.setAttribute('role', 'option');
		a.href = song.href;
		a.tabIndex = -1;
		Array.prototype.forEach.call(song.link.childNodes, function(child) {
			a.appendChild(child.cloneNode(true));
		});
		var title = a.querySelector('strong');
		if (title) {
			var bigger = document.createElement('span');
			bigger.className = 'bigger ' + title.className;
			while (title.firstChild) {
				bigger.appendChild(title.firstChild);
			}
			title.parentNode.replaceChild(bigger, title);
		}
		ugsEditorPlus.dom.all('em, .bigger', a).forEach(highlight);
		li.appendChild(a);
		return li;
	};

	/**
	 * (re)builds the list for what's currently typed in the search box
	 * @method lookup
	 */
	var lookup = function() {
		var query = _input.value;
		if (query.length < MIN_LENGTH) {
			hide();
			return;
		}
		setQuery(query);
		var matches = _songs.filter(isMatch).sort(bySearchText).slice(0, MAX_ITEMS);
		if (matches.length < 1) {
			hide();
			return;
		}
		_menu.textContent = '';
		matches.forEach(function(song, i) {
			_menu.appendChild(makeItem(song, i));
		});
		setActive(0);
		show();
	};

	var items = function() {
		return _menu.children;
	};

	var setActive = function(index) {
		var list = items();
		if (list.length < 1) {
			return;
		}
		// wrap around, same as Bootstrap's typeahead
		index = (index + list.length) % list.length;
		if (list[_activeIndex]) {
			list[_activeIndex].classList.remove('active');
			list[_activeIndex].removeAttribute('aria-selected');
		}
		_activeIndex = index;
		list[index].classList.add('active');
		list[index].setAttribute('aria-selected', 'true');
		_input.setAttribute('aria-activedescendant', list[index].id);
		if (list[index].scrollIntoView && isShown()) {
			list[index].scrollIntoView({ block: 'nearest' });
		}
	};

	var isShown = function() {
		return _menu.style.display == 'block';
	};

	var show = function() {
		_menu.style.top = (_input.offsetTop + _input.offsetHeight) + 'px';
		_menu.style.left = _input.offsetLeft + 'px';
		_menu.style.display = 'block';
		_input.setAttribute('aria-expanded', 'true');
	};

	var hide = function() {
		_menu.style.display = 'none';
		_activeIndex = -1;
		_input.setAttribute('aria-expanded', 'false');
		_input.removeAttribute('aria-activedescendant');
	};

	/**
	 * opens the song
	 * @method select
	 * @param index {int}
	 */
	var select = function(index) {
		var li = items()[index];
		if (li) {
			window.location.href = li.querySelector('a').href;
		}
	};

	var onKeyDown = function(e) {
		// IME (e.g. Chinese pinyin) is still composing: Enter/arrows belong to it
		if (e.isComposing || e.keyCode == 229 || !isShown()) {
			return;
		}
		switch (e.key) {
			case 'ArrowDown':
			case 'Down':
				setActive(_activeIndex + 1);
				break;
			case 'ArrowUp':
			case 'Up':
				setActive(_activeIndex - 1);
				break;
			case 'Enter':
				select(_activeIndex);
				break;
			case 'Escape':
			case 'Esc':
				hide();
				break;
			default:
				return;
		}
		e.preventDefault();
	};

	_public.initialize = function(){
		listFromHtml();

		_input = document.getElementById('quickSearch');
		if (!_input) {
			return;
		}

		_menu = document.createElement('ul');
		_menu.className = 'typeahead dropdown-menu';
		_menu.id = 'quickSearchResults';
		_menu.setAttribute('role', 'listbox');
		_input.parentNode.insertBefore(_menu, _input.nextSibling);

		_input.setAttribute('role', 'combobox');
		_input.setAttribute('aria-autocomplete', 'list');
		_input.setAttribute('aria-controls', _menu.id);
		_input.setAttribute('aria-expanded', 'false');

		_input.addEventListener('input', lookup);
		_input.addEventListener('keydown', onKeyDown);
		_input.addEventListener('focus', function() {
			clearTimeout(_blurTimer);
		});
		_input.addEventListener('blur', function() {
			// give a click on the list time to land
			_blurTimer = setTimeout(hide, 150);
		});

		_menu.addEventListener('mouseover', function(e) {
			var li = e.target.closest('li');
			if (li && li.parentNode === _menu) {
				setActive(Array.prototype.indexOf.call(items(), li));
			}
		});
		// keep focus in the search box when the list is clicked (the link itself does the navigating)
		_menu.addEventListener('mousedown', function(e) {
			e.preventDefault();
		});

		_input.value = '';
		_input.focus();
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
};
;/**
 * Creates a new song via AJAX.
 * Dependencies: ugsEditorPlus.dom

 * @class newSong
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.newSong = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * lock-down the Submit (Update) button to avoid double posts;
	 *  @attribute _isUpdating
	 * @type {Boolean}
	 */
	var _isUpdating = false;

	var _ajaxUri = '';

	_public.init = function(ajaxUri) {
		_ajaxUri = ajaxUri;

		var dom = ugsEditorPlus.dom;

		dom.on('#newSongBtn', 'click', function(e) {
			if(doValidate(this)) {
				doPost();
			}
		});

		dom.on('#openNewDlgBtn', 'click', function(e) {
			resetFields();
			dom.fadeIn(document.getElementById('newSongForm'));
			document.getElementById('songTitle').focus();
		});

		dom.on('#hideNewSongBtn', 'click', closeDlg);

		// handle escape key
		dom.on('#newSongForm', 'keydown', onEscape);

		dom.hide(document.getElementById('loadingSpinner'));

		var dlg = document.getElementById('newSongForm');
		if (dlg) {
			dom.draggable(dlg, 'hgroup');
		}
	};

	/**
	 * shows/hides the "Saving..." spinner, (un)locks the form
	 * @method setBusy
	 * @param isBusy {bool}
	 */
	var setBusy = function(isBusy) {
		_isUpdating = isBusy;
		ugsEditorPlus.dom.toggle(document.getElementById('loadingSpinner'), isBusy);
	};

	var doAjaxOk = function(data) {
			showErrors(data.HasErrors, data.Message);
			if(data.HasErrors) {
				return;
			}
			document.location.href = data.ContinueUri;
		};

	var doPost = function() {
			if (_isUpdating){
				return;
			}

			var data = {
				'handler': 'ugs_new',
				'songTitle': document.getElementById('songTitle').value,
				'songArtist': document.getElementById('songArtist').value
			};

			setBusy(true);
			ugsEditorPlus.dom.postJson(_ajaxUri, data)
				.then(function(data) {
					setBusy(false);
					doAjaxOk(data);
				}, function() {
					setBusy(false);
					showErrors(true, 'Failed to create the song file.\nPlease have your admin check the CPM directory permissions.');
				});
		};

	var doValidate = function() {
		var titleInput = document.getElementById('songTitle');
		var title = titleInput.value.trim();
		titleInput.value = title;
		/*
		var ok = title.length > 2;
		showErrors(!ok, 'Song\'s title is required<br/><em>(you may change it later, must be at least 2 characters)</em>');
		return ok;
		*/
		return true;
	};

	var showErrors = function(hasErrors, message) {
		var err = ugsEditorPlus.dom.one('#newSongForm .errorMessage');
		if(hasErrors) {
			// plain text (the message may echo back what the user typed); newlines become line breaks
			err.textContent = '';
			String(message).split('\n').forEach(function(line, i) {
				if (i > 0) {
					err.appendChild(document.createElement('br'));
				}
				err.appendChild(document.createTextNode(line));
			});
			ugsEditorPlus.dom.show(err);
			document.getElementById('songTitle').focus();
		}
		else {
			ugsEditorPlus.dom.hide(err);
		}
		};

	var closeDlg = function(e) {
		if (e && e.type == 'click') {
			e.preventDefault();
		}
		ugsEditorPlus.dom.fadeOut(document.getElementById('newSongForm'));
	};

	var resetFields = function(){
		document.getElementById('songTitle').value = '';
		document.getElementById('songArtist').value = '';
	};

	var onEscape = function(e){
		if (e.key == 'Escape' || e.keyCode == 27) {
			closeDlg();
		}
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;
})();
