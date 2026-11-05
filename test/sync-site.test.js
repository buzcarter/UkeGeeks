'use strict';
/**
 * scripts/sync-site.js: replaces built songbook entries, overlays js/css/img,
 * never deletes site-only files. Run: npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('sync-site replaces songbook entries and keeps site-only files', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ugs-sync-test-'));
  const songs = path.join(tmp, 'songs');
  const site = path.join(tmp, 'site');
  fs.mkdirSync(songs);
  fs.writeFileSync(path.join(songs, 'snow.cpm.txt'), '{title: Snow}\n[C]Snow\n');

  // an existing site: an old extensionless song page with the same name,
  // a page only the site has, an outdated library file, a site-only asset
  fs.mkdirSync(path.join(site, 'songbook/keep-me'), { recursive: true });
  fs.mkdirSync(path.join(site, 'js'), { recursive: true });
  fs.writeFileSync(path.join(site, 'songbook/snow'), '<html>old archived page</html>');
  fs.writeFileSync(path.join(site, 'songbook/keep-me/index.html'), 'site-only page');
  fs.writeFileSync(path.join(site, 'js/ukeGeeks.scriptasaurus.min.js'), '/* old */');
  fs.writeFileSync(path.join(site, 'js/site-only.js'), '/* mine */');

  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/sync-site.js'), site, '--songs', songs], {
      env: { ...process.env, UGS_CONFIG: path.join(tmp, 'none.json') },
      stdio: 'pipe',
    });

    assert.ok(fs.statSync(path.join(site, 'songbook/snow')).isDirectory(), 'old file replaced by a folder');
    assert.match(fs.readFileSync(path.join(site, 'songbook/snow/index.html'), 'utf8'), /ugs-songTitle">Snow</);
    assert.match(fs.readFileSync(path.join(site, 'songbook/index.html'), 'utf8'), /1 Songs\./);
    assert.equal(fs.readFileSync(path.join(site, 'songbook/keep-me/index.html'), 'utf8'), 'site-only page');
    assert.equal(fs.readFileSync(path.join(site, 'js/site-only.js'), 'utf8'), '/* mine */');
    assert.equal(
      fs.readFileSync(path.join(site, 'js/ukeGeeks.scriptasaurus.min.js'), 'utf8'),
      fs.readFileSync(path.join(ROOT, 'js/ukeGeeks.scriptasaurus.min.js'), 'utf8'),
      'library file updated'
    );
    assert.ok(fs.existsSync(path.join(site, 'favicon.ico')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
