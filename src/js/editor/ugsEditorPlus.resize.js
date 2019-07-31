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

	var $dlg = null;
	var $aceLayer = null;
	var $help = null;
	var editor = null;

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
		$dlg = $(dlgElement);
		$("body").append('<div id="aceHeader"><button class="aceSideBtn" title="' + ugs_il8n.show_option_help + '"><span></span><span></span><span></span></button><strong>' + ugs_il8n.edit_song + '</strong><a href="#exit-fullscreen">' + ugs_il8n.exit_goback + '</a></div><div id="aceEditor"></div><div id="aceHelp"></div>');

		$aceLayer = $('#aceEditor');
		$aceLayer.fadeOut(1);

		$help = $('#aceHelp');

		$('#aceHeader a').click(function(e) {
			e.preventDefault();
			hideAce();
		});
		$('#aceHeader button').click(onShowHelpClicked);
	};

	var onShowHelpClicked = function(e) {
		e.preventDefault();
		showHelp(!isHelpOpen);
	};

	var showHelp = function(isShow) {
		isHelpOpen = isShow;

		if (isShow) {
			$help.animate({
				left: 0
			}, SLIDE_SPEED);
			$aceLayer.animate({
				left: '350px'
			}, SLIDE_SPEED);
		}
		else {
			$help.animate({
				left: '-350px'
			}, SLIDE_SPEED);
			$aceLayer.animate({
				left: 0
			}, SLIDE_SPEED);
		}
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

		$('script').each(function(index, item) {
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

		$('html').addClass('aceEditorActive');
		$('.overlay').fadeOut(300);


		if (editor !== null) {
			// editor has already been initialized, safe to continue
			copySongToAce();
      showHelp(true);
			return;
		}

		// only execute this block once (thus the null check)
		var path = getPath('ugsEditorPlus');

		LazyLoad.js(path + '/ace/ace.js', function() {
				editor = ace.edit("aceEditor");
				editor.setTheme("ace/theme/idle_fingers");
				editor.getSession().setMode("ace/mode/chordpro");
				editor.setOptions({
					enableBasicAutocompletion: true,
					enableSnippets: true
				});
				editor.completers = [ugsAce.chordCompleter];
				copySongToAce();

        // Override the Ace editor help here (and translate !)
        ugsAce.helpHtml = '<div class="aceHelp"><h3>' + ugs_il8n.keyboard_shortcuts + '</h3>'+
          '<table><thead><tr><th>' + ugs_il8n.shortcut + '</th><th>' + ugs_il8n.action + '</th></tr></thead><tbody>'+
          '<tr><td class="shortKeys"><code class="key">CTRL</code> + <code class="key">F</code></td><td>' + ugs_il8n.find + '</td></tr><tr>'+
          '<td class="shortKeys"><code class="key">CTRL</code> + <code class="key">H</code></td><td>' + ugs_il8n.find_replace + '</td></tr>'+
          '<tr><td class="shortKeys"><code class="key">' + ugs_il8n.escape + '</code></td><td>' + ugs_il8n.close_find_chord + '</td></tr>'+
          '<tr><td class="shortKeys"><code class="key">CTRL</code> + <code class="key">' + ugs_il8n.spacebar + '</code></td>'+
          '<td>' +ugs_il8n.list_song_chords_help + '</td></tr></tbody></table>'+
          '<h3>Snippets</h3><p>' + ugs_il8n.snippets_help + '.</p><table><thead><tr><th>Snippet</th><th>' + ugs_il8n.chordpro_markup + '</th></tr></thead>'+
          '<tbody><tr><td class="shortKeys"><strong>t</strong> ' + ugs_il8n.or + ' <strong>title</strong></td><td><code class="snip">{title: <em>' + ugs_il8n.title + '</em>}</code></td>'+
          '</tr><tr><td class="shortKeys"><strong>st</strong> ' + ugs_il8n.or + ' <strong>subtitle</strong></td><td><code class="snip">{subtitle: <em>' + ugs_il8n.subtitle + '</em>}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>a</strong> ' + ugs_il8n.or +' <strong>artist</strong></td><td><code class="snip">{artist: <em>' + ugs_il8n.name + '</em>}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>al</strong> ' + ugs_il8n.or +' <strong>album</strong></td><td><code class="snip">{album: <em>' + ugs_il8n.title + '</em>}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>c</strong> ' + ugs_il8n.or +' <strong>comment</strong></td><td><code class="snip">{comment: <em>' + ugs_il8n.comment + '</em>}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>col</strong> ' + ugs_il8n.or +' <strong>column</strong></td><td><code class="snip">{column_break}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>chorus</strong></td><td>' + ugs_il8n.add_complete_chorus_block + ' <code class="snip">{start_of_chorus}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>tab</strong></td><td>' + ugs_il8n.add_complete_tab_block + ' <code class="snip">{start_of_tab}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>soc</strong></td><td><code class="snip">{start_of_chorus}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>eoc</strong></td><td><code class="snip">{end_of_chorus}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>sot</strong></td><td><code class="snip">{start_of_tab}</code></td></tr>'+
          '<tr><td class="shortKeys"><strong>eot</strong></td><td><code class="snip">{end_of_tab}</code></td></tr>'+
          '</tbody></table>'+
          '</p><p>'+ ugs_il8n.snip_tips + '.</p></div>';

				$help.html(ugsAce.helpHtml);

        showHelp(true);
			});
	};

	var copySongToAce = function() {
		$aceLayer.show();
		editor.setValue($('#chordProSource').val());
		editor.gotoLine(1);
		$help.fadeIn(1);
	};

	/**
	 * Restores overlay to original position(-ish -- not finished)
	 * @method hideAce
	 * @private
	 * @return {void}
	 */
	var hideAce = function() {
		isBig = false;

		$dlg.show();
		$aceLayer.hide();
		$help.hide();
		if (editor !== null) {
			$('#chordProSource').val(editor.getValue());
		}

		$('html').removeClass('aceEditorActive');
		showHelp(false);
	};

	/**
	 * Resizes passed in DOM element, toggling between fullscreen and "standard" size.
	 * @method toggle
	 * @param  {DOM-element} dlgElement handle to Overlay/dialog being resized
	 * @return {void}
	 */
	_public.toggle = function(dlgElement){
		if ($dlg === null) {
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
