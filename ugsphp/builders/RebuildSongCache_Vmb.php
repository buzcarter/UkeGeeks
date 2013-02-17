<?php

/**
 * 
 * @class RebuildSongCache_Vmb
 */
class RebuildSongCache_Vmb {

	// -----------------------------------------
	// PUBLIC METHODS
	// -----------------------------------------
	public function Build() {
		$timestart = microtime(true);

		$cache = new SongListCacheManager();
		$songList = $cache->Rebuild();

		$viewModel = new RebuildSongCache_Vm();
		$viewModel->SongCount = count($songList);
		$viewModel->ElapsedTime = round(microtime(true) - $timestart, 5);
		return $viewModel;
	}
}