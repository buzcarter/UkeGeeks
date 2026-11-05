#!/usr/bin/env node
/**
 * Builds the UkeGeeks client libraries from src/:
 *
 *   src/js/scriptasaurus/*.js  -> js/ukeGeeks.scriptasaurus.merged.js + .min.js
 *   src/js/editor/*.js         -> js/ugsEditorPlus.merged.js + .min.js
 *   src/less/ugsEditorPlus_merged.less -> css/ugsEditorPlus.merged.css + .min.css
 *
 * Usage: node scripts/build.js [js|css]   (no argument builds both)
 *
 * File ORDER matters: each module assumes the ones before it already exist
 * (namespace first, scriptasaurus "main" last). Keep these lists in sync when
 * adding source files.
 */
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const BUNDLES = [
  {
    name: 'ukeGeeks.scriptasaurus',
    dir: 'src/js/scriptasaurus',
    files: [
      'ukeGeeks.namespace.js',
      'ukeGeeks.definitions.js',
      'ukeGeeks.settings.js',
      'ukeGeeks.data.js',
      'ukeGeeks.toolsLite.js',
      'ukeGeeks.chordImport.js',
      'ukeGeeks.transpose.js',
      'ukeGeeks.definitions.sopranoUkuleleGcea.js',
      'ukeGeeks.canvasTools.js',
      'ukeGeeks.chordBrush.js',
      'ukeGeeks.chordParser.js',
      'ukeGeeks.cpmParser.js',
      'ukeGeeks.chordPainter.js',
      'ukeGeeks.tabs.js',
      'ukeGeeks.overlapFixer.js',
      'ukeGeeks.scriptasaurus.js',
    ],
  },
  {
    name: 'ugsEditorPlus',
    dir: 'src/js/editor',
    files: [
      'ugsEditorPlus.namespace.js',
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
      'ugsEditorPlus.resize.js',
      'ugsEditorPlus.chordBuilder.js',
      'ugsEditorPlus.songAmatic.js',
      'ugsChordBuilder.js',
      'ugsChordBuilder.chooserList.js',
      'ugsChordBuilder.editorUi.js',
    ],
  },
];

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
  }
  if (!target || target === 'css') {
    console.log('Building CSS...');
    await buildCss();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
