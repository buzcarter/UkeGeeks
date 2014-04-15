/**
 * Exposes the only method required to attach UkeGeeks Scriptasaurus Song-a-matic editor functionality.
  * @namespace  ugsEditorPlus
 * @class _ROOT_
 * @for ugsEditorPlus._ROOT_
  */
var ugsEditorPlus = (function() {
	/**
	 * attach public members to this object
	 * @property _public
	 * @private
	 * @type JsonObject
	 */
	var _public = {};

	/**
	 * Options (Features) you can turn on or off. Where available defaults to values defined in UkeGeeks.settings
	 * @class options
	 * @public
	 * @type JSON Object
	 * @for _ROOT_
	 */
	_public.options = {
		/**
		 * If true attempts compatibility for versions of Microsoft Internet Explorer prior to IE9
		 * @example
		 *  Allowed values: true, false
		 * @property useLegacyIe
		 * @for  options
		 * @type Boolean
		 * @default false
		 */
		useLegacyIe: false,

		/**
		 * If true the Edit Song box is shown when the page loads; false hides it.
		 * @example
		 *  Allowed values: true, false
		 * @property showEditOnLoad
		 * @type Boolean
		 * @default true
		 */
		showEditOnLoad: true,

		/**
		 * Lyric's font size (pts)
		 * @example
		 *  Allowed values: 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 13, 14
		 * @property fontSize
		 * @type Number
		 * @default 12
		 */
		fontSize: 12,

		/**
		 * Reference diagram size expressed as a percentage (100% being max)
		 * @example
		 *  Allowed values: 40 ("tiny"), 65 ("small"), 80 ("medium"), 90 ("large"), 100 ("x-large")
		 * @property diagramSize
		 * @type Integer
		 * @default 100
		 */
		diagramSize: 100,

		/**
		 * Specify where reference diagrams should be show
		 * @example
		 *  Allowed values: left, top, or none
		 * @property diagramPosition
		 * @type Text
		 * @default left
		 */
		diagramPosition: "left",

		/**
		 * Specify how chord names within lyrics should be shown
		 * @example
		 *  Allowed values: inline, above, or miniDiagrams
		 * @property lyricStyle
		 * @type Text
		 * @default above
		 */
		lyricStyle: "above",

		/**
		 * Specify page width (mock paper)
		 * @example
		 *  Allowed values: letter, a4, screen
		 * @property paper
		 * @type Text
		 * @default letter
		 */
		paper: "letter",

		/**
		 * Theme shortname applied on page load.
		 * @example
		 *  Allowed values: frosty, jellyBean, justBlack, krampus, normal, notebook, pumpkin, reversed, western, zombie
		 * @property theme
		 * @type Text
		 * @default normal
		 */
		theme: "normal",

		/**
		 * Ukulele tuning ("instrument") for drawing diagrams.
		 * @example
		 *  Allowed values: soprano or baritone
		 * @property tuning
		 * @type Text
		 * @default soprano
		 */
		tuning: "soprano",

		/**
		 * Show/hide the square brackets around chord names within lyrics, ex: [Am]
		 * @example
		 *  Allowed values: true, false
		 * @property hideChordEnclosures
		 * @type Boolean
		 * @default see UkeGeeks.settings
		 */
		hideChordEnclosures: false,

		/**
		 * Order in which reference diagrams are sorted, either alphabetically (true) or order
		 * in which they appear within the song (false).
		 * @example
		 * Allowed values: true, false
		 * @property sortAlphabetical
		 * @type Boolean
		 * @default see UkeGeeks.settings
		 */
		sortAlphabetical: false,

		/**
		 * If TRUE chords in the "commonChords" list will be ignored (excluded from reference chord diagrams)
		 * @example
		 * Allowed values: true, false
		 * @property ignoreCommonChords
		 * @type Boolean
		 * @default see UkeGeeks.settings
		 */
		ignoreCommonChords: false,

		/**
		 * Array of chords to be ignored when drawing reference diagrams (if "ignoreCommonChords" is enabled)
		 * @example
		 *  (string or array of strings): as an  array of strings: ["A", "G"] or comma delimited list: "A, G"
		 * @property commonChords
		 * @type mixed
		 * @default see UkeGeeks.settings
		 */
		commonChords: []
	};

	/**
	 * attaches event handlers, preps variables, and runs UGS
	 * @method init
	 * @for  _ROOT_
	 * @public
	 * @param options {OBJECT} (optional) Object/JSON with any of the ugsEditorPlus.options
	 */
	_public.init = function(options) {
		var opts = mergeOptions(options);

		ukeGeeks.settings.opts.retainBrackets = !opts.hideChordEnclosures;
		$('#songSourceDlg').toggle(opts.showEditOnLoad);

		ukeGeeks.scriptasaurus.init(opts.useLegacyIe);

		ugsEditorPlus.actions.init();
		ugsEditorPlus.topMenus.init();
		ugsEditorPlus.submenuUi.init();
		ugsEditorPlus.optionsDlg.init();
		ugsEditorPlus.chordBuilder.init();
		ugsEditorPlus.actions.run();
	};

	var mergeOptions = function(options) {
		var opts = {
			hideChordEnclosures: !ukeGeeks.settings.opts.retainBrackets,
			sortAlphabetical: ukeGeeks.settings.opts.sortAlphabetical,
			ignoreCommonChords: ukeGeeks.settings.opts.ignoreCommonChords,
			commonChords: ukeGeeks.settings.commonChords
		};

		return $.extend(_public.options, opts, (typeof options === "object") ? options : {});
	};

	/**
	 * Use init method instead. Wraps the Init method for modern browsers
	 * @method attach
	 * @deprecated Use init instead
	 * @public
	 */
	_public.attach = function(){
		_public.init({
			useLegacyIe: false
		});
	};

	/**
	 * Use init method instead. Wraps the Init method, required for Legacy Internet Exploere (pre-9).
	 * @method attachIe
	 * @deprecated Use init instead
	 * @public
	 */
	_public.attachIe = function(){
		_public.init({
			useLegacyIe: true
		});
	};

	// ---------------------------------------
	// return public interface "JSON handle"
	// ---------------------------------------
	return _public;

}());