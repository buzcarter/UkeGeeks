const SongViewModelBuilder = require('./Song_Vmb');
const SongListViewModelBuilder = require('./SongList_Vmb');

function homeHandler(req, res) {
  res.render('song');
}

module.exports = {
  home: homeHandler,
  song: SongViewModelBuilder,
  songList: SongListViewModelBuilder,
};
