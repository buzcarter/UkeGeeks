const Config = require('../Config');
const FileHelper = require('../classes/FileHelper');
const SourceViewModel = require('../viewmodels/Source_Vm');

/**
 * View Model Builder -- Creates a "Source" View Model
 * @class Source_Vmb
 */

/**
 * Populates Source View Model
 * @return Source_Vm
 */
function Build() {
  const fname = FileHelper.getFilename();
  const data = FileHelper.getFile(Config.SongDirectory + fname);
  const viewModel = Object.assign(new SourceViewModel(), {
    PageTitle: `Song Source for &quot;${fname}&quot; ChordPro (CPM)/UkeGeeks File Format`,
    Body: data, // htmlspecialchars(data),
  });

  return viewModel;
}

module.exports = Build;
