const Config = require('../Config');
const fs = require('fs');
const SongHelper = require('../classes/SongHelper');
const SongViewModel = require('../viewmodels/Song_Vm');

/**
 * Parses file (using URL query param) and attempts to load View Model
 * @return {Song_Vm}
 */
function Build(req, res) {
  const filename = `${Config.SongDirectory}/${req.params.cpm}.cpm.txt`;
  let fileContent;
  try {
    fileContent = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
  } catch (error) {
    res.send({ error, filename });
    return;
  }

  const song = SongHelper.parseSong(fileContent);

  // const title = htmlspecialchars(((song.isOK) ? (song.title + ((song.subtitle) ? (` | ${song.subtitle}`) : '')) : 'Not Found'));

  /* eslint-disable key-spacing */
  const viewModel = Object.assign(new SongViewModel(), {
    PageTitle:             MakePageTitle(song, filename),
    SongTitle:             song.title, // htmlspecialchars(song.title)
    Subtitle:              song.subtitle, // htmlspecialchars(song.subtitle)
    Artist:                song.artist,
    Album:                 song.album, // htmlspecialchars()
    Body:                  song.body,
    UgsMeta:               song.meta,
    SourceUri:             '#SourceUri', // Ugs.MakeUri(Actions.Source, filename)
    // EditUri: Ugs.MakeUri(Actions.Edit, filename)

    Id:                    filename,
    IsUpdateAllowed:       false, // $this.SiteUser.MayEdit && $this.SiteUser.IsAuthenticated

    EditorSettingsJson:    null, // $this.getSettings()
  });
  /* eslint-enable key-spacing */

  // Temp SuperKludge: Nunjucks is unable to use class getters, and normal serialization misses function (getters) and
  // SO solutions seem to have issue with private variables. So... Life is Short!
  const fixedViewModel = {
    ...viewModel,
    PageTitle: viewModel.PageTitle,
    PoweredBy: viewModel.PoweredBy,
    StaticsPrefix: viewModel.StaticsPrefix,
    SupportEmail: viewModel.SupportEmail,
  };

  const template = Config.UseEditableSong ? 'song-editable' : 'song';
  res.render(template, fixedViewModel);
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

  return title || filename;
}

/**
 * View Model Builder -- Creates a "Song" View Model
 */
module.exports = Build;
