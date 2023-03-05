const BaseViewModel = require('./_base_Vm');
const SongLinkPartialViewModel = require('./SongLink_Pvm');
const Config = require('../Config');

/**
* wraps list of songs for both basic and "detailed" views
*/
class SongListModel extends BaseViewModel {
  SongList = [];

  /**
   * URL where "New Song" AJAX is sent.
   * -- Only used if Editing is enabled and user has permission.
   * @var string
   */
  EditAjaxUri = '';

  /**
   * If TRUE View may show edit form
   * -- Only used if Editing is enabled and user has permission.
   * @var boolean
   */
  IsNewAllowed = false;

  LogoutUri = '';

  Headline = '';

  SubHeadline = '';

  constructor() {
    super();

    const title = Config.SongbookHeadline ? Config.SongbookHeadline : 'The BIG UKE Book';

    // this.EditAjaxUri = Ugs.MakeUri( Actions.AjaxNewSong);
    // this.LogoutUri = Ugs.MakeUri( Actions.Logout);
    this.Headline = title;
    this.SubHeadline = Config.SongbookSubHeadline ? Config.SongbookSubHeadline : 'Sample Styled Songbook &raquo;';
    this.PageTitle = title;
  }

  /**
   * Sorts songs based on title
   * @method sortSongs
   * @return (song array)
   */
  Sort() {
    const temp = [];
    const sortedTitles = [];
    this.SongList.forEach((song) => {
      sortedTitles.push(song.Title);
      temp[song.Title] = song;
    });

    sortedTitles.sort();

    this.SongList = [];
    sortedTitles.forEach((title) => {
      this.SongList.push(temp[title]);
    });

    return this.SongList;
  }

  /**
   * Adds a new SongLinkPartialViewModel to list
   * @method Add
   * @param string title
   * @param string url
   * @return (none)
   */
  Add(title, url) {
    this.SongList.push(new SongLinkPartialViewModel(title, url));
  }
}

module.exports = SongListModel;
