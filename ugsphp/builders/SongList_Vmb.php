<?php 

include_once(Ugs::$config->ViewModelPath . 'SongList_Vm.php');

/**
 * View Model Builder -- Creates a "Song List" View Model
 * @class SongList_Vmb
 */
class SongList_Vmb {

	// -----------------
	private $_files = null;

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

	/**
	 * Emits list of links to all songs in the directory.
	 * @method listFiles
	 * @return (void)
	 */
	private function listFiles() {
		// TODO: use config's FileExtension
		$pattern = '/(.*?)\.cpm\.txt$/';
		$list = array();
		foreach ($this->_files as $f) {
			$s = preg_replace($pattern, '$1', $f);
			$title = ucwords(str_replace('-', ' ', str_replace('_', ' ', $s)));
			$song = new SongLink();
			$song->Title = $title;
			$song->Uri = (Config::UseModRewrite) ? '/songbook/' . $s : '/song.php?song=' . $s;
			$list[] = $song;
		}
		return $list;
	}

	// -----------------------------------------
	// PRIVATE METHODS
	// -----------------------------------------

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
					if (filetype($dir . $file) == 'file') {
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
