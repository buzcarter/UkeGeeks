/**
 * View Model Builder --
 * @class SongListDetailed_Vmb
 */
class SongListDetailed_Vmb extends _base_Vmb {
  /**
	 * Populates SongList View Model using Cache Manager
	 */
  Build() {
    $viewModel = new SongList_Vm();
    $viewModel.IsNewAllowed = $this.SiteUser.MayEdit && $this.SiteUser.IsAuthenticated;
    $cache = new SongListCacheManager();
    $viewModel.SongList = $cache.Get();
    return $viewModel;
  }
}
