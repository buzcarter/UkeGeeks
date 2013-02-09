<?php

include_once(Ugs::$config->ViewModelPath . 'SongList_Vm.php');

/**
 * View Model Builder -- Creates a "Song List" View Model
 * @class SongList_Vmb
 */
class SongList_Vmb {

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	public function Build() {
		$files = FileHelper::getFilenames(Config::SongDirectory);
		$viewModel = new SongList_Vm();

		foreach ($files as $filename) {
			// Parse the filename (to make a Title) and create URL.
			$s = preg_replace(Config::FileNamePattern, '$1', $filename);
			$viewModel->Add(
				$this->getTitle($s), 
				(Config::UseModRewrite) ? '/songbook/' . $s : '/song.php?song=' . $s
			);
	}

		$viewModel->Sort();

		header('X-Powered-By: ' . Config::PoweredBy);
		return $viewModel;
	}

	/**
	 * Handles titles beginning with "The"
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

}
