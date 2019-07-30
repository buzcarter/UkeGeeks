<?php

/**
 * 
 * @class RebuildSongCache_Vmb
 */
class RebuildSongCache_Vmb extends _base_Vmb {

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	public function Build() {
    if(!$this->SiteUser->IsAuthenticated || !$this->SiteUser->MayEdit)
    {
      die(Lang::Get('reindex_forbid'));
    }

		$timestart = microtime(true);

		$cache = new SongListCacheManager();
		$songList = $cache->Rebuild();

		$viewModel = new RebuildSongCache_Vm();
		$viewModel->SongCount = count($songList);
		$viewModel->ElapsedTime = round(microtime(true) - $timestart, 5);
		return $viewModel;
	}
}
