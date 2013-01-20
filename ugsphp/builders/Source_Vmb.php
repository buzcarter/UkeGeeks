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

		$modelView = new Source_Vm();
		$modelView->PageTitle = 'Song Source for &quot;' . $fname . '&quot; ChordPro (CPM)/UkeGeeks File Format';
		$modelView->Body = htmlspecialchars($data);

		header('X-Powered-By: ' . Config::PoweredBy);
		return $modelView;
	}

}

