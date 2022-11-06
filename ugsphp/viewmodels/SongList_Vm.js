const BaseViewModel = require('./_base_Vm');
const SongLinkPartialViewModel = require('./SongLinkPartialViewModel');

/**
* wraps list of songs for both basic and "detailed" views
*/
class SongList_Vm extends BaseViewModel {
	SongList = array();

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

    title = defined('Config.SongbookHeadline') ? Config.SongbookHeadline : 'The BIG UKE Book';

		// this.EditAjaxUri = Ugs.MakeUri( Actions.AjaxNewSong);
		// this.LogoutUri = Ugs.MakeUri( Actions.Logout);
		this.Headline = title;
		this.SubHeadline = defined('Config.SongbookSubHeadline') ? Config.SongbookSubHeadline : 'Sample Styled Songbook &raquo;';
		this.PageTitle = title + ' ' + Config.PageTitleSuffix;
	}

	/**
	 * Sorts songs based on title
	 * @method sortSongs
	 * @return (song array)
	 */
	Sort() {
		temp = array();
		sortedTitles = array();
		foreach (this.SongList as song) {
			sortedTitles[] = song.Title;
			temp[song.Title] = song;
		}

		sort(sortedTitles);

		this.SongList = array();
		foreach (sortedTitles as title) {
			this.SongList[] = temp[title];
		}

		return this.SongList;
	}

	/**
	 * Adds a new SongLinkPartialViewModel to list
	 * @method Add
	 * @param string title
	 * @param string url
	 * @return (none)
	 */
	Add(title, url){
		this.SongList.push (new SongLinkPartialViewModel(title, url));
	}

}
