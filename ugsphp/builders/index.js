const SongViewModelBuilder = require('./Song_Vmb');
const SongListViewModelBuilder = require('./SongList_Vmb');
const SongListDetailedViewModelBuilder = require('./SongListDetailed_Vmb.js');

function homeHandler(req, res) {
  res.render('song');
}

module.exports = {
  home: homeHandler,

  song: SongViewModelBuilder,
  songList: SongListViewModelBuilder,

  songbook: SongListDetailedViewModelBuilder,
  songbookSong: SongViewModelBuilder,
};
