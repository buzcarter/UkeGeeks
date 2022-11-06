<?php

/**
 * View Model Builder -- Creates a "Source" View Model
 * @class Source_Vmb
 */
class Source_Vmb extends _base_Vmb {

	/**
	 * Populates Source View Model
	 * @return Source_Vm
	 */
	public function Build() {
		$fname = FileHelper::getFilename();
		$data = FileHelper::getFile(Config::$SongDirectory . $fname);
		$viewModel = new Source_Vm();
		$viewModel->PageTitle = 'Song Source for &quot;' . $fname . '&quot; ChordPro (CPM)/UkeGeeks File Format';
		$viewModel->Body = htmlspecialchars($data);

		return $viewModel;
	}

}

