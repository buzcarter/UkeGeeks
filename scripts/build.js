#!/usr/bin/env node
/**
 * Builds the UkeGeeks client libraries:
 *
 *   src/js/editor/*.js                 -> js/ugsEditorPlus.merged.js + .min.js
 *   src/less/ugsEditorPlus_merged.less -> css/ugsEditorPlus.merged.css + .min.css
 *
 * and copies in two packages (devDependencies), so the Songbook needs nothing
 * installed to run:
 *
 *   @ukegeeks/song-formatter, the song renderer:
 *     dist/song-formatter.bundle.js (+ .map, .LICENSE.txt) -> js/
 *     dist/css/ukeGeeks.music.css, ukeGeeks.musicPrint.css  -> css/
 *   @ukegeeks/ace-chordpro-extension, the fullscreen editor (Ace + ChordPro mode):
 *     dist/ace-chordpro.min.js                              -> js/ace/
 *
 * Usage: node scripts/build.js [js|css]   (no argument builds both)
 *
 * File ORDER matters: each module assumes the ones before it already exist
 * (namespace first). Keep the list in sync when adding source files.
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const BUNDLES = [
  {
    name: 'ugsEditorPlus',
    dir: 'src/js/editor',
    files: [
      'ugsEditorPlus.namespace.js',
      'ugsEditorPlus.dom.js',

      'ugsEditorPlus.options.js',
      'ugsEditorPlus.actions.js',
      'ugsEditorPlus.songUi.js',
      'ugsEditorPlus.styles.js',
      'ugsEditorPlus.themes.js',
      'ugsEditorPlus.optionsDlg.js',
      'ugsEditorPlus.reformat.js',
      'ugsEditorPlus.autoReformat.js',
      'ugsEditorPlus.topMenus.js',
      'ugsEditorPlus.submenuUi.js',
      'ugsEditorPlus.newSong.js',
      'ugsEditorPlus.updateSong.js',
      'ugsEditorPlus.typeahead.js',
      'ugsEditorPlus.aceHelp.js',
      'ugsEditorPlus.resize.js',
      'ugsEditorPlus.chordBuilder.js',
      'ugsEditorPlus.songAmatic.js',
      'ugsChordBuilder.js',
      'ugsChordBuilder.chooserList.js',
      'ugsChordBuilder.editorUi.js',
      // used by ugsEditorPlus.resize to load the ACE editor on demand ("Fullscreen" button)
      '../libs/lazyload.js',
    ],
  },
];

// Files copied from node_modules (see the header), by build target
const VENDORED = {
  js: [
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
      pkg: '@ukegeeks/song-formatter',
      to: 'css',
      files: ['dist/css/ukeGeeks.music.css', 'dist/css/ukeGeeks.musicPrint.css'],
    },
  ],
};

const LESS_ENTRY = 'src/less/ugsEditorPlus_merged.less';
const CSS_OUT = 'css/ugsEditorPlus';

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
  for (const { pkg, to, files } of VENDORED[target]) {
    const pkgDir = path.dirname(require.resolve(`${pkg}/package.json`));
    await fs.mkdir(path.join(ROOT, to), { recursive: true });
    for (const file of files) {
      const out = path.join(ROOT, to, path.basename(file));
      await fs.copyFile(path.join(pkgDir, file), out);
      console.log(`  ${rel(out)} (from ${pkg})`);
    }
  }
}

async function buildCss() {
  const less = require('less');
  const entry = path.join(ROOT, LESS_ENTRY);
  const input = await fs.readFile(entry, 'utf8');
  const opts = { filename: entry, paths: [path.dirname(entry)] };

  const full = await less.render(input, opts);
  const min = await less.render(input, { ...opts, compress: true });

  await fs.writeFile(path.join(ROOT, `${CSS_OUT}.merged.css`), full.css);
  await fs.writeFile(path.join(ROOT, `${CSS_OUT}.min.css`), min.css + '\n');
  console.log(`  ${CSS_OUT}.merged.css (${full.css.length} bytes)`);
  console.log(`  ${CSS_OUT}.min.css (${min.css.length} bytes)`);
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
    console.log('Building CSS...');
    await buildCss();
    await copyVendored('css');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
