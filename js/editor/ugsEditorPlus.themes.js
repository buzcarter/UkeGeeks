/**
 * Changes the song's color scheme ("theme") by changing both the applied body class
 * and the UkeGeek settings used to draw the diagrams.
 * @class themes
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.themes = new function() {

	/**
	 * available color schemes (see UkeGeeks.settings)
	 * @property _colorSchemes
	 * @type {JSON-Object}
	 */
	var _colorSchemes = {
		'normal': {
			description: 'Normal colors (white paper)',
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
			description: 'Reversed colors (for projectors)',
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
			description: 'Frostcicle (cool blue)',
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
				text: '#00558E' // 0896FE'
			}
		},

		'jellyBean': {
			description: 'Jelly Beans (vibrant)',
			song: {
				fretLines: '#49BC45',
				dots: '#FF9417',
				dotText: '#FCF49F', // '#F2E660',
				text: '#D20070',
				fretText: '#4a4a4a'
			},
			tabs: {
				lines: '#6699FF',
				dots: '#FFF9BA',
				/* '#FF9417', */
				text: '#75003E' // 72003D'
			}
		},

		'western': {
			/* #9E1B28 */
			description: 'Out West (dust country)',
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
				text: '#632424' // '#33444A'
			}
		},

		'pumpkin': {
			/* #9E1B28 */
			description: 'Pumpkin Pie',
			song: {
				fretLines: '#8E9A6C', // Light orange: '#FFC501',
				dots: '#DA6328', // Nice purple: '#754495',
				dotText: '#FFEE4A',
				text: '#68391D',
				fretText: '#B14623' // too purply 754495'
			},
			tabs: {
				lines: '#BED379',
				dots: '#FFF4D8',
				text: '#B14623'
			}
		},

		'zombie': {
			description: 'Zombies!',
			song: {
				fretLines: '#9EB036',
				dots: '#E52501',//AF380D',
				dotText: '#FEDA79',
				text: '#798666',// '#602749',
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
	 * Returns text description for specified theme.
	 * @method  getDescription
	 * @param  {string} themeName [description]
	 * @return {string}           [description]
	 */
	this.getDescription = function(themeName) {
		return _colorSchemes[themeName].description;
	};

	/**
	 * Sets body class and UkeGeeks settings to specified theme.
	 * @method set
	 * @param {string} themeName
	 */
	this.set = function(themeName) {
		setBody(themeName);

		var c = _colorSchemes[themeName];
		ukeGeeks.settings.colors = c.song;
		ukeGeeks.settings.tabs.lineColor = c.tabs.lines;
		ukeGeeks.settings.tabs.dotColor = c.tabs.dots;
		ukeGeeks.settings.tabs.textColor = c.tabs.text;
	};

};