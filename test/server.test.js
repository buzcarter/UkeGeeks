'use strict';
/**
 * End-to-end tests: spawns the real server on a random port against a temp song
 * directory, with login enabled. Run: npm test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { hashPassword } = require('../server/lib/auth');

const ROOT = path.resolve(__dirname, '..');
let tmp, songDir, base, child;

const SONG = '{title: The Rose}\n{artist: Bette <b>Midler</b>}\n{meta: <img src=x onerror=alert(1)>}\n[C]Some say <script>alert(1)</script> love\n';

async function req(pathname, opts = {}) {
  const res = await fetch(base + pathname, { redirect: 'manual', ...opts });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

async function login(user, pass) {
  const res = await fetch(base + '/login', {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: base },
    body: new URLSearchParams({ username: user, password: pass }),
  });
  const cookie = (res.headers.get('set-cookie') || '').split(';')[0];
  return { status: res.status, cookie };
}

const postJson = (pathname, body, headers = {}) =>
  req(pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, ...headers },
    body: JSON.stringify(body),
  });

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ugs-test-'));
  songDir = path.join(tmp, 'songs');
  fs.mkdirSync(songDir);
  fs.writeFileSync(path.join(songDir, 'the rose - Bette.cpm.txt'), SONG);
  fs.writeFileSync(path.join(songDir, '南山南 - 馬頔.cpm.txt'), '{title: 南山南}\n{artist: 馬頔}\n[Am]你在南方\n');
  fs.writeFileSync(path.join(tmp, 'secret.txt'), 'TOP SECRET');
  fs.writeFileSync(path.join(songDir, 'grass-shack.cpm.txt'), '{title: Grass &quot;Shack&quot;}\n{artist: Lyrics &amp; Music &copy; 1933}\n[C]Tom & Jerry\n');

  const cfgFile = path.join(tmp, 'config.json');
  fs.writeFileSync(
    cfgFile,
    JSON.stringify({
      songDirectory: songDir,
      editorSettingsFile: null,
      accounts: [
        { user: 'editor', passwordHash: await hashPassword('ukulele'), name: 'Ed <i>', isActive: true, mayEdit: true },
        { user: 'viewer', passwordHash: await hashPassword('ukulele'), name: 'Vi', isActive: true, mayEdit: false },
      ],
    })
  );

  child = spawn(process.execPath, [path.join(ROOT, 'server/index.js')], {
    env: { ...process.env, UGS_CONFIG: cfgFile, PORT: '0', HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  base = await new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => {
      const m = String(d).match(/http:\/\/[\d.]+:\d+/);
      if (m) resolve(m[0]);
    });
    child.on('exit', (code) => reject(new Error('server exited ' + code)));
  });
});

after(() => {
  child.kill();
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('songbook lists songs, escaped, with security headers', async () => {
  const r = await req('/');
  assert.equal(r.status, 200);
  assert.match(r.text, /3 Songs\./);
  assert.match(r.text, /Rose, The/);
  assert.match(r.text, /南山南/);
  assert.match(r.text, /href="\/songbook\/%E5%8D%97/);
  assert.ok(!r.text.includes('<b>Midler'), 'artist must be escaped');
  assert.match(r.headers.get('content-security-policy'), /script-src 'self' 'nonce-/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('song page renders and escapes the song body', async () => {
  for (const p of ['/songbook/the%20rose%20-%20Bette', '/edit/the%20rose%20-%20Bette.cpm.txt']) {
    const r = await req(p);
    assert.equal(r.status, 200, p);
    assert.match(r.text, /<h1 id="songTitle" class="ugs-songTitle">The Rose<\/h1>/);
    assert.ok(!r.text.includes('<script>alert(1)'), 'body must be escaped');
    assert.ok(r.text.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.ok(!r.text.includes('updateSong.init'), 'anonymous users cannot save');
  }
});

test('source returns raw text as text/plain', async () => {
  const r = await req('/source/the%20rose%20-%20Bette.cpm.txt');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /^text\/plain/);
  assert.equal(r.text, SONG);
});

test('path traversal is impossible', async () => {
  for (const p of [
    '/source/..%2Fsecret.txt',
    '/source/..%2F..%2Fsecret',
    '/source/%2E%2E%2Fsecret.txt',
    '/songbook/..%5Csecret.txt',
    '/source/.cpm.txt',
    '/source/%00',
    '/css/../server/config.js',
    '/css/%2e%2e/server/config.js',
    '/js/..%2f..%2fpackage.json',
    '/ugs.config.example.json',
    '/server/config.js',
    '/cpm/',
  ]) {
    const r = await req(p);
    assert.ok(r.status >= 400, `${p} -> ${r.status}`);
    assert.ok(!r.text.includes('TOP SECRET') && !r.text.includes('module.exports'), p);
  }
});

test('reflected XSS via song name is escaped', async () => {
  const r = await req('/songbook/' + encodeURIComponent('"><script>alert(1)</script>'));
  assert.equal(r.status, 404);
  assert.match(r.text, /Sorry... Song Not Found/);
  assert.ok(!r.text.includes('<script>alert(1)'));
});

test('existing HTML entities in song files are not double-escaped', async () => {
  const list = await req('/');
  assert.ok(list.text.includes('Grass &quot;Shack&quot;'), 'title entities kept');
  assert.ok(list.text.includes('Lyrics &amp; Music &copy; 1933'), 'artist entities kept');
  assert.ok(!list.text.includes('&amp;amp;') && !list.text.includes('&amp;copy;'));

  const song = await req('/songbook/grass-shack');
  assert.ok(song.text.includes('[C]Tom &amp; Jerry'), 'bare & still escaped');
  assert.ok(!song.text.includes('&amp;quot;'));
});

test('static files are served', async () => {
  const r = await req('/js/ukeGeeks.scriptasaurus.min.js');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /javascript/);
  assert.match(r.text, /alternateUke/);
});

test('legacy music.php links redirect', async () => {
  const r = await req('/music.php?action=song&song=foo');
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), '/songbook/foo');
});

test('login: bad password rejected, editor accepted, session works', async () => {
  assert.equal((await login('editor', 'nope')).status, 401);
  const ok = await login('Editor', 'ukulele');
  assert.equal(ok.status, 303);
  assert.match(ok.cookie, /^ugs_sid=/);

  const page = await req('/', { headers: { Cookie: ok.cookie } });
  assert.match(page.text, /Ed &lt;i&gt;!/);
  assert.match(page.text, /id="openNewDlgBtn"/);
});

test('login rejects cross-site form posts', async () => {
  const r = await req('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://evil.example' },
    body: 'username=editor&password=ukulele',
  });
  assert.equal(r.status, 403);
});

test('ajax endpoints require an editor, same origin, and JSON', async () => {
  const anon = await postJson('/ajaxnewsong', { songTitle: 'x' });
  assert.equal(anon.status, 403);

  const viewer = await login('viewer', 'ukulele');
  const v = await postJson('/ajaxnewsong', { songTitle: 'x' }, { Cookie: viewer.cookie });
  assert.equal(v.status, 403);

  const { cookie } = await login('editor', 'ukulele');
  const csrf = await postJson('/ajaxnewsong', { songTitle: 'x' }, { Cookie: cookie, Origin: 'https://evil.example' });
  assert.equal(csrf.status, 403);

  const form = await req('/ajaxnewsong', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', Cookie: cookie, Origin: base },
    body: JSON.stringify({ songTitle: 'x' }),
  });
  assert.equal(form.status, 415);
});

test('editor can create and update songs; update cannot escape the song dir', async () => {
  const { cookie } = await login('editor', 'ukulele');

  const created = JSON.parse((await postJson('/ajaxnewsong', { songTitle: '月亮/代表 {我}', songArtist: 'Teresa' }, { Cookie: cookie })).text);
  assert.equal(created.HasErrors, false);
  assert.equal(created.Id, '月亮 代表 我 - Teresa.cpm.txt');
  assert.equal(created.ContinueUri, '/edit/' + encodeURIComponent(created.Id));
  assert.match(fs.readFileSync(path.join(songDir, created.Id), 'utf8'), /^\{title: 月亮\/代表 我\}\n\{artist: Teresa\}/);

  const dupe = JSON.parse((await postJson('/ajaxnewsong', { songTitle: '月亮/代表 {我}', songArtist: 'Teresa' }, { Cookie: cookie })).text);
  assert.equal(dupe.Id, '月亮 代表 我 - Teresa (2).cpm.txt');

  const upd = await postJson('/ajaxupdatesong', { filename: created.Id, song: '{title: New}\n' }, { Cookie: cookie });
  assert.equal(JSON.parse(upd.text).HasErrors, false);
  assert.equal(fs.readFileSync(path.join(songDir, created.Id), 'utf8'), '{title: New}\n');

  for (const filename of ['../secret.txt', '../config.json', '/etc/hosts', 'nope.cpm.txt']) {
    const bad = await postJson('/ajaxupdatesong', { filename, song: 'pwned' }, { Cookie: cookie });
    assert.equal(bad.status, 404, filename);
  }
  assert.equal(fs.readFileSync(path.join(tmp, 'secret.txt'), 'utf8'), 'TOP SECRET');

  const edit = await req('/edit/' + encodeURIComponent(created.Id), { headers: { Cookie: cookie } });
  assert.match(edit.text, /ugsEditorPlus\.updateSong\.init\("\/ajaxupdatesong", "月亮 代表 我 - Teresa.cpm.txt"\)/);
  assert.match(edit.text, /id="saveBtn"/);

  const list = await req('/', { headers: { Cookie: cookie } });
  assert.match(list.text, /5 Songs\./);
});

test('logout ends the session', async () => {
  const { cookie } = await login('editor', 'ukulele');
  const out = await req('/logout', { headers: { Cookie: cookie } });
  assert.equal(out.status, 302);
  const after = await req('/', { headers: { Cookie: cookie } });
  assert.ok(!after.text.includes('openNewDlgBtn'));
});
