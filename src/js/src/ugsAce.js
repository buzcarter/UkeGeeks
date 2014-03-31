var ugsAce = window.ugsAce || {};

ugsAce.ChordFinder = function() {
	var re = /\[(.*?)\]/gi;

	// to play with IE we'll use an object instead of plain array
	var find = function(text) {
		var chords = {};
		var m = text.match(re);

		if (!m || m.length < 1) {
			return {};
		}
		for (var i = m.length - 1; i >= 0; i--) {
			if (!chords[m[i]]) {
				chords[m[i]] = 0;
			}
			chords[m[i]]++;
		}
		return chords;
	};

	var compare = function(a, b) {
		if (a.value < b.value) {
			return -1;
		}
		return (a.value > b.value) ? 1 : 0;
	};

	var getChords = function(text) {
		var chords = find(text);
		var map = [];
		for (var key in chords) {
			if (chords.hasOwnProperty(key)) {
				map.push({
					value: key,
					meta: chords[key] + ' occurrence' + (chords[key] > 1 ? 's' : '')
				});
			}
		}
		return map.sort(compare);
	};

	// public interface
	return {
		getChords: getChords
	};
};

ugsAce.chordCompleter = {
	getCompletions: function(editor, session, pos, prefix, callback) {
		if (!ugsAce.finder) {
			ugsAce.finder = new ugsAce.ChordFinder();
		}
		callback(null, ugsAce.finder.getChords(editor.getValue()));
	}
};

ugsAce.helpHtml = '<div class="aceHelp"><h3>Keyboard Shortcuts</h3><table><thead><tr><th>Shortcut</th><th>Action</th></tr></thead><tbody><tr><td class="shortKeys"><code class="key">CTRL</code> + <code class="key">F</code></td><td>Find</td></tr><tr><td class="shortKeys"><code class="key">CTRL</code> + <code class="key">H</code></td><td>Search &amp; Replace</td></tr><tr><td class="shortKeys"><code class="key">ESCAPE</code></td><td>Close Find or Chord window</td></tr><tr><td class="shortKeys"><code class="key">CTRL</code> + <code class="key">SPACEBAR</code></td><td>Lists your song\'s chords. Use <code class="key">DOWNARROW</code> &amp; <code class="key">UPARROW</code> to choose one, or type a few letters of the chord name to narrow suggestions. Press <code class="key">ENTER</code> to add it to your song.</td></tr></tbody></table><h3>Snippets</h3><p>Snippets are bits of ChordPro markup that you may add to your song by just typing a few letters and then pressing the <code class="key">TAB</code> key.</p><table><thead><tr><th>Snippet</th><th>ChordPro Markup</th></tr></thead><tbody><tr><td class="shortKeys"><strong>t</strong> or <strong>title</strong></td><td><code class="snip">{title: <em>TITLE</em>}</code></td></tr><tr><td class="shortKeys"><strong>st</strong> or <strong>subtitle</strong></td><td><code class="snip">{subtitle: <em>TITLE</em>}</code></td></tr><tr><td class="shortKeys"><strong>a</strong> or <strong>artist</strong></td><td><code class="snip">{artist: <em>NAME</em>}</code></td></tr><tr><td class="shortKeys"><strong>al</strong> or <strong>album</strong></td><td><code class="snip">{album: <em>TITLE</em>}</code></td></tr><tr><td class="shortKeys"><strong>c</strong> or <strong>comment</strong></td><td><code class="snip">{comment: <em>DESCRIPTION</em>}</code></td></tr><tr><td class="shortKeys"><strong>col</strong> or <strong>column</strong></td><td><code class="snip">{column_break}</code></td></tr><tr><td class="shortKeys"><strong>chorus</strong></td><td>Adds complete chorus block, beginning with <code class="snip">{start_of_chorus}</code></td></tr><tr><td class="shortKeys"><strong>tab</strong></td><td>Adds complete tablature block, beginning with <code class="snip">{start_of_tab}</code></td></tr></tbody></table><p>Others: <code>soc</code> &amp; <code>eoc</code> (mark <em>chorus</em> block) and <code>sot</code> &amp; <code>eot</code> (mark <em>tab</em> block). <code>d</code> adds <code>{define:...}</code> tag.</p><p>TIP: When a snippet\'s added some &ldquo;placeholder text&rdquo; may be highlighted -- just type whatever you wish to replace this. If more than one placeholder is available pressing <code class="key">TAB</code> again will cycle through them.</p></div>';