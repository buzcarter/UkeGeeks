const FileHelper = require('../classes/FileHelper');
const SongHelper = require('../classes/SongHelper');
const SongViewModel = require('../viewmodels/Song_Vm');
const strUtils = require('../lib/strUtils');

/**
 * Parses file (using URL query param) and attempts to load View Model
 * @return {Song_Vm}
 */
function Build(req, res) {
  const { cpm: cpmName } = req.params;
  const filename = FileHelper.getSongFilename(cpmName);
  const content = FileHelper.readFile(filename);
  if (content === null) {
    res.send({ error: `Unable to find CPM "${cpmName}" source`, filename });
    return;
  }

  const song = SongHelper.parseSong(content);

  /* eslint-disable key-spacing */
  const viewModel = Object.assign(new SongViewModel(), {
    Album:                 strUtils.htmlSpecialChars(song.album),
    Artist:                song.artist,
    Body:                  song.body,
    EditorSettingsJson:    null, // $this.getSettings()
    // EditUri: Ugs.MakeUri(Actions.Edit, filename)
    Id:                    filename,
    IsUpdateAllowed:       false, // $this.SiteUser.MayEdit && $this.SiteUser.IsAuthenticated
    PageTitle:             MakePageTitle(song, filename),
    SongTitle:             strUtils.htmlSpecialChars(song.title),
    SourceUri:             '#SourceUri', // Ugs.MakeUri(Actions.Source, filename)
    Subtitle:              strUtils.htmlSpecialChars(song.subtitle),
    UgsMeta:               song.meta,
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

  // const template = Config.UseEditableSong ? 'song-editable' : 'song';
  const template = req.ukeGeeks.routeName !== 'song' ? 'song-editable' : 'song';

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
  }

  return strUtils.htmlSpecialChars(title || filename || '');
}

/**
 * View Model Builder -- Creates a "Song" View Model
 */
module.exports = Build;
