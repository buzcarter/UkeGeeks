// const serverConfig = require('../configs/server.json');
const { properCase } = require('../lib/strUtils');
const Actions = require('../classes/Actions');
const Config = require('../Config');
const fs = require('fs');
const SongListViewModel = require('../viewmodels/SongList_Vm');
const uriUtils = require('../lib/uriUtils');

/**
 * Populates SongList View Model by reading and parsing filenames in the source directory
 * @return {SongViewModel}
 */
function Build(req, res) {
  // serverConfig.SongDirectory
  const files = fs.readdirSync('cpm');
  const viewModel = new SongListViewModel();

  files.forEach((filename) => {
    // Parse the filename (to make a Title) and create URL.
    const s = filename.replace(Config.FileNamePattern, '$1');
    viewModel.Add(
      getTitle(s),
      uriUtils.MakeUri(Actions.Song, s),
    );
  });

  viewModel.Sort();

  res.render('song-list', viewModel);
}

/**
 * Handles titles beginning with "The"
 * @param {string} filename
 * @return {string}
 */
function getTitle(filename) {
  const title = properCase(filename.replaceAll('_', ' ').replaceAll('-', ' ').trim());
  const pos = title.indexOf('The ');
  return ((pos !== false) && (pos == 0))
    ? `${title.substr(4, title.length)}, The`
    : title;
}

/**
 * View Model Builder -- Creates a basic "Song List" View Model
 */
module.exports = Build;
