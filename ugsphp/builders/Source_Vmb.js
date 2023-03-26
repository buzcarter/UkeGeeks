const FileHelper = require('../classes/FileHelper');

function Build(req, res) {
  const { cpm: cpmName } = req.params;
  const filename = FileHelper.getSongFilename(cpmName);
  const content = FileHelper.readFile(filename);
  res.set({ 'Content-Type': 'text/plain' });
  if (content === null) {
    res.status(404)
      .send(`Unable to find CPM "${cpmName}" source`);
    return;
  }

  res.status(200)
    .send(content);
}

module.exports = Build;
