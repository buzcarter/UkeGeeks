# Building, CI and the demo site

[← Back to the README](../README.md)

## Building the JavaScript and CSS

Edit the files under `src/`, never `js/*.merged.js`, `js/*.min.js`, `css/ugsEditorPlus.*.css`, `img/editor/` or `server/vendor/` directly: those are generated or copied from packages, and the pages load the `.min` files.

```bash
npm install
```

```bash
npm run build
```

`npm run build:js` or `npm run build:css` builds just one (each also copies its files from the packages below). The concatenation order lives in `scripts/build.js`; add new source files there.

You don't have to run the build before pushing: on every merge to `main`, GitHub Actions rebuilds the bundles and commits any that changed (see below).

### Files copied from other packages

Songs are rendered by [Song Formatter](https://github.com/buzcarter/song-formatter) (`@ukegeeks/song-formatter`, a devDependency). The build copies its browser bundle to `js/song-formatter.bundle.js` and its song styles to `css/ukeGeeks.music.css` and `css/ukeGeeks.musicPrint.css`. Don't edit those here either: change Song Formatter, release it, then bump its version in `package.json` and rebuild.

The Song-a-matic editor lives in its own package, [Song Editor](https://github.com/buzcarter/song-editor) (`@ukegeeks/song-editor`). The build copies its bundle to `js/ugsEditorPlus.merged.js` and `.min.js`, its styles to `css/ugsEditorPlus.merged.css`, `.min.css` and `.print.css`, its images to `img/editor/`, and its page markup to `server/vendor/song-editor/markup.js` (used by `server/views.js`, so the server still runs with nothing installed). The song list page's own scripts (quick search and New Song) stay here, in `src/js/songList/`, built to `js/ugsSongList.min.js`; that page loads `ugsEditorPlus.min.js` first.

The same goes for the Fullscreen editor: the build copies the [Ace ChordPro extension](https://github.com/buzcarter/ace-chordpro-extension)'s bundle (`@ukegeeks/ace-chordpro-extension`) to `js/ace/ace-chordpro.min.js`. Its help panel text is part of the Song Editor package.

### Merged versus min

The editor's JavaScript follows strict "one class per file" and "one purpose, one class" rules, so there are a lot of source files. Linking each one would be slow, so the build merges them into one file and also makes a minified copy with comments and extra whitespace removed.

Use the `.min` files in production. To see how things work, read the merged file or the individual source files under `src/`.

## Continuous build and demo site

`.github/workflows/build-and-deploy.yml` runs on GitHub:

- **Pull requests:** build the bundles and run the tests.
- **Merge to `main`:** build, test, commit any rebuilt `js/`, `css/`, `img/editor/` and `server/vendor/` files back to `main` (as "Rebuild bundles from src [skip ci]"), then publish the static demo to GitHub Pages: the library, the `songs/*.htm` demos and the landing page in `site/index.html`.

The demo also includes a static **Songbook** (`songbook/`): the song list with quick search, and every song in the Song-a-matic editor. Everything that runs in the browser works (appearance, transpose, tunings, Chord Builder, Fullscreen); saving, new songs and login need the server, so they're left out. Build it yourself with:

```bash
npm run build:static
```

It writes `dist/static/` (`songbook/` plus `css/`, `js/` and `img/`) with relative links only, so it works on any static host, at the domain root or under a sub-path. Use `--out dir` and `--songs dir` to change where it writes and reads.

## Syncing another static site

To refresh another static site (e.g. ukegeeks.org) with the current build:

```bash
npm run sync:site -- /path/to/site --dry-run
```

It replaces `songbook/` entries and overwrites library files in `js/`, `css/` and `img/`, but never deletes files that exist only on that site. Drop `--dry-run` to write.
