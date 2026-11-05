/**
 * Resizes an overlay to fill the window (this is a 1.0, so "fill" is relative -- it gets much bigger)
 * @class resize
 * @namespace ugsEditorPlus
 */
ugsEditorPlus.resize = (function(){
	/**
	 * attach public members to this object
	 * @property _public
	 * @type JsonObject
	 */
	var _public = {};

	var dom = ugsEditorPlus.dom;

	var dlg = null;
	var aceLayer = null;
	var help = null;
	var editor = null;

	/**
	 * miliseconds to fade in/out editor
	 * @property FADE_SPEED
	 * @final
	 * @type {Number}
	 */
	var FADE_SPEED = 550;
	/**
	 * miliseconds to slide in/out sidebar (help) panel
	 * @property SLIDE_SPEED
	 * @final
	 * @type {Number}
	 */
	var SLIDE_SPEED = 400;

	/**
	 * Hold the current state of the dialog, we'll store this on the element in "data-sized" attribute
	 * @attribute isBig
	 * @type {Boolean}
	 */
	var isBig = false;

	var isHelpOpen = false;

	/**
	 * Initializer: preps handles and sets state varables.
	 * @method setup
	 * @private
	 * @return {void}
	 */
	var setup = function(dlgElement){
		dlg = dlgElement;
		// static markup only
		document.body.insertAdjacentHTML('beforeend', '<div id="aceHeader"><button class="aceSideBtn" title="Show options &amp; help"><span></span><span></span><span></span></button><strong>Edit Song</strong><a href="#exit-fullscreen">Exit fullscreen</a></div><div id="aceEditor"></div><div id="aceHelp"></div>');

		aceLayer = document.getElementById('aceEditor');
		dom.hide(aceLayer);

		help = document.getElementById('aceHelp');

		dom.one('#aceHeader a').addEventListener('click', function(e) {
			e.preventDefault();
			hideAce();
		});
		dom.one('#aceHeader button').addEventListener('click', onShowHelpClicked);
	};

	var onShowHelpClicked = function(e) {
		e.preventDefault();
		showHelp(!isHelpOpen);
	};

	var showHelp = function(isShow) {
		isHelpOpen = isShow;

		dom.animate(help, {
			left: isShow ? '0px' : '-350px'
		}, SLIDE_SPEED);
		dom.animate(aceLayer, {
			left: isShow ? '350px' : '0px'
		}, SLIDE_SPEED);
	};

	/**
	 * Returns the path of a linked script file (src) up to the starting position of fileName
	 * @method getPath
	 * @param  {string} fileName
	 * @return {string}
	 */
	var getPath = function(fileName) {
		var path = '',
			lower, pos;

		fileName = fileName.toLowerCase();

		Array.prototype.forEach.call(document.scripts, function(item) {
			lower = item.src.toLowerCase();
			pos = lower.indexOf(fileName);
			if (pos > 0) {
				path = item.src.substr(0, pos);
			}
		});
		return path;
	};

	var showAce = function() {
		isBig = true;

		document.documentElement.classList.add('aceEditorActive');
		dom.all('.overlay').forEach(function(overlay) {
			dom.fadeOut(overlay, 300);
		});

		if (editor !== null) {
			// editor has already been initialized, safe to continue
			copySongToAce();
			return;
		}

		// only execute this block once (thus the null check)
		// the folder ugsEditorPlus.min.js was loaded from, with a trailing slash (e.g. "/js/")
		var path = getPath('ugsEditorPlus');

		// Ace with the ChordPro mode, snippets, chord completer and theme built in
		// (@ukegeeks/ace-chordpro-extension, copied here by scripts/build.js)
		LazyLoad.js(path + 'ace/ace-chordpro.min.js', function() {
				editor = ace.edit("aceEditor");
				editor.setTheme("ace/theme/idle_fingers");
				editor.getSession().setMode("ace/mode/chordpro");
				editor.setOptions({
					enableBasicAutocompletion: true,
					enableSnippets: true
				});
				copySongToAce();

				help.innerHTML = ugsEditorPlus.aceHelpHtml;
			});
	};

	var copySongToAce = function() {
		dom.fadeIn(aceLayer, FADE_SPEED);
		editor.setValue(document.getElementById('chordProSource').value);
		editor.gotoLine(1);
		dom.show(help);
	};

	/**
	 * Restores overlay to original position(-ish -- not finished)
	 * @method hideAce
	 * @private
	 * @return {void}
	 */
	var hideAce = function() {
		isBig = false;

		dom.show(dlg);
		dom.fadeOut(aceLayer, FADE_SPEED);
		dom.fadeOut(help, FADE_SPEED);
		if (editor !== null) {
			document.getElementById('chordProSource').value = editor.getValue();
		}

		document.documentElement.classList.remove('aceEditorActive');
		showHelp(false);
	};

	/**
	 * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
	 * @method toggle
	 * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
	 * @return {void}
	 */
	_public.toggle = function(dlgElement){
		if (dlg === null) {
		setup(dlgElement);
		}

		if (isBig){
			hideAce();
		}
		else{
			showAce();
		}
		return false;
	};


	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());