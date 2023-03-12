const { join } = require('path');
/**
 * configuring various application options
 */
module.exports = {
  // --------------------------------------
  // finding & reading your ChordPro files
  // --------------------------------------
  FileExtension: '.cpm.txt',
  FileNamePattern: /(.*?)\.cpm\.txt$/,

  MaxFileSize: 100000,
  NotFound_404File: 'error.txt',

  // --------------------------------------
  // file paths/directories (DO NOT DIRECTLY EDIT THESE... see Init method below)
  // --------------------------------------
  SongDirectory: '',
  AppDirectory: '',

  // --------------------------------------
  // Alternate directory or path locations
  // --------------------------------------

  /**
   * Location of UGS asset directories, i.e. JavaScript (JS), Stylesheet (CSS), and Image (leave as "/" if standard install)
   * @constant(StaticsPrefix)
   * @var String
   */
  StaticsPrefix: '/',

  /**
   * If you want your URLs to be prefixed with a subdirectory specify that here (leave as "/" if standard install)
   * @constant(Subdirectory)
   * @var String
   */
  Subdirectory: '/',

  // --------------------------------------
  // Attribution & Site Credits
  // --------------------------------------
  PageTitleSuffix: ' | UkeGeek\'s Scriptasaurus',
  PoweredBy: 'UkeGeeks-Scriptasaurus-v1.4',
  SupportEmail: 'buz@your-domain-not-mine.com',

  // --------------------------------------
  // Page Headings & Titles
  // --------------------------------------
  SongbookHeadline: 'The BIG UKE Book',
  SongbookSubHeadline: 'Sample Styled Songbook &raquo;',

  // --------------------------------------
  // Boolean Options/Settings
  // --------------------------------------

  /**
   * Apache Web Server Only: if true links are generated using ModRewrite rules syntax (no query params)
   * @constant(UseModRewrite)
   * @var Boolean
   */
  UseModRewrite: false,

  /**
   * if true the Songbook shows the dedtailed (title, artist, subtitle) song page and uses the song list cache.
   * If false the song list page uses the filenames for the link text (does minor tidy-up)
   * @constant(UseDetailedLists)
   * @var Boolean
   */
  UseDetailedLists: true,

  /**
   * If true when visitor clicks to a page the full editor toolbar is present; if false only the song is displayed (no formatting or other features)
   * @constant(UseEditableSong)
   * @var Boolean
   */
  UseEditableSong: true,

  /**
   * If true visitors must login to view or edit any page. Login must be enabled to Add or Update songs
   * @constant(IsLoginRequired)
   * @var Boolean
   */
  IsLoginRequired: false,

  /**
   * File names used for song list cache files (only if "UseDetailedLists" enabled).
   * @constant(SongCacheKey_FileName)
   * @var string
   */
  SongCacheKey_FileName: 'SongList',

  // --------------------------------------
  // Logins (only if "IsLoginRequired" enabled)
  // --------------------------------------
  Accounts: [{
    user: 'admin',
    pass: '12345',
    name: 'Almighty Admin',
    isActive: true,
    mayEdit: true,
  }, {
    user: 'guest',
    pass: '12345',
    name: 'Honored Guest',
    isActive: true,
    mayEdit: false,
  }, {
    user: 'jake',
    pass: 'ukulelecake',
    name: 'Jake S.',
    isActive: false,
    mayEdit: true,
  }],

  /**
   * any dynamic setup happens here
   */
  Init() {
    this.SongDirectory = `${join(__dirname, '../cpm/')}`;
    console.log(`Config.init: SongDirectory "${this.SongDirectory}"`);
    // this.AppDirectory = `${dirname(__FILE__)}/`;
  },
};
