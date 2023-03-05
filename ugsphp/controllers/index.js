function homeHandler(req, res) {
  res.render('song');
}

function songHandler(req, res) {
  res.render('song');
}

function songListHandler(req, res) {
  res.render('song-list');
}

module.exports = {
  home: homeHandler,
  song: songHandler,
  songList: songListHandler,
};
