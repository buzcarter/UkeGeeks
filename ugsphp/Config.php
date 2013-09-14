<?php

/**
 * singleton class configuring various application options
 */
class Config {
	// --------------------------------------
	// finding & reading your ChordPro files
	// --------------------------------------
	const FileExtension = '.cpm.txt';
	const FileNamePattern = '/(.*?)\.cpm\.txt$/';

	const MaxFileSize = 100000;
	const NotFound_404File = 'error.txt';

	// --------------------------------------
	// file paths/directories (DO NOT DIRECTLY EDIT THESE... see Init method below)
	// --------------------------------------
	static public $SongDirectory = '';
	static public $CachePath = '';
	static public $ViewsPath = '';

	// --------------------------------------
	// Alternate directory or path locations
	// --------------------------------------
	
	/**
	 * Location of UGS asset directories, i.e. JavaScript (JS), Stylesheet (CSS), and Image (leave as "/" if standard install)
	 * @constant(StaticsPrefix)
	 * @var String
	 */
	const StaticsPrefix = '/';

	/**
	 * If you want your URLs to be prefixed with a subdirectory specify that here (leave as "/" if standard install)
	 * @constant(Subdirectory)
	 * @var String
	 */
	const Subdirectory = '/';

	// --------------------------------------
	// Attribution & Site Credits
	// --------------------------------------
	const PageTitleSuffix = ' | UkeGeek\'s Scriptasaurus';
	const PoweredBy = 'UkeGeeks-Scriptasaurus-v1.11';
	const SupportEmail = 'buz@your-domain-not-mine.com';

	// --------------------------------------
	// Page Headings & Titles
	// --------------------------------------
	const SongbookHeadline  = 'The BIG UKE Book';
	const SongbookSubHeadline = 'Sample Styled Songbook &raquo;';

	// --------------------------------------
	// Boolean Options/Settings
	// --------------------------------------
	const UseModRewrite = false;
	const UseDetailedLists = true;
	const UseEditableSong = true;
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
			'user' => 'admin',
			'pass' => '12345',
			'name' => 'Almighty Admin',
			'isActive' => true,
			'mayEdit' => true
		),
		array(
			'user' => 'guest',
			'pass' => '12345',
			'name' => 'Honored Guest',
			'isActive' => true,
			'mayEdit' => false
		),
		array(
			'user' => 'jake',
			'pass' => 'ukulelecake',
			'name' => 'Jake S.',
			'isActive' => false,
			'mayEdit' => true
		)
	);

	/**
	 * any dynamic setup happens here
	 */
	public static function Init() {
		$appRoot = dirname(__FILE__);

		self::$SongDirectory = getcwd() . '/cpm/';
		self::$CachePath = $appRoot . '/cache/';
		self::$ViewsPath = $appRoot . '/views/';
	}
}
