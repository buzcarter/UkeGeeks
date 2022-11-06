const RegExes = {
  TITLE: /{(:?t|title)\s*:\s*(.+?)}/i,
  SUBTITLE: /{(:?st|subtitle)\s*:\s*(.+?)}/i,
  ARTIST: /{artist\s*:\s*(.+?)}/i,
  ALBUM: /{album\s*:\s*(.+?)}/i,
  META: /{(:?ukegeeks-meta|meta)\s*:\s*(.+?)}/i,
};

/**
 *
 * @param {string} text input text file block
 * @return Song(object)
 */
function parseSong(text) {
  const song = {
    isOK: false,
    title: 'Sorry... Song Not Found',
    subtitle: 'Check your link, please',
    artist: '',
    album: '',
    body: '[D]Where, oh, where has this [A7]stupid file gone?'
      + '\n'
      + 'Oh, [G]where or where can it [D]be?',
    meta: [],
  };

  if (!text) {
    return song;
  }

  song.isOK = true;
  song.title = getTitle(text);
  song.subtitle = getSubtitle(text);
  song.artist = getArtist(text);
  song.album = getAlbum(text);
  song.meta = getMeta(text);
  song.body = text;

  return song;
}

/**
 * parses Title tag: {Title: Blah Blah}
 * @param string text input string to be parses
 * @return string
 */
const getTitle = (text) => _matchRegEx(text, RegExes.TITLE);

/**
 * parses Subtitle tag: {Subtitle: Blah Blah}
 * @param string text input string to be parses
 * @return string
 */
const getSubtitle = (text) => _matchRegEx(text, RegExes.SUBTITLE);

/**
 * parses Artist tag: {Artist: Blah Blah}
 * @param string text input string to be parses
 * @return string
 */
const getArtist = (text) => _matchRegEx(text, RegExes.ARTIST);

/**
 * parses Album tag: {Album: Blah Blah}
 * @param string text input string to be parses
 * @return string
 */
const getAlbum = (text) => _matchRegEx(text, RegExes.ALBUM);

/**
 * parses Uke Geeks Meta tag: {ukegeeks-meta: Blah Blah}
 * @param string text input string to be parses
 * @return string
 */
function getMeta(text) {
  return '';
  // const rtn = [];
  // const regEx = RegExes.META;
  // preg_match_all(regEx, text, matches);
  // if (count(matches[2]) > 0) {
  //   // foreach(matches[2] as m) {
  //   //   rtn[] = m;
  //   // }
  // }
  // return rtn;
}

/**
 *
 * @param string text input string to be parses
 * @param int patternIndex
 * @param string regEx regular expression string
 * @return string
 */
function _matchRegEx(text, regEx) {
  const matches = text.match(regEx);
  if (!matches) {
    return '';
  }
  const [, result] = matches;
  return result.trim();
}

module.exports = {
  parseSong,
};
