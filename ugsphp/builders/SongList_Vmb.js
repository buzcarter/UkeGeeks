const fs = require('fs');
const serverConfig = require('../configs/server.json');
const SongViewModel = require('../viewmodels/Song_Vm');
const Config = require('../Config');

/**
 * Populates SongList View Model by reading and parsing filenames in the source directory
 * @return {SongViewModel}
 */
function Build(req, res) {
  // serverConfig.SongDirectory
  const files = fs.readdirSync('cpm');
  const viewModel = new SongViewModel();

  files.forEach((filename) => {
    // Parse the filename (to make a Title) and create URL.
    const s = filename.replace(Config.FileNamePattern, '');
    viewModel.Add(
      getTitle(s),
      // Ugs.MakeUri(Actions.Song, s)
    );
  });

  viewModel.Sort();

  res.render('song-list', viewModel);
}

/**
 * Handles titles beginning with "The"
 * @method getTitle
 * @param string filename
 * @return string
 */
function getTitle(filename) {
  // let title = trim(ucwords(str_replace('-', ' ', str_replace('_', ' ', filename))));
  // pos = strpos(title, 'The ');
  // if ((pos !== false) && (pos == 0)) {
  //   title = `${substr(title, 4, strlen(title))}, The`;
  // }
  // return title;
  return filename;
}

/**
 * View Model Builder -- Creates a "Song" View Model
 */
module.exports = Build;
