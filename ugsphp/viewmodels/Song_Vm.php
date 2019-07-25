<?php

class Song_Vm extends _base_Vm {
	public $SongTitle = '';
	public $Subtitle = '';
	public $Album = '';
	public $Artist = '';
	public $Body = '';
	public $UgsMeta = null;
	public $SourceUri = '';
	public $EditUri = '';
	public $EditorSettingsJson = '';

	public $Id = '';

	/**
	 * URL where "New Song" AJAX is sent.
	 * -- Only used if Editing is enabled and user has permission.
	 * @var string
	 */
	public $UpdateAjaxUri = '';

	/**
	 * URL where "Delete Song" AJAX is sent.
	 * -- Only used if Editing is enabled and user has permission.
	 * @var string
	 */
	public $DeleteAjaxUri = '';

	/**
	 * If TRUE View may show edit form
	 * -- Only used if Editing is enabled and user has permission.
	 * @var boolean
	 */
	public $IsUpdateAllowed = false;

	function __construct()
	{
		parent::__construct();
		$this->UpdateAjaxUri = Ugs::MakeUri( Actions::AjaxUpdateSong);
		$this->DeleteAjaxUri = Ugs::MakeUri( Actions::AjaxDeleteSong);
	}

}
