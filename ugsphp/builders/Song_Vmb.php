<?php 

include_once(Ugs::$config->ViewModelPath .'Song_Vm.php');

/**
 * View Model Builder -- Creates a "Song" View Model
 * @class Song_Vmb
 */
class Song_Vmb {

	// -----------------------------------------
	private $fname = '';
	private $song = null;

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	
	/**
	 * Parses file (using URL query param) and attempts to load View Model
	 * @return Song_Vm 
	 */
	public function Build() {
		$this->fname = FileHelper::getFilename();
		$data = FileHelper::getFile(Config::SongDirectory . $this->fname);
		$this->song = $this->parseSong($data);

		$title = htmlspecialchars((($this->song->isOK) ? ($this->song->title . ((strlen($this->song->subtitle) > 0) ? (' | ' . $this->song->subtitle) : '')) : 'Not Found'));
		
		$modelView = new Song_Vm();
		$modelView->PageTitle = ((strlen($title) > 0) ? $title : $this->fname) . ' ' . Config::PageTitleSuffix;
		$modelView->SongTitle = htmlspecialchars($this->song->title);
		$modelView->Subtitle = htmlspecialchars($this->song->subtitle);
		$modelView->Artist = $this->song->artist;
		$modelView->Album = $this->song->album; // htmlspecialchars();
		$modelView->Body = $this->song->body;
		$modelView->UgsMeta = $this->song->meta;
		$modelView->SourceUri = ((Config::UseModRewrite) ? '/source/' : '/song-source.php?song=' ) . $this->fname;

		header('X-Powered-By: ' . Config::PoweredBy);
		return $modelView;
	}

	// -----------------------------------------
	// PRIVATE METHODS
	// -----------------------------------------
	
	/**
	 *
	 * @param string $text input text file block
	 * @return Song(object)
	 */
	private function parseSong($text) {
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
		$song->title = $this->getTitle($text);
		$song->subtitle = $this->getSubtitle($text);
		$song->artist = $this->getArtist($text);
		$song->album = $this->getAlbum($text);
		$song->meta = $this->getMeta($text);
		$song->body = $text;
		return $song;
	}

	/**
	 * parses Title tag: {Title: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private function getTitle($text) {
		return $this->_matchRegEx($text, 2, "/{(t|title)\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Subtitle tag: {Subtitle: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private function getSubtitle($text) {
		return $this->_matchRegEx($text, 2, "/{(st|subtitle)\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Artist tag: {Artist: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private function getArtist($text) {
		return $this->_matchRegEx($text, 1, "/{artist\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Album tag: {Album: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private function getAlbum($text) {
		return $this->_matchRegEx($text, 1, "/{album\s*:\s*(.+?)}/i");
	}

	/**
	 * parses Uke Geeks Meta tag: {ukegeeks-meta: Blah Blah}
	 * @param string $text input string to be parses
	 * @return string 
	 */
	private function getMeta($text) {
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

	// Helpers
	
	/**
	 *
	 * @param string $text input string to be parses
	 * @param int $patternIndex 
	 * @param string $regEx regular expression string
	 * @return string
	 */
	private function _matchRegEx($text, $patternIndex, $regEx){
		preg_match_all($regEx, $text, $matches);
		return (count($matches[$patternIndex]) < 1) ? '' : $matches[$patternIndex][0];
	}
	
}

