<?php
/**
 * View Model Builder --
 * @class SongListDetailed_Vmb
 */
class SongListDetailed_Vmb {

	/**
	 * Populates SongList View Model using Cache Manager
	 */
	public function Build() {
		$view = new SongList_Vm();
		$cache = new SongListCacheManager();
		$view->SongList = $cache->Get();
		return $view;
	}

}
