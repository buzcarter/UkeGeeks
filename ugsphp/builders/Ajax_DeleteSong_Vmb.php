<?php
class Ajax_DeleteSong_Vmb extends _base_Vmb {

	public function Build(){
		$viewModel = new JsonResponse_Vm();
		$viewModel->HasErrors = true;

		if (!$this->SiteUser->MayEdit && !$this->SiteUser->IsAuthenticated){
			return $viewModel;
		}

		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			return $viewModel;
		}

		$json = Ugs::GetJsonObject();
		$viewModel->Id = $json->filename;

		if (strlen($viewModel->Id) < 1){
			$viewModel->Message = 'JSON data is missing.';
			return $viewModel;
		}

		$fullFilePath = Config::$SongDirectory . $viewModel->Id;

		if (!file_exists($fullFilePath)) {
			$viewModel->Message = 'Song file not found; can\'t delete.';
			return $viewModel;
		}

    unlink($fullFilePath);

    // Rebuild song cache
    $cache = new SongListCacheManager();
    $cache->Rebuild();

		$viewModel->HasErrors = false;
		$viewModel->Message = 'Success!';

		return $viewModel;
	}
}
