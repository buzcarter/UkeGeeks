<?php

/**
 * singleton class configuring various application options
 */
class Config {
	// --------------------------------------
	// finding & reading your ChordPro files
	// --------------------------------------
	const SongDirectory = 'cpm/';
	const FileExtension = '.cpm.txt';
	const FileNamePattern = '/(.*?)\.cpm\.txt$/';

	const MaxFileSize = 100000;
	const NotFound_404File = 'error.txt';

	// --------------------------------------
	// file paths/directories (initialize with class)
	// --------------------------------------
	public $CachePath = '';
	public $ViewsPath = '';

	// --------------------------------------
	// Attribution & Site Credits
	// --------------------------------------
	const PageTitleSuffix = ' | UkeGeek\'s Scriptasaurus';
	const PoweredBy = 'UkeGeeks-Scriptasaurus-v1.11';
	const SupportEmail = 'buz@your-domain-not-mine.com';

	// --------------------------------------
	// Boolean Options/Settings
	// --------------------------------------
	const UseModRewrite = false;
	const UseDetailedLists = false;
	const UseEditableSong = false;
	const IsLoginRequired = false;

	// --------------------------------------
	// Cache (only if "UseDetailedLists" enabled)
	// --------------------------------------
	const SongCacheKey_FileName = 'SongList';

	// --------------------------------------
	// Logins (only if "IsLoginRequired" enabled)
	// --------------------------------------
	public static $Accounts = array(
		array(
			'user' => 'guest',
			'pass' => '12345',
			'isActive' => true
		),
		array(
			'user' => 'jake',
			'pass' => 'ukulelecake',
			'isActive' => false
		)
	);

	/**
	 * any dynamic setup happens here
	 * @param string $appRoot where's the application running
	 */
	function Config($appRoot) {
		$this->CachePath = $appRoot . '/cache/';
		$this->ViewsPath = $appRoot . '/views/';
	}
}
