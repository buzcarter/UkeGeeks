const Actions = require('../classes/Actions');
const Config = require('../Config');

/**
 * builds (relative) URL
 *
 * @param Actions(enum) $action [description]
 * @param string  $param  (optional) extra query param value (right now only "song")
 * @return  string
 */
function MakeUri(action, param = '') {
  const directory = Config.Subdirectory || '/';
  let actionName = Actions.ToName(action);
  param = param.trim();

  // if (!Config.UseModRewrite) {
  //   const actionParams = param.length ? `&song=${param}` : '';
  //   return `${directory}}'music.php?action='}${actionName}${actionParams}`;
  // }

  if (action === Actions.Song) {
    actionName = 'songbook';
  }
  return `${directory}${actionName.toLowerCase()}/${param}`;
}

module.exports = {
  MakeUri,
};
