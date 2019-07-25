<?php
/**
 * Enum for possible Actions (url to ViewModel mappings)
 * @class Actions
 * @namespace ugsPhp
 */
final class Actions {
	const Song = 0;
	const Songbook = 1;
	const Source = 2;
	const Reindex = 3;
	const Login = 4;
	const Logout = 5;
	const Edit = 6;
	// AJAX Actions
	const AjaxNewSong = 7;
	const AjaxUpdateSong = 8;
	const AjaxDeleteSong = 9;

	/**
	 * convert passed in string value to corresponding Actions enum
	 * @param [string] $value
	 * @return  Actions
	 */
	public static function ToEnum($value){
		switch (strtolower($value)) {
			case 'song': return self::Song;
		 	case 'reindex':  return self::Reindex;
		 	case 'source': return self::Source;
		 	case 'edit': return self::Edit;
		 	case 'login': return self::Login;
		 	case 'logout': return self::Logout;
		 	case 'ajaxnewsong': return self::AjaxNewSong;
		 	case 'ajaxupdatesong': return self::AjaxUpdateSong;
		 	case 'ajaxdeletesong': return self::AjaxDeleteSong;
		 }
		 return self::Songbook;
	}

	/**
	 * Converts Actions enum to a string; you should use this for URI's
	 * @param Actions(int-enum) $value
	 * @return string
	 */
	public static function ToName($value){
		switch($value){
			case self::Song: return 'Song';
			case self::Source: return 'Source';
		 	case self::Edit: return 'edit';
			case self::Reindex: return 'Reindex';
			case self::Login: return 'Login';
			case self::Logout: return 'Logout';
			case self::AjaxNewSong: return 'AjaxNewSong';
			case self::AjaxUpdateSong: return 'AjaxUpdateSong';
			case self::AjaxDeleteSong: return 'AjaxDeleteSong';
		}
		return 'Songbook';
	}
}
