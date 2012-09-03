<?php

include_once(Ugs::$config->ViewModelPath . 'SongList_Vm.php');

/**
 * View Model Builder -- Creates a "Song List" View Model
 * @class SongList_Vmb
 */
class SongList_Vmb {

	// -----------------
	private $_files = null;
	private $pattern = '/(.*?)\.cpm\.txt$/';

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	public function Build() {
		$this->_files = $this->getFiles(Config::SongDirectory);
		$view = new SongList_Vm();
		$view->SongList = $this->listFiles();
		header('X-Powered-By: ' . Config::PoweredBy);
		return $view;
	}

	// -----------------------------------------
	// PRIVATE METHODS
	// -----------------------------------------
	/**
	 * Emits list of links to all songs in the directory.
	 * @method listFiles
	 * @return (song array)
	 */
	private function listFiles() {
		// TODO: use config's FileExtension

		$list = array();
		foreach ($this->_files as $f) {
			$s = preg_replace($this->pattern, '$1', $f);
			$title = $this->getTitle($s);
			$song = new SongLink();
			$song->Title = $title;
			$song->Uri = (Config::UseModRewrite) ? '/songbook/' . $s : '/song.php?song=' . $s;
			$list[] = $song;
		}
		return $this->sortSongs($list);
	}

	/**
	 * Handles titles beginning with "The"
	 * @private 
	 * @method getTitle 
	 * @param string $filename 
	 * @return string
	 */
	private function getTitle($filename) {
		$title = trim(ucwords(str_replace('-', ' ', str_replace('_', ' ', $filename))));
		$pos = strpos($title, 'The ');
		if (($pos !== false) && ($pos == 0)) {
			$title = substr($title, 4, strlen($title)) . ', The';
		}
		return $title;
	}

	/**
	 * Sorts a Song List based on title
	 * @method sortSongs
	 * @param SongArray $songList
	 * @return (song array)
	 */
	private function sortSongs($list) {
		$temp = array();
		$sortedTitles = array();
		foreach ($list as $song) {
			$sortedTitles[] = $song->Title;
			$temp[$song->Title] = $song;
		}

		sort($sortedTitles);

		$newList = array();
		foreach ($sortedTitles as $title) {
			$newList[] = $temp[$title];
		}
		return $newList;
	}

	/**
	 * Emits list of links to all songs in the directory.
	 * @private 
	 * @method getFiles 
	 * @param string $dir 
	 * @return array
	 */
	private function getFiles($dir) {
		$f = array();
		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					if ((filetype($dir . $file) == 'file') && (preg_match($this->pattern, $file) === 1)){
						$f[] = $file;
					}
				}
				closedir($dh);
			}
		}
		sort($f, SORT_STRING);
		return $f;
	}

}
