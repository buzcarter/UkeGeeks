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
	public function Build() {
		$this->fname = $this->getFilename();
		$data = $this->getFile(Config::SongDirectory . $this->fname);
		$this->song = $this->parseSong($data);

		$modelView = new Song_Vm();
		$modelView->PageTitle = htmlspecialchars((($this->song->isOK) ? ($this->song->title . ((strlen($this->song->subtitle) > 0) ? (' | ' . $this->song->subtitle) : '')) : 'Not Found') . ' ' . Config::PageTitleSuffix);
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
	private function getFilename() {
		$s = (isset($_GET['song'])) ? $_GET['song'] : '';
		if (strlen($s) < 1){
			return Config::NotFound_404File;
		}
		if (strpos($s, '.txt') || strpos($s, '.cpm')){
			return $s;
		}
		$pattern = '/(.*[\/])?(.*?)(\.html?)?$/';
		$s = preg_replace($pattern, '$2', $s) . Config::FileExtension;
		return $s;
	}

	//****
	private function getFile(/* string */ $fname) {
		$data = '';
		if (!file_exists($fname)) {
			return null;
			// die($errPrefix." &quot;".$fname."&quot; not found.");
		}
		$fh = fopen($fname, 'r');
		$data = fread($fh, Config::MaxFileSize);
		fclose($fh);
		return $data;
	}

	//****
	private function parseSong(/* string */ $text) {
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

	//****
	private function getTitle($text) {
		return $this->_matchRegEx($text, 2, "/{(t|title)\s*:\s*(.+?)}/i");
	}

	//****
	private function getSubtitle($text) {
		return $this->_matchRegEx($text, 2, "/{(st|subtitle)\s*:\s*(.+?)}/i");
	}

	//****
	private function getArtist($text) {
		return $this->_matchRegEx($text, 1, "/{artist\s*:\s*(.+?)}/i");
	}

	//****
	private function getAlbum($text) {
		return $this->_matchRegEx($text, 1, "/{album\s*:\s*(.+?)}/i");
	}

	//****
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
	private function _matchRegEx($text, $patternIndex, $regEx){
		preg_match_all($regEx, $text, $matches);
		return (count($matches[$patternIndex]) < 1) ? '' : $matches[$patternIndex][0];
	}
	
}

