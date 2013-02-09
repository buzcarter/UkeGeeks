<?php 

include_once(Ugs::$config->ViewModelPath .'Source_Vm.php');

/**
 * View Model Builder -- Creates a "Source" View Model
 * @class Source_Vmb
 */
class Source_Vmb {

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	public function Build() {
		$fname = FileHelper::getFilename();
		$data = FileHelper::getFile(Config::SongDirectory . $fname);

		$viewModel = new Source_Vm();
		$viewModel->PageTitle = 'Song Source for &quot;' . $fname . '&quot; ChordPro (CPM)/UkeGeeks File Format';
		$viewModel->Body = htmlspecialchars($data);

		header('X-Powered-By: ' . Config::PoweredBy);
		return $viewModel;
	}

}

