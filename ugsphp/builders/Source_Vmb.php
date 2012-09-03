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
		$fname = $this->getFilename();
		$data = $this->getFile(Config::SongDirectory . $fname);

		$modelView = new Source_Vm();
		$modelView->PageTitle = 'Song Source for &quot;' . $fname . '&quot; ChordPro (CPM)/UkeGeeks File Format';
		$modelView->Body = htmlspecialchars($data);

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
}

