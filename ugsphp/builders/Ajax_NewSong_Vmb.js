<?php

class Ajax_NewSong_Vmb extends _base_Vmb{

	public function Build(){
		$viewModel = new JsonResponse_Vm();

		if (!$this->SiteUser->MayEdit || !$this->SiteUser->IsAuthenticated){
			return $viewModel;
		}

		if ($_SERVER['REQUEST_METHOD'] != "POST") {
			return $viewModel;
		}

		$json = Ugs::GetJsonObject();
		if ($this->CreateSongFile($json->songTitle, $json->songArtist, $viewModel)){
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
			$viewModel->Message = '(e:805) Something\'s gone wrong whilst saving.';
			return false;
		}

		$viewModel->ContinueUri = Ugs::MakeUri( Actions::Edit, $viewModel->Id);
		return true;
	}

}