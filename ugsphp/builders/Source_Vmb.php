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
		$data = FileHelper::getSongFile($fname);
		$viewModel = new Source_Vm();
		$viewModel->PageTitle = 'Song Source for "' . $fname . '" ChordPro (CPM)/UkeGeeks File Format';
		$viewModel->IsFound = ($data !== null);
		// served as text/plain + nosniff, so the raw text is safe (and shows "<" correctly)
		$viewModel->Body = ($data === null) ? 'Song not found.' : $data;

		return $viewModel;
	}

}

