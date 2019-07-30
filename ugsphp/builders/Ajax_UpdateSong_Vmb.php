<?php
class Ajax_UpdateSong_Vmb extends _base_Vmb {

	public function Build(){
		$viewModel = new JsonResponse_Vm();
		$viewModel->HasErrors = true;

		if (!$this->SiteUser->MayEdit || !$this->SiteUser->IsAuthenticated){
			return $viewModel;
		}

		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			return $viewModel;
		}

		$json = Ugs::GetJsonObject();
		$viewModel->Id = $json->filename;
		$song = $json->song;

		if ((strlen($viewModel->Id) < 1) || (strlen($song) < 1)){
			$viewModel->Message = 'JSON data is missing.';
			return $viewModel;
		}

		$fullFilePath = Config::$SongDirectory . $viewModel->Id;

		if (!file_exists($fullFilePath)) {
			$viewModel->Message = 'Song file not found; can\'t update.';
			return $viewModel;
		}

		file_put_contents($fullFilePath, $song);

		$viewModel->HasErrors = false;
		$viewModel->Message = Lang::Get('success');

		return $viewModel;
	}
}
