<?php 

/**
 * 
 */
class SongHelper {
	
	/**
	 *
	 * @param string $text input text file block
	 * @return Song(object)
	 */
	public static  function parseSong($text) {
		$song = (object) array(
			 'isOK' => false,
			 'title' => 'Sorry... Song Not Found',
			 'subtitle' => 'Check your link, please',
			 'artist' => '',
			 'album' => '',
			 'body' => '[D]Where, oh, where has this [A7]stupid file gone?' . "\n" . 'Oh, [G]where or where can it [D]be?',
			 'meta' => array()
		);
		
		if (!$text){
			return $song;
		}
		
		$song->isOK = true;
		$song->title = self::getTitle($text);
		$song->subtitle = self::getSubtitle($text);
		$song->artist = self::getArtist($text);
		$song->album = self::getAlbum($text);
		$song->meta = self::getMeta($text);
		$song->body = $text;
		
		return $song;
	}

	// -----------------------------------------
	// PRIVATE METHODS
	// -----------------------------------------
	
	/**
	 * parses Title tag: {Title: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private static function getTitle($text) {
		return self::_matchRegEx($text, 2, "/{(t|title)\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Subtitle tag: {Subtitle: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private static function getSubtitle($text) {
		return self::_matchRegEx($text, 2, "/{(st|subtitle)\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Artist tag: {Artist: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private static function getArtist($text) {
		return self::_matchRegEx($text, 1, "/{artist\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Album tag: {Album: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private static function getAlbum($text) {
		return self::_matchRegEx($text, 1, "/{album\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Uke Geeks Meta tag: {ukegeeks-meta: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private static function getMeta($text) {
		$rtn = array();
		$regEx = "/{(ukegeeks-meta|meta)\s*:\s*(.+?)}/i";
		preg_match_all($regEx, $text, $matches);
		if (count($matches[2]) > 0){
			foreach ($matches[2] as $m) {
				$rtn[] = $m;
			}
		}
		return $rtn;
	}

	/**
	 *
	 * @param string $text input string to be parses
	 * @param int $patternIndex 
	 * @param string $regEx regular expression string
	 * @return string
	 */
	private static function _matchRegEx($text, $patternIndex, $regEx){
		preg_match_all($regEx, $text, $matches);
		return (count($matches[$patternIndex]) < 1) ? '' : $matches[$patternIndex][0];
	}


}