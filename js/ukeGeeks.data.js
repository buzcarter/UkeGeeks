/**
 * A container or Models library. ukegeeks.data is really a "Models" namespace. Please refactor.
 * @class data
 * @namespace ukeGeeks
 */
ukeGeeks.data = new function(){
	/**
	 * Chord info sutiable for plotting on Canvas; has name and dot positions
	 * @class expandedChord
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.expandedChord = function(name){
		/**
		 * string, i.e. 'C#6'
		 * @property name
	   * @type string
	   */
		this.name= name;
		/**
		 * Array of data.dot objects
		 * @property dots
	   * @type array 
	   */
		this.dots= [];
		/**
		 * Array of bools, true means that string is not played (muted). i.e. chord.mute[2] means third string is muted.
		 * @property mute
	   * @type array 
	   */
		this.muted= [];
	};

	/**
	 * Song object holds all meta info (Title, Subtitles) plus an array of plot
	 * @class song
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.song = function(){ 
		/**
		 * Song Title
		 * @property title
	   * @type string
	   */
		this.title= '';
		/**
		 * Album
		 * @property album
	   * @type string
	   */
		this.album = '';
		/**
		 * Artist Info
		 * @property artist
	   * @type string
	   */
		this.artist = '';
		/**
		 * Subtitle, often Artist Info
		 * @property st
	   * @type string
	   */
		this.st= ''; 
		/**
		 * Subtitle Number 2, subtitle2 (not used yet)
		 * @property st2
	   * @type string
	   */
		this.st2= '';
		/**
		 * 
		 * @property body
	   * @type string
	   */
		this.body= '';
		/**
		 * True if there is at least one chord in use, false otherwise. Useful for laying out tablature, which might have no chords.
		 * @property hasChords
	   * @type bool
	   */
		this.hasChords = false;
		
		this.ugsMeta=[];
		/**
		 * array of data.dots 
		 * @property defs
	   * @type array
	   */
		this.defs= [];
	};

	/**
	 * A single fretboard fingering "dot" -- the position on the Canvas object that a dot should occupy.
	 * @class dot
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	this.dot = function(string, fret, finger){
		/**
		 * The ukulele's string, numbered from "top" (1) to "bottom" (4). Sporano uke strings would be ['G' => 1,'C' => 2,'E' => 3,'A' => 4]
		 * @property string
	   * @type int
	   */
		this.string= string;
		/**
		 * Fret position, i.e. 0-12
		 * @property fret
	   * @type int
	   */
		this.fret = fret;
		/**
		 * Your finger, 0-4
		 * @property finger
	   * @type int
	   */
		this.finger = finger;
	};

	this.instrument  = function(key, name, tuning, chords){
		this.key = key;
		this.name = name;
		this.tuning = tuning;
		this.chords = chords;
	};
	
// -----------------------------------------------------------------------------------------
// *** DOCUMENTAION ONLY ***
// -----------------------------------------------------------------------------------------
/**
	 * Documentation Only (no JS Definition)
	 * <br />
	 * <br />The JSON format used for add-in fingerings. Frequently you'll add this to indicate 
	 * "nutting" or "barring" with one or more fingers.
	 * <br />
	 * <br />For example, the D7 is often played by laying the index finger across the entire 
	 * second fret and then placing middle finger on 3rd fret of "A" string like this:
	 <pre>
	  G C E A  
	  - - - -  (1st fret)
		X X X X
		- - - X
		- - - -  (4th fret)
	 </pre>
	 * The "A" string has two fingers on it, obviously one does nothing -- except to make the 
	 * chord much easier to play.
	 * 
	 * @class addInFinger
	 * @for ukeGeeks.data
	 * @namespace ukeGeeks.data
	 */
	/**
		* ex: 'G'
		* @property string
		* @type char
		* @for ukeGeeks.data.addInFinger
		*/
	/**
		* ex: 0-12
		* @property fret
		* @type int
		* @for ukeGeeks.data.addInFinger
		*/
	/**
		* ex: 0-4 (where 1 = index finger and 4 = pinky)
		* @property  finger
		* @type int
		* @for ukeGeeks.data.addInFinger
		*/

}