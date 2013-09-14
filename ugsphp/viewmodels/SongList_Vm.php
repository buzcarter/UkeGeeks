<?php

/**
* wraps list of songs for both basic and "detailed" views
*/
class SongList_Vm extends _base_Vm {
	public $SongList = array();

	/**
	 * URL where "New Song" AJAX is sent.
	 * -- Only used if Editing is enabled and user has permission.
	 * @var string
	 */
	public $EditAjaxUri = '';

	/**
	 * If TRUE View may show edit form
	 * -- Only used if Editing is enabled and user has permission.
	 * @var boolean
	 */
	public $IsNewAllowed = false;

	public $LogoutUri = '';

	public $Headline = '';
	public $SubHeadline = '';

	function __construct()
	{
		parent::__construct();
		$title = defined('Config::SongbookHeadline') ? Config::SongbookHeadline : 'The BIG UKE Book';

		$this->EditAjaxUri = Ugs::MakeUri( Actions::AjaxNewSong);
		$this->LogoutUri = Ugs::MakeUri( Actions::Logout);
		$this->Headline = $title;
		$this->SubHeadline = defined('Config::SongbookSubHeadline') ? Config::SongbookSubHeadline : 'Sample Styled Songbook &raquo;';
		$this->PageTitle = $title . ' ' . Config::PageTitleSuffix;
	}

	/**
	 * Sorts songs based on title
	 * @method sortSongs
	 * @return (song array)
	 */
	public function Sort() {
		$temp = array();
		$sortedTitles = array();
		foreach ($this->SongList as $song) {
			$sortedTitles[] = $song->Title;
			$temp[$song->Title] = $song;
		}

		sort($sortedTitles);

		$this->SongList = array();
		foreach ($sortedTitles as $title) {
			$this->SongList[] = $temp[$title];
		}

		return $this->SongList;
	}

	/**
	 * Adds a new SongLink_Pvm to list
	 * @method Add
	 * @param string $title
	 * @param string $url
	 * @return (none)
	 */
	public function Add($title, $url){
		$this->SongList[] = new SongLink_Pvm($title, $url);
	}

}
