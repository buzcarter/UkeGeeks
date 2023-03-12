const SongListViewModel = require('../viewmodels/SongList_Vm');
const SongListCacheManager = require('../classes/SongListCacheManager');

function Build(req, res) {
  const viewModel = new SongListViewModel();
  viewModel.IsNewAllowed = true; // const this.SiteUser.MayEdit && const this.SiteUser.IsAuthenticated;
  const cache = new SongListCacheManager();
  viewModel.SongList = cache.Get();
  res.render('song-list-detailed', viewModel);
}

/**
 * View Model Builder -- Creates a "Songbook" (Detailed "Song List") View Model
 */
module.exports = Build;
