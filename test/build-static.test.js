'use strict';
/**
 * The static Songbook build: one page per song, relative links/assets only,
 * no server-only features (save, new song, login). Run: npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('build-static writes a self-contained, relative-linked songbook', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ugs-static-'));
  const songs = path.join(tmp, 'songs');
  const out = path.join(tmp, 'out');
  fs.mkdirSync(songs);
  fs.writeFileSync(path.join(songs, 'the rose - Bette.cpm.txt'), '{title: The Rose}\n{artist: Bette <b>M</b>}\n[C]Some <script>x</script> say\n');
  fs.writeFileSync(path.join(songs, '南山南 - 馬頔.cpm.txt'), '{title: 南山南}\n[Am]你在南方\n');

  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-static.js'), '--out', out, '--songs', songs], {
      env: { ...process.env, UGS_CONFIG: path.join(tmp, 'none.json') },
      stdio: 'pipe',
    });

    const list = fs.readFileSync(path.join(out, 'songbook/index.html'), 'utf8');
    assert.match(list, /2 Songs\./);
    assert.match(list, /href="the-rose-Bette\/"/);
    assert.match(list, /href="%E5%8D%97%E5%B1%B1%E5%8D%97-%E9%A6%AC%E9%A0%94\/"/);

    const page = fs.readFileSync(path.join(out, 'songbook/the-rose-Bette/index.html'), 'utf8');
    assert.match(page, /<h1 id="songTitle" class="ugs-songTitle">The Rose<\/h1>/);
    assert.ok(page.includes('&lt;script&gt;x&lt;/script&gt;'), 'song text escaped');
    assert.ok(!page.includes('<b>M</b>'), 'metadata escaped');
    assert.ok(!/id="saveBtn"|updateSong\.init|ajax/.test(page), 'no server-only features');

    for (const html of [list, page]) {
      const absolute = html.match(/(?:src|href)="\/(?!\/)[^"]*"/g);
      assert.equal(absolute, null, `no root-absolute links: ${absolute}`);
    }
    assert.ok(page.includes('href="../../css/ukeGeeks.music.css"'));

    for (const asset of ['js/song-formatter.bundle.js', 'js/ugsEditorPlus.min.js', 'js/ugsSongList.min.js', 'css/ugsEditorPlus.min.css', 'favicon.ico']) {
      assert.ok(fs.existsSync(path.join(out, asset)), `${asset} copied`);
    }
    assert.ok(fs.existsSync(path.join(out, 'songbook/南山南-馬頔/index.html')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
