<?php

class Ajax_NewSong_Vmb extends _base_Vmb{

	public function Build(){
		$viewModel = new JsonResponse_Vm();

		if (!$this->SiteUser->MayEdit || !$this->SiteUser->IsAuthenticated){
			$viewModel->StatusCode = 403;
			$viewModel->Message = 'You are not allowed to add songs.';
			return $viewModel;
		}

		if (!Ugs::IsSafeJsonPost()) {
			$viewModel->StatusCode = 403;
			$viewModel->Message = 'Request refused.';
			return $viewModel;
		}

		$json = Ugs::GetJsonObject();
		$title = ($json && isset($json->songTitle) && is_string($json->songTitle)) ? trim($json->songTitle) : '';
		$artist = ($json && isset($json->songArtist) && is_string($json->songArtist)) ? trim($json->songArtist) : '';
		if ($this->CreateSongFile($title, $artist, $viewModel)){
			$cache = new SongListCacheManager();
			$cache->Rebuild();
		}
		return $viewModel;
	}

	private function CreateSongFile($title, $artist, $viewModel){
		if (strlen($title) < 1){
			$viewModel->HasErrors = true;
			$viewModel->Message = 'Song title is required, sorry.';
			return false;
		}
		try {
		$fWriter = new FileWriter();
		$viewModel->Id = $fWriter->MakeFile($title, $artist);
		$viewModel->HasErrors = (strlen($viewModel->Id) < 1);
		if ($viewModel->HasErrors){
				$viewModel->Message = '(e:803) Something\'s gone wrong whilst saving.';
			return false;
		}
		}
		catch ( Exception $e ) {
			$viewModel->HasErrors = true;
			$viewModel->Message = '(e:805) Something\'s gone wrong whilst saving.';
			return false;
		}

		$viewModel->ContinueUri = Ugs::MakeUri( Actions::Edit, urlencode($viewModel->Id));
		return true;
	}

}