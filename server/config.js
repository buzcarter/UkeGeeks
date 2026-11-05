'use strict';
/**
 * Application configuration: defaults below, overridden by ugs.config.json in the
 * project root (copy ugs.config.example.json), then by a few environment variables.
 * Mirrors ugsphp/Config.php.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_FILE = process.env.UGS_CONFIG || path.join(ROOT, 'ugs.config.json');

const defaults = {
  // network: localhost-only by default; use "0.0.0.0" to share on your LAN
  host: '127.0.0.1',
  port: 8080,

  // finding & reading ChordPro files
  songDirectory: 'cpm',
  fileExtension: '.cpm.txt',
  maxFileSize: 100000,

  // optional Song-a-matic editor settings (JSON with comments), see ugsphp/settings.json_example
  editorSettingsFile: 'ugsphp/settings.json',

  // attribution & titles
  pageTitleSuffix: " | UkeGeek's Scriptasaurus",
  poweredBy: 'UkeGeeks-Scriptasaurus-v1.5',
  supportEmail: 'buz@your-domain-not-mine.com',
  songbookHeadline: 'The BIG UKE Book',
  songbookSubHeadline: 'Sample Styled Songbook »',

  // optional Intl locale for sorting the song list, e.g. "zh-Hant-u-co-stroke" or "zh-u-co-pinyin"
  sortLocale: undefined,

  // features
  useDetailedLists: true,
  useEditableSong: true,
  isLoginRequired: false,

  // sessions
  sessionTtlHours: 12,
  // set true when served over HTTPS (e.g. behind a TLS-terminating proxy)
  secureCookies: false,

  // accounts (only used when isLoginRequired). Generate hashes with: npm run hash-password
  accounts: [],
};

function loadFileConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid JSON in ${CONFIG_FILE}: ${err.message}`);
  }
}

function build() {
  const cfg = { ...defaults, ...loadFileConfig() };

  if (process.env.PORT) cfg.port = Number(process.env.PORT);
  if (process.env.HOST) cfg.host = process.env.HOST;

  cfg.root = ROOT;
  cfg.songDirectory = path.resolve(ROOT, cfg.songDirectory);
  cfg.editorSettingsFile = cfg.editorSettingsFile ? path.resolve(ROOT, cfg.editorSettingsFile) : null;

  cfg.accounts = (cfg.accounts || []).filter((acct) => {
    if (!acct || typeof acct.user !== 'string' || typeof acct.passwordHash !== 'string') {
      console.warn(`[config] ignoring account "${acct && acct.user}": needs "user" and "passwordHash" (run: npm run hash-password)`);
      return false;
    }
    return true;
  });

  if (cfg.isLoginRequired && cfg.accounts.length === 0) {
    console.warn('[config] isLoginRequired is true but no valid accounts are configured: nobody can sign in.');
  }

  return Object.freeze(cfg);
}

module.exports = build();
