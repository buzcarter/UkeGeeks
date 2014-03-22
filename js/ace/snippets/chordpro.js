define('ace/snippets/chordpro', ['require', 'exports', 'module'], function(require, exports, module) {

	exports.snippetText = [
		// title tag
		'snippet t',
		'	{title: ${1:title}}',
		'snippet title',
		'	{title: ${1:title}}',

		// subtitle tag
		'snippet st',
		'	{subtitle: ${1:name}}',
		'snippet sub',
		'	{subtitle: ${1:name}}',
		'snippet subtitle',
		'	{subtitle: ${1:name}}',

		// artist tag
		'snippet a',
		'	{artist: ${1:name}}',
		'snippet artist',
		'	{artist: ${1:name}}',

		// album tag
		'snippet al',
		'	{album: ${1:title}}',
		'snippet album',
		'	{album: ${1:title}}',

		// comment tag
		'snippet c',
		'	{comment: ${1:description}}',
		'snippet comment',
		'	{comment: ${1:description}}',

		// chorus block
		'snippet soc',
		'	{start_of_chorus}',
		'snippet eoc',
		'	{end_of_chorus}',
		'snippet chorus',
		'	{start_of_chorus}',
		'	{comment: ${1:Chorus}}',
		'	${2:Music}',
		'	{end_of_chorus}',

		// tabs block
		'snippet sot',
		'	{start_of_tab}',
		'snippet eot',
		'	{end_of_tab}',
		'snippet tab',
		'	{start_of_tab}',
		'	A|-${1:-}--------------------------------|',
		'	E|----------------------------------|',
		'	C|----------------------------------|',
		'	G|----------------------------------|',
		'	{end_of_tab}',

		// define tag
		'snippet d',
		'	{define: ${1:name} frets ${2:G_fretNum} ${3:C_fretNum} ${4:E_fretNum} ${5:A_fretNum} fingers ${6:fingerNum} ${7:fingerNum} ${8:fingerNum} ${9:fingerNum}}',
		'snippet add',
		'	add: string ${1:stringNum} fret ${2:fretNum} finger ${3:fingerNum}',

		// single-liners
		'snippet col',
		'	{column_break}',
		'snippet column',
		'	{column_break}',
		'snippet colb',
		'	{column_break}',

		// that's all folks!
		// chord usage
		'snippet [',
		'	[${1:Chord}]',

	].join("\n");

	exports.scope = "chordpro";

});