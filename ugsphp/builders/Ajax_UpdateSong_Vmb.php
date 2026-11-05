<?php
class Ajax_UpdateSong_Vmb extends _base_Vmb {

	public function Build(){
		$viewModel = new JsonResponse_Vm();
		$viewModel->HasErrors = true;

		if (!$this->SiteUser->MayEdit || !$this->SiteUser->IsAuthenticated){
			$viewModel->StatusCode = 403;
			$viewModel->Message = 'You are not allowed to edit songs.';
			return $viewModel;
		}

		if (!Ugs::IsSafeJsonPost()) {
			$viewModel->StatusCode = 403;
			$viewModel->Message = 'Request refused.';
			return $viewModel;
		}

		$json = Ugs::GetJsonObject();
		$filename = ($json && isset($json->filename) && is_string($json->filename)) ? $json->filename : '';
		$song = ($json && isset($json->song) && is_string($json->song)) ? $json->song : '';

		if ((strlen($filename) < 1) || (strlen($song) < 1)){
			$viewModel->StatusCode = 400;
			$viewModel->Message = 'JSON data is missing.';
			return $viewModel;
		}

		if (strlen($song) > Config::MaxFileSize) {
			$viewModel->StatusCode = 413;
			$viewModel->Message = 'Song is too large.';
			return $viewModel;
		}

		// only ever an existing song file directly inside the song directory (no "../")
		$fullFilePath = FileHelper::getSongPath($filename);
		if ($fullFilePath === null) {
			$viewModel->StatusCode = 404;
			$viewModel->Message = 'Song file not found; can\'t update.';
			return $viewModel;
		}
		$viewModel->Id = basename($fullFilePath);

		if (file_put_contents($fullFilePath, $song, LOCK_EX) === false) {
			$viewModel->Message = 'Something\'s gone wrong whilst saving.';
			return $viewModel;
		}

		$viewModel->HasErrors = false;
		$viewModel->Message = 'Success!';

		return $viewModel;
	}
}
