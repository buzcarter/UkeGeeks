<?php

/**
 * View Model Builder -- Creates a "Song List" View Model
 * @class SongList_Vmb
 */
class SongList_Vmb extends _base_Vmb {

	/**
	 * Populates SongList View Model by reading and parsing filenames in the source directory
	 * @return SongList_Vm
	 */
	public function Build() {
		$files = FileHelper::getFilenames(Config::$SongDirectory);
		$viewModel = new SongList_Vm();

		foreach ($files as $filename) {
			// Parse the filename (to make a Title) and create URL.
			$s = preg_replace(Config::FileNamePattern, '$1', $filename);
			$viewModel->Add(
				$this->getTitle($s),
				Ugs::MakeUri(Actions::Song, $s)
			);
		}

		$viewModel->Sort();

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
