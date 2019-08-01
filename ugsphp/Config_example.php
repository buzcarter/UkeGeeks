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
	static public $AppDirectory = '';

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
	const PoweredBy = 'UkeGeeks-Scriptasaurus-v1.4';
	const SupportEmail = 'buz@your-domain-not-mine.com';

	// --------------------------------------
	// Page Headings & Titles
	// --------------------------------------
	const SongbookHeadline  = 'The BIG UKE Book';
	const SongbookSubHeadline = 'Sample Styled Songbook &raquo;';

	// --------------------------------------
	// Boolean Options/Settings
	// --------------------------------------

	/**
	 * Apache Web Server Only: if true links are generated using ModRewrite rules syntax (no query params)
	 * @constant(UseModRewrite)
	 * @var Boolean
	 */
	const UseModRewrite = false;

	/**
	 * If true visitors must login to view or edit any page. Login must be enabled to Add or Update songs
	 * @constant(IsLoginRequired)
	 * @var Boolean
	 */
	const IsLoginRequired = false;

	/**
	 * File names used for song list cache files
	 * @constant(SongCacheKey_FileName)
	 * @var string
	 */
	const SongCacheKey_FileName = 'SongList';

	/**
	 * If true, show support email on the login page (to request access, ...)
	 * @constant(ShowSupportEmail)
	 * @var Boolean
	 */
	const ShowSupportEmail = false;

	/**
	 * Language to use
	 * @constant(Lang)
	 * @var string
	 */
	const Lang = 'EN';

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
		self::$SongDirectory = getcwd() . '/cpm/';
		self::$AppDirectory = dirname(__FILE__) . '/';
	}
}
