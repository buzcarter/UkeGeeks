#!/usr/bin/env node
/**
 * Builds the UkeGeeks client libraries:
 *
 *   src/js/songList/*.js -> js/ugsSongList.merged.js + .min.js (song list page: quick search, New Song)
 *
 * and copies in three packages (devDependencies), so the Songbook needs nothing
 * installed to run:
 *
 *   @ukegeeks/song-editor, the Song-a-Matic editor:
 *     dist/ugsEditorPlus.merged.js, .min.js                  -> js/
 *     dist/css/ugsEditorPlus.merged.css, .min.css, .print.css -> css/
 *     dist/img/editor/*                                      -> img/editor/
 *   @ukegeeks/song-formatter, the song renderer:
 *     dist/song-formatter.bundle.js (+ .map, .LICENSE.txt) -> js/
 *     dist/css/ukeGeeks.music.css, ukeGeeks.musicPrint.css  -> css/
 *   @ukegeeks/ace-chordpro-extension, the fullscreen editor (Ace + ChordPro mode):
 *     dist/ace-chordpro.min.js                              -> js/ace/
 *
 *     dist/markup.js                                         -> server/vendor/song-editor/
 *       (the editor's page markup, used by server/views.js)
 *
 * Usage: node scripts/build.js [js|css]   (no argument builds both)
 *
 * File ORDER matters: each module assumes the ones before it already exist.
 * ugsSongList needs ugsEditorPlus (for ugsEditorPlus.dom) loaded first.
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const BUNDLES = [
  {
    name: 'ugsSongList',
    dir: 'src/js/songList',
    files: [
      'ugsEditorPlus.typeahead.js',
      'ugsEditorPlus.newSong.js',
    ],
  },
];

// Files copied from node_modules (see the header), by build target
const VENDORED = {
  js: [
    {
      pkg: '@ukegeeks/song-editor',
      to: 'js',
      files: ['dist/ugsEditorPlus.merged.js', 'dist/ugsEditorPlus.min.js'],
    },
    {
      pkg: '@ukegeeks/song-editor',
      to: 'server/vendor/song-editor',
      files: ['dist/markup.js'],
    },
    {
      pkg: '@ukegeeks/song-formatter',
      to: 'js',
      files: ['dist/song-formatter.bundle.js', 'dist/song-formatter.bundle.js.map', 'dist/song-formatter.bundle.js.LICENSE.txt'],
    },
    {
      pkg: '@ukegeeks/ace-chordpro-extension',
      to: 'js/ace',
      files: ['dist/ace-chordpro.min.js'],
    },
  ],
  css: [
    {
      pkg: '@ukegeeks/song-editor',
      to: 'css',
      files: ['dist/css/ugsEditorPlus.merged.css', 'dist/css/ugsEditorPlus.min.css', 'dist/css/ugsEditorPlus.print.css'],
    },
    {
      pkg: '@ukegeeks/song-editor',
      to: 'img/editor',
      dir: 'dist/img/editor',
    },
    {
      pkg: '@ukegeeks/song-formatter',
      to: 'css',
      files: ['dist/css/ukeGeeks.music.css', 'dist/css/ukeGeeks.musicPrint.css'],
    },
  ],
};

const rel = (p) => path.relative(ROOT, p);

async function buildJsBundle({ name, dir, files }) {
  const { minify } = require('terser');

  const sources = await Promise.all(
    files.map((f) => fs.readFile(path.join(ROOT, dir, f), 'utf8'))
  );

  // Normalize line endings; a leading ";" guards against a file missing its trailing semicolon.
  const merged = sources.map((s) => s.replace(/\r\n?/g, '\n').trimEnd()).join('\n;') + '\n';

  // Keep the project's license/header block (first doc comment of the namespace file).
  const banner = (sources[0].match(/^\s*(\/\*\*[\s\S]*?\*\/)/) || [])[1] || '';

  const result = await minify(merged, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false, preamble: banner },
  });

  const mergedPath = path.join(ROOT, 'js', `${name}.merged.js`);
  const minPath = path.join(ROOT, 'js', `${name}.min.js`);
  await fs.writeFile(mergedPath, merged);
  await fs.writeFile(minPath, result.code + '\n');
  console.log(`  ${rel(mergedPath)} (${merged.length} bytes)`);
  console.log(`  ${rel(minPath)} (${result.code.length} bytes)`);
}

async function copyVendored(target) {
  for (const { pkg, to, files, dir } of VENDORED[target]) {
    const pkgDir = path.dirname(require.resolve(`${pkg}/package.json`));
    await fs.mkdir(path.join(ROOT, to), { recursive: true });
    // `dir`: every file in that folder of the package
    const list = files || (await fs.readdir(path.join(pkgDir, dir))).filter((f) => !f.startsWith('.')).sort().map((f) => `${dir}/${f}`);
    for (const file of list) {
      const out = path.join(ROOT, to, path.basename(file));
      await fs.copyFile(path.join(pkgDir, file), out);
      console.log(`  ${rel(out)} (from ${pkg})`);
    }
  }
}

async function main() {
  const target = process.argv[2];
  if (target && !['js', 'css'].includes(target)) {
    console.error('usage: node scripts/build.js [js|css]');
    process.exit(2);
  }
  if (!target || target === 'js') {
    console.log('Building JavaScript...');
    for (const bundle of BUNDLES) {
      await buildJsBundle(bundle);
    }
    await copyVendored('js');
  }
  if (!target || target === 'css') {
    console.log('Copying CSS and images...');
    await copyVendored('css');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
