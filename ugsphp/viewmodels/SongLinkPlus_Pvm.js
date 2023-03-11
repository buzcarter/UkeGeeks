/* eslint-disable max-classes-per-file, camelcase */
class SongLinkPlus_Pvm {
  Uri = '';

  Title = '';

  Subtitle = '';

  Album = '';

  Artist = '';

  HasInfo = false;
}

/**
 *
 */
class SongListPlus_Pvm {
  SongList = [];

  /**
   * Sorts the Song List based on title
   * @method Sort
   * @return (SongLinkPlus_Pvm array)
   */
  Sort() {
    function scrub(val) {
      return val.toLowerCase().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim();
    }

    let tieBreaker = 0;
    const songsListRekeyed = [];
    const titlesList = [];
    const uniqueTitleKeys = {};

    this.SongList.forEach((song) => {
      let titleKey = scrub(song.Title);
      if (uniqueTitleKeys[titleKey]) {
        titleKey += ` _${tieBreaker}_ugs87!`;
        tieBreaker++;
      }
      titlesList.push(titleKey);
      songsListRekeyed[titleKey] = song;
    });

    titlesList.sort();

    this.SongList = [];
    titlesList.forEach((key) => {
      this.SongList.push(songsListRekeyed[key]);
    });
    return this.SongList;
  }
}

module.exports = {
  SongLinkPlus_Pvm,
  SongListPlus_Pvm,
};
