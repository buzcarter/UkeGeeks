const { properCase } = require('../lib/strUtils');
const Actions = require('../classes/Actions');
const Config = require('../Config');
const FileHelper = require('../classes/FileHelper');
const fs = require('fs');
const SongHelper = require('../classes/SongHelper');
const SongListPlusViewModel = require('../viewmodels/SongLinkPlus_Pvm');
const uriUtils = require('../lib/uriUtils');

/* eslint-disable class-methods-use-this, no-useless-constructor */
/**
 * Builds the SongList array, either reading from or writint to the SimpleCache.
 * @class SongListCacheManager
 */
class SongListCacheManager {
  cache = null;

  constructor() {
    // this.cache = new SimpleCache();
    // this.cache.setCacheDir(`${Config.AppDirectory}cache/`);
  }

  /**
   * Rebuilds the cache file by reading & parsing all ChordPro song files.
   * @return array song list
   */
  Rebuild() {
    // large song collections (1,000's of songs) might timeout, set max number of seconds for this task
    // set_time_limit(45);
    // files = FileHelper.getFilenames(Config.SongDirectory);
    const files = fs.readdirSync('cpm');
    const songList = this.buildFileList(files);

    // this.cache.put(Config.SongCacheKey_FileName, serialize(songList));

    return songList;
  }

  /**
   * returns the song list -- tries to fetch from cache, if that fails, rebuilds
   */
  Get() {
    return this.Rebuild();

    // if (!this.cache.exists(Config.SongCacheKey_FileName)) {
    //   return this.Rebuild();
    // }

    // cachedSongList = this.cache.get(Config.SongCacheKey_FileName);
    // return unserialize(cachedSongList);
  }

  // -----------------------------------------
  // PRIVATE METHODS
  // -----------------------------------------

  /**
   * Emits list of links to all songs in the directory.
   * @method buildFileList
   * @return (song array)
   */
  buildFileList(files) {
    const list = new SongListPlusViewModel.SongListPlus_Pvm();

    files.forEach((fname) => {
      const s = fname.replace(Config.FileNamePattern, '$1');
      const content = FileHelper.readFile(`${Config.SongDirectory}/${fname}`);
      const parsed = SongHelper.parseSong(content);

      const song = Object.assign(new SongListPlusViewModel.SongLinkPlus_Pvm(), {
        Uri: uriUtils.MakeUri(Actions.Song, s),
        HasInfo: (parsed.title.length + parsed.artist.length) > 0,
        Title: this.fixLeadingArticle((parsed.title.length > 0) ? parsed.title : this.filenameToTitle(s)),
        Subtitle: parsed.subtitle,
        Album: parsed.album,
        Artist: parsed.artist,
      });

      list.SongList.push(song);
    });

    return list.Sort();
  }

  /**
   * convert a filename to a pseudo-title
   * @param {string} filename
   * @return {string}
   */
  filenameToTitle(filename) {
    return properCase(filename.replaceAll('_', ' ').replaceAll('-', ' ')).trim();
  }

  /**
   * Handles titles beginning with "The", "A", "An"
   * @method fixLeadingArticle
   * @param string title
   * @return string
   */
  fixLeadingArticle(title) {
    const r = /^(the|a|an) (.*)/i;
    if (r.test(title)) {
      title = title.replace(r, '$2, $1');
    }
    return title;
  }
}

module.exports = SongListCacheManager;
