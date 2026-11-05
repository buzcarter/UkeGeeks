#!/usr/bin/env node
/**
 * Builds a static, serverless copy of the Songbook: the song list (with quick
 * search) and every song in the Song-a-matic editor. Everything that runs in the
 * browser works (appearance, transpose, tunings, Chord Builder, Fullscreen,
 * Update); saving, new songs and login need the server, so they're left out.
 *
 *   node scripts/build-static.js [--out dir] [--songs dir]
 *
 * Output (default dist/static/):
 *   songbook/index.html            song list
 *   songbook/<song>/index.html     one page per song (clean URLs, any static host)
 *   css/ js/ img/ favicon.ico apple-touch-icon.png
 *
 * All links and assets are relative, so the output works at a domain root, under
 * a sub-path (GitHub Pages' /UkeGeeks/), or opened from disk via a local server.
 * Reuses the server's templates (server/views.js) and song parsing (server/lib/songs.js).
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const cfg = require('../server/config');
const views = require('../server/views');
const { SongRepository, readEditorSettings } = require('../server/lib/songs');

const ROOT = path.resolve(__dirname, '..');
const ASSET_DIRS = ['css', 'js', 'img'];
const ROOT_FILES = ['favicon.ico', 'apple-touch-icon.png'];

function parseArgs(argv) {
  const args = { out: path.join(ROOT, 'dist', 'static'), songs: cfg.songDirectory };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = path.resolve(argv[++i]);
    else if (argv[i] === '--songs') args.songs = path.resolve(argv[++i]);
    else {
      console.error('usage: node scripts/build-static.js [--out dir] [--songs dir]');
      process.exit(2);
    }
  }
  return args;
}

/**
 * Folder name for a song: its file name minus ".cpm.txt", with characters that
 * are awkward in URLs or file systems replaced. Unicode letters (e.g. Chinese) stay.
 */
function slugFor(baseName, used) {
  let slug = baseName
    .normalize('NFC')
    .replace(/[\s/\\?%*:|"<>#&+]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '') || 'song';
  let unique = slug;
  for (let n = 2; used.has(unique.toLowerCase()); n++) unique = `${slug}-${n}`;
  used.add(unique.toLowerCase());
  return unique;
}

function makePageTitle(song, fallback) {
  let title = '';
  if (song.isOK) {
    title = song.title;
    if (song.artist) title += ' - ' + song.artist;
    else if (song.subtitle) title += ' - ' + song.subtitle;
  }
  return (title || fallback) + ' ' + cfg.pageTitleSuffix;
}

async function writeFile(file, contents) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, String(contents));
}

async function main() {
  const { out, songs: songDir } = parseArgs(process.argv.slice(2));
  const repo = new SongRepository({ ...cfg, songDirectory: songDir });
  const editorSettings = await readEditorSettings(cfg.editorSettingsFile);

  await fs.rm(path.join(out, 'songbook'), { recursive: true, force: true });

  const siteUser = { isAuthenticated: false };
  const common = { nonce: '', siteUser, poweredBy: cfg.poweredBy, supportEmail: cfg.supportEmail };

  const list = await repo.getSongList();
  const used = new Set();
  const entries = list.map((song) => ({ ...song, slug: slugFor(repo.baseName(song.filename), used) }));

  // one page per song, in the editable Song-a-matic view
  for (const entry of entries) {
    const { song } = await repo.load(entry.filename);
    const page = views.songEditable({
      ...common,
      base: '../../',
      pageTitle: makePageTitle(song, entry.filename),
      songTitle: song.title,
      subtitle: song.subtitle,
      artist: song.artist,
      album: song.album,
      body: song.body,
      meta: song.meta,
      id: entry.filename,
      isUpdateAllowed: false,
      editorSettings,
    });
    await writeFile(path.join(out, 'songbook', entry.slug, 'index.html'), page);
  }

  // the song list
  const listPage = views.songListDetailed({
    ...common,
    base: '../',
    pageTitle: cfg.songbookHeadline + ' ' + cfg.pageTitleSuffix,
    headline: cfg.songbookHeadline,
    subHeadline: cfg.songbookSubHeadline,
    songList: entries.map((e) => ({ ...e, uri: encodeURIComponent(e.slug) + '/' })),
    isNewAllowed: false,
    showLoginLink: false,
  });
  await writeFile(path.join(out, 'songbook', 'index.html'), listPage);

  // assets the pages load
  for (const dir of ASSET_DIRS) {
    await fs.rm(path.join(out, dir), { recursive: true, force: true });
    await fs.cp(path.join(ROOT, dir), path.join(out, dir), { recursive: true });
  }
  for (const file of ROOT_FILES) {
    await fs.copyFile(path.join(ROOT, file), path.join(out, file));
  }

  console.log(`Static songbook: ${entries.length} songs -> ${path.relative(process.cwd(), out) || '.'}/songbook/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
