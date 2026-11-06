# Song pages on your own site

[← Back to the README](../README.md)

**Just want chord diagrams and songsheets on your existing website?** Use [Song Formatter](https://github.com/buzcarter/song-formatter): it's the library that does that job now, and this page only covers what the Songbook repo still ships for it.

## Static HTML demos

The `songs/` directory has hand-built song pages that use only the minimum CSS and JavaScript, as a model for adding songs to your existing pages:

- `songs/my-little-grass-shack-in-kealakekua.htm` ([see it on ukegeeks.org](https://ukegeeks.org/songs/my-little-grass-shack-in-kealakekua.htm))
- `songs/multiple-songs-per-page.htm`

Compare them with the same song in the [live demo Songbook](https://buzcarter.github.io/UkeGeeks/).

If you're serving static pages (no server language such as PHP), Dreamweaver's templating system is handy, though entirely optional: it's consistent and fast, and it stops you from accidentally editing a critical part of the page. The sample template is in `Templates/ugs-song.dwt`. If you don't use Dreamweaver, ignore it, and feel free to remove the HTML comments that refer to it.

## How songs are formatted

The song renderer does two things:

1. formats the song's HTML;
2. draws the chord diagrams.

It reads a block of text and rewrites it, wrapping each chord it finds in a `<code>` tag. A chord is any text in square brackets, such as `[Fmaj7]`.

It understands many ChordPro tags; for the details see the [ChordPro Markup Reference](https://ukegeeks.org/blog/users-guide/chordpro-markup-reference/) in the User's Guide.

## Rendering from your own markup

Normally `ukeGeeks.scriptasaurus.run()` reads the song from the `#ukeSongText` element's HTML. Pass ChordPro text to render that instead: handy for editors, previews, or songs fetched with `fetch`:

```js
ukeGeeks.scriptasaurus.init(false);
var song = ukeGeeks.scriptasaurus.run(document.getElementById('myTextarea').value);
// song.title, song.chords, ...
```

The page still needs the usual song container, diagram and text elements (`#ukeSongContainer`, `#ukeChordsCanvas`, `#ukeSongText`); the song is drawn into them. The markup is treated as plain text: `<`, `>` and stray `&` are HTML-escaped before rendering (existing entities such as `&amp;` or `&copy;` are kept), so it's safe to pass what a user typed.

## About names

Many files and CSS class names start with **"UGS"**: Uke Geeks Scriptasaurus. "Uke Geeks" is the whole family of projects. "Scriptasaurus" was the JavaScript library that did the heavy lifting; it's now [Song Formatter](https://github.com/buzcarter/song-formatter), which keeps the same `ukeGeeks.scriptasaurus` API.

The editor uses the song renderer (`js/song-formatter.bundle.js`) plus its own library (`js/ugsEditorPlus.min.js`). To just render a song you only need the renderer.

**Neither the renderer nor the editor uses jQuery** or any other library. The editor only lazy-loads the Ace editor for its Fullscreen mode.
