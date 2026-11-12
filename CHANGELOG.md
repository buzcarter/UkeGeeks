# Changelog

All notable changes to the UkeGeeks Songbook are listed here, newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions before 1.5.0 kept the original "General / Song-a-matic editor / Scriptasaurus core" grouping.

## [Unreleased]

Changes on `main` since 1.5.1.

### Changed

- The default branch is now `main` (it was `master`). CI builds and deploys the demo on merges to `main`.
- **The Song-a-matic editor is its own package now**, [`@ukegeeks/song-editor`](https://github.com/buzcarter/song-editor) 1.0.0-beta. The build copies its bundle, CSS, images and page markup in, like Song Formatter's; the editor's sources, LESS and `lazyload.js` left `src/`, and `less` is no longer a devDependency. Pages are unchanged: the editable song page's HTML is the same byte for byte.
- Song Editor 2.0.0-beta.4. The editor's class names are prefixed (`.overlay` is `.ugsEditor-overlay`, `.baseBtn` is `.ugsEditor-baseBtn`…) and its links that act as buttons are `<button>`s. The login page, the New Song dialog and the PHP views use the new names; if you styled or scripted the old ones, add the prefix.
- The song list page loads its quick search and New Song dialog from a new `js/ugsSongList.min.js` (built from `src/js/songList/`), after `js/ugsEditorPlus.min.js`.
- **Songs are rendered by [Song Formatter](https://github.com/buzcarter/song-formatter)** 1.0.0-beta, the TypeScript successor to the Scriptasaurus library, with the same `ukeGeeks.*` API. Pages load `js/song-formatter.bundle.js` instead of `js/ukeGeeks.scriptasaurus.min.js`.
- Chord diagrams and tablature are drawn as SVG instead of `<canvas>`.
- Output is unchanged: all 16 sample songs render with the same text, chords, diagrams and tabs, in standard, baritone and ADF#B tunings, and with mini-diagrams.
- Song-a-matic editor: the Fullscreen editor uses the [Ace ChordPro extension](https://github.com/buzcarter/ace-chordpro-extension) 1.0.0. That's Ace 1.26 (up from a 2014 build) with the ChordPro mode, snippets, chord completer and theme in one file, `js/ace/ace-chordpro.min.js`.

### Fixed

- The Edit Song box holds the song's exact text: a file with `&amp;` or `&copy;` used to show `&` or ©, and saving wrote it that way. (PHP too, with a new `hText()` helper.)
- From Song Editor 2.0: Chord Builder fixes for names with `$` or quotes, a muted string's X is visible on dark themes, and Reformat expands tabs to their tab stops.

### Removed

- The old Scriptasaurus library (`src/js/scriptasaurus/`) and `excanvas.js`.

## [1.5.1] - 2026-11-04

### Added

- `ukeGeeks.scriptasaurus.run(markup)` renders ChordPro text you pass in, instead of reading the `#ukeSongText` element (idea from [hutzelknecht](https://github.com/hutzelknecht), [PR #13](https://github.com/buzcarter/UkeGeeks/pull/13)). See [Song pages on your own site](docs/static-html.md#rendering-from-your-own-markup).

### Changed

- **No more jQuery.** The editor uses plain DOM APIs (`querySelector`, `classList`, `fetch`, CSS transitions). Pages run under a strict Content-Security-Policy.
- Song-a-matic editor: quick search (the song list) is a small built-in dropdown. Use the arrow keys and Enter, or click; it matches titles in any script.

### Removed

- jQuery 1.9.1, Bootstrap's typeahead and the jQuery draggable plugin.

## [1.5.0] - 2026-11-04

### Added

- **Node.js songbook server** (`npm start`, no runtime dependencies): the same pages, URLs and editor as the PHP site, no PHP needed.
- `npm run build` builds the JS/CSS bundles. GitHub Actions rebuilds them and deploys the [live demo](https://buzcarter.github.io/UkeGeeks/) on every merge to `master`.
- New Maestro Saurus favicon.

### Changed

- Song-a-matic editor: quick search finds non-Latin (e.g. Chinese) titles and ignores accents.

### Removed

- Third-party song sheets.

### Fixed

- Song-a-matic editor: the Fullscreen (Ace) editor works again.
- The ADF#B alternate tuning now reaches the minified build.

### Security

- Fixes across the PHP site: path traversal, XSS, CSRF, session handling and password hashes.

## [1.4.4]

### Added

- Song-a-matic editor: override the editor's default settings with a single JSON file (see [Configuration](docs/configuration.md#editor-default-settings)).

## [1.4.3] - 2015-07-17

### General

- Minified JS files use Closure compression.
- Source files moved under `src/` (you can safely leave it out of a deployment).

### Song-a-matic editor

- **Upgrading? Merge the change to `ugsphp/Config.php`:** it now sets the application's `AppDirectory`.
- Set the sort order of reference diagrams.
- User-defined settings via a `settings.json` file.
- Some methods use events, so modules are less tightly coupled.

### Scriptasaurus core

- Minor YUIDoc fixes; naming convention applied.

## 1.14

### Song-a-matic editor

- **Chord Builder**: a point-and-click way to make ChordPro `{define}` tags. The mechanics and the UI wiring live in separate JS namespaces (the new `chordBuilder` and the existing `ugsEditorPlus`).
- **Themes**: more colors and font options, beyond Standard and Reversed.
- The stylesheet is split from 2 files into 6, including merged and minified versions for deployment.

### Scriptasaurus core

- "Tacet chords" support (various `[NC]` phrases are ignored).
- Fixed: empty `<pre>` tags could be emitted.
- Fixed: mini-diagram text overlapped above the 5th fret.

## 1.13

### Song-a-matic editor

- Mostly converted to jQuery.
- Revamped, slightly iPad-friendlier UI.
- Scale the text independently of the chord diagrams.

### Scriptasaurus core

- Option to ignore common chords.

## 1.12

- Includes the "Song-a-matic" editor for easy printing and transposing:
  - Reads both plain text and ChordPro markup.
  - Transpose, and switch between soprano and baritone tuning.
  - Zoom from 7pt to 14pt text.
- The PHP is refactored to follow a true MVC pattern more closely.
- Option to lock down your songs with user accounts.
- Choose which users (if any) may add and edit songs.
- Two flavors of songbook: a bare-bones demo, or a detailed, styled, ready-to-use one.
- Optional `.htaccess` with `mod_rewrite` configured for RESTful URLs.
- ChordPro "hidden" comments (lines beginning with `#`).

## Earlier versions

Features from the early releases, still part of the project today:

- HTML5 markup. Chord diagrams and tablature are drawn as SVG.
- Sample songs (HTML) and Dreamweaver templates.
- A working PHP songbook app.
- The song renderer ([Song Formatter](https://github.com/buzcarter/song-formatter)) as a single minified file; the editor as individual class files, a merged version, and a merged and minified version.
- All JavaScript class methods are documented in JavaDoc format.
- A library of 300+ of the most common ukulele chords.

## Wishlist

Carried over from the old README's "What's Missing" list.

- [x] Password protection
- [x] Chord overlap ("crash") detection
- [x] Mini-diagrams above the 5th fret are misdrawn
- [x] Option to hide common chords
- [ ] Add-in chord libraries (to augment the built-in library)
- [ ] Per-user preferences (hello, cookie!)
- [ ] CSS scrub: tighten the vertical space between blocks

[Unreleased]: https://github.com/buzcarter/UkeGeeks/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/buzcarter/UkeGeeks/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/buzcarter/UkeGeeks/compare/v1.4.4...v1.5.0
[1.4.4]: https://github.com/buzcarter/UkeGeeks/compare/v1.4.3...v1.4.4
[1.4.3]: https://github.com/buzcarter/UkeGeeks/releases/tag/v1.4.3
