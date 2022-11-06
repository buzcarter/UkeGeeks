const fs = require('fs');
const serverConfig = require('../configs/server.json');
const SongHelper = require('../classes/SongHelper');
const SongViewModel = require('../viewmodels/Song_Vm');

/**
 * Parses file (using URL query param) and attempts to load View Model
 * @return {Song_Vm}
 */
function Build(req, res) {
  // Config.SongDirectory;
  const filename = `cpm/${req.params.cpm}.cpm.txt`;
  const fileContent = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });

  const song = SongHelper.parseSong(fileContent);

  // const title = htmlspecialchars(((song.isOK) ? (song.title + ((song.subtitle) ? (` | ${song.subtitle}`) : '')) : 'Not Found'));

  const viewModel = Object.assign(new SongViewModel(), {
    PageTitle: MakePageTitle(song, filename),
    SongTitle: song.title, // htmlspecialchars(song.title)
    Subtitle: song.subtitle, // htmlspecialchars(song.subtitle)
    Artist: song.artist,
    Album: song.album, // htmlspecialchars()
    Body: song.body,
    UgsMeta: song.meta,
    SourceUri: '#SourceUri', // Ugs.MakeUri(Actions.Source, filename)
    // EditUri: Ugs.MakeUri(Actions.Edit, filename)

    Id: filename,
    IsUpdateAllowed: false, // $this.SiteUser.MayEdit && $this.SiteUser.IsAuthenticated

    EditorSettingsJson: null, // $this.getSettings()
  });

  res.render('song', viewModel);
}

/**
 * Uses either Title(s) from Song or the file name
 * @param {string} song
 * @param {string} filename
 * @return {string}
 */
function MakePageTitle(song, filename) {
  let title = '';

  if (song.isOK) {
    title = song.title;

    if (song.artist) {
      title += ` - ${song.artist}`;
    } else if (song.subtitle) {
      title += ` - ${song.subtitle}`;
    }

    // title = htmlspecialchars(title);
  }

  return `${title || filename} ${serverConfig.PageTitleSuffix}`;
}

/**
 * View Model Builder -- Creates a "Song" View Model
 */
module.exports = Build;
