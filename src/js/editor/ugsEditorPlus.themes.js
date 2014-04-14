/**
 * Changes the song's color scheme ("theme") by changing both the applied body class
 * and the UkeGeek settings used to draw the diagrams.
 * @class themes
 * @namespace ugsEditorPlus
 * @singleton
 */
ugsEditorPlus.themes = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * available color schemes (see UkeGeeks.settings)
	 * @property _colorSchemes
	 * @type {JSON-Object}
	 */
	var _colorSchemes = {
		'normal': {
			name: 'Normal (white paper)',
			selectText: 'Normal colors (white paper)',
			description: 'Simple, legible text on white paper',
			song: {
				fretLines: '#003366',
				dots: '#ff0000',
				dotText: '#ffffff',
				text: '#000000',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#999999',
				dots: '#eaeaea',
				text: '#000000'
			}
		},

		'reversed': {
			name: 'Reversed for projectors',
			selectText: 'Reversed colors (for projectors)',
			description: 'Light text on dark background',
			song: {
				fretLines: '#365F70',
				dots: '#FDD96F',
				dotText: '#000000',
				text: '#FF6040',
				fretText: '#999999'
			},
			tabs: {
				lines: '#365F70',
				dots: '#FDD96F',
				text: '#000000'
			}
		},

		'frosty': {
			name: 'Frostcicle',
			selectText: 'Frostcicle (cool blue)',
			description: 'Brrrr... icy cool blues',
			song: {
				fretLines: '#66B4CC',
				dots: '#332335',
				dotText: '#9FE1F9',
				text: '#0896FE',
				fretText: '#E3D8BA'
			},
			tabs: {
				lines: '#6699FF',
				dots: '#EFFCF9',
				text: '#00558E'
			}
		},

		'jellyBean': {
			name: 'Jelly Beans',
			selectText: 'Jelly Beans (vibrant)',
			description: 'Sugary, vibrant bowl of jelly beans!',
			song: {
				fretLines: '#49BC45',
				dots: '#FF9417',
				dotText: '#FCF49F',
				text: '#D20070',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#6699FF',
				dots: '#FFF9BA',
				text: '#75003E'
			}
		},

		'justBlack': {
			name: 'Just Black',
			selectText: 'Black (for laser printers)',
			description: 'No color, but black, best for B&W laser printers',
			song: {
				fretLines: '#cccccc',
				dots: '#000000',
				dotText: '#ffffff',
				text: '#000000',
				fretText: '#000000'
			},
			tabs: {
				lines: '#cccccc',
				dots: '#000000',
				text: '#ffffff'
			}
		},

		'krampus': {
			name: 'Gruss vom Krampus',
			selectText: 'Krampus (Ye Olde Christmas)',
			description: 'Seasons Greetin\'s, Happy Holidays, Merry Christmas, Krampus Nichte!',
			song: {
				fretLines: '#929867',
				dots: '#A22C27',
				dotText: '#EBD592',
				text: '#4F2621',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#B69C01',
				dots: '#E1EEC8',
				text: '#75003E'
			}
		},

		'western': {
			name: 'Out West',
			selectText: 'Out West (dust country)',
			description: 'Dusty Honky Tonk/Country/Western look',
			song: {
				fretLines: '#B5A679',
				dots: '#CF8300',
				dotText: '#ffffff',
				text: '#386571',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#697665',
				dots: '#F1E3C5',
				text: '#632424'
			}
		},

		'pumpkin': {
			name: 'Pumpkin Pie',
			selectText: 'Pumpkin Pie (fall colors)',
			description: 'Fall \'n Halloween \'n Jack o\'Lantern \'n Thanksgiving Fun',
			song: {
				fretLines: '#8E9A6C',
				dots: '#DA6328',
				dotText: '#FFEE4A',
				text: '#68391D',
				fretText: '#B14623'
			},
			tabs: {
				lines: '#BED379',
				dots: '#FFF4D8',
				text: '#B14623'
			}
		},

		'notebook': {
			name: 'Rock Notebook',
			selectText: 'Rock Notebook (marker)',
			description: 'A strong, hand-scrawled, and edgily unreliable look',
			song: {
				fretLines: '#747CAD',
				dots: '#1C0866',
				dotText: '#ffffff',
				text: '#B22000',
				fretText: '#A4A0B2'
			},
			tabs: {
				lines: '#A4A0B2',
				dots: '#F1E3C5',
				text: '#2E2ECC'
			}
		},


		'zombie': {
			name: 'Zombies!!!',
			selectText: 'Zombies!!!',
			description: 'Blood \'n gore for Halloween',
			song: {
				fretLines: '#9EB036',
				dots: '#E52501',
				dotText: '#FEDA79',
				text: '#798666',
				fretText: '#B14623'
			},
			tabs: {
				lines: '#602749',
				dots: '#F7F9EA',
				text: '#4F5F3E'
			}
		}

	};

	var setBody = function(themeName) {
		var $body = $('body');
		// see: http://stackoverflow.com/questions/921789/how-to-loop-through-javascript-object-literal-with-objects-as-members
		for (var key in _colorSchemes) {
			if (_colorSchemes.hasOwnProperty(key)) {
				$body.removeClass('theme-' + key);
			}
		}
		$body.addClass('theme-' + themeName);
	};

	/**
	 * Returns text to be deisplayed when the  specified theme is selected.
	 * @method  getDescription
	 * @param  {string} themeName
	 * @return {string}
	 */
	_public.getDescription = function(themeName) {
		return _colorSchemes[themeName].selectText;
	};


	/**
	 * Populates the UL (identified via CSS/jQuery selector) with the color scheme List Items (LIs)
	 * @method loadList
	 * @param  {string} selector
	 * @param {string} selectedValue value that should be "checked"
	 */
	_public.loadList = function(selector, selectedValue) {
		var s = '';
		for (var key in _colorSchemes) {
			if (_colorSchemes.hasOwnProperty(key)) {
				var cssClass = (key == selectedValue) ? 'checked' : '';
				s += '<li class="' + cssClass + '"><a href="#' + key + '" title="' + _colorSchemes[key].description + '">' + _colorSchemes[key].name + '</a></li>';
			}
		}
		$(selector).html(s);
	};

	/**
	 * Sets body class and UkeGeeks settings to specified theme.
	 * @method set
	 * @param {string} themeName
	 */
	_public.set = function(themeName) {
		setBody(themeName);

		var c = _colorSchemes[themeName];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;
	};

	// ---------------------------------------
	// return public interface
	// ---------------------------------------
	return _public;

}());