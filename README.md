# UkeGeeks Scriptasaurus

**Website Info:** ukegeeks.com is no longer affiliated with this project. Please use [ukegeeks.org](https://ukegeeks.org) instead.

**Live demo:** [buzcarter.github.io/UkeGeeks](https://buzcarter.github.io/UkeGeeks/)

When added to your webpage this JavaScript library creates ukulele chord fingering diagrams and nicely formatted songsheets by reading songs from directly within HTML &lt;pre&gt; tags.

The optional songbook web app (Node.js or PHP) lets you start publishing your own songbooks.

Visit the [UkeGeeks website](http://ukegeeks.org) for more information.

Ongoing discussions and "How To" videos posted at [blog.ukegeeks.org](http://blog.ukegeeks.org). Also read the [User Guide and Chord Pro mark-up reference](http://blog.ukegeeks.org/users-guide/) for more demos and examples.

Lastly, the blog includes a [technical discussion and tips section](http://blog.ukegeeks.org/technical-reference/)

## Running the songbook with Node.js

No PHP needed. Node 18+ and no runtime dependencies.

```bash
npm start
```

Then open http://127.0.0.1:8080/. Songs are read from `cpm/*.cpm.txt`. The pages are the same as the PHP site (songbook, song, Song-a-matic editor, source, login).

URLs follow the old `htaccess.txt` rewrites: `/songbook/<song>`, `/edit/<song>`, `/source/<song>`, `/reindex`, `/login`, `/logout`. Old `music.php?action=…&song=…` links redirect to them.

### Configuration

Copy `ugs.config.example.json` to `ugs.config.json` (it's git-ignored) and edit. Any key you leave out keeps its default (see `server/config.js`).

* `host`: defaults to `127.0.0.1` (this machine only). Use `0.0.0.0` to share on your network.
* `sortLocale`: how the song list is sorted, e.g. `zh-Hant-u-co-stroke` (stroke count) or `zh-u-co-pinyin`.
* `isLoginRequired`: lock the whole songbook behind a login.
* `accounts`: needed to add or save songs, even when login isn't required (sign in at `/login`). Passwords are stored as hashes. Make one with:

```bash
npm run hash-password
```

New songs are saved as `Title - Artist.cpm.txt`.

## Building the JavaScript & CSS

Edit the files under `src/`, never `js/*.merged.js` / `js/*.min.js` / `css/ugsEditorPlus.*.css` directly: those are generated, and the pages load the `.min` files.

Songs are rendered by [Song Formatter](https://github.com/buzcarter/song-formatter) (`@ukegeeks/song-formatter`, a devDependency). The build copies its browser bundle to `js/song-formatter.bundle.js` and its song styles to `css/ukeGeeks.music.css` and `css/ukeGeeks.musicPrint.css`, so don't edit those here either: change Song Formatter, release it, then bump its version in `package.json` and rebuild.

```bash
npm install
```

```bash
npm run build
```

`npm run build:js` or `npm run build:css` builds just one (each also copies its Song Formatter files). The concatenation order lives in `scripts/build.js`; add new source files there.

You don't have to run the build before pushing: on every merge to `master`, GitHub Actions rebuilds the bundles and commits any that changed (see below).

## Tests

```bash
npm test
```

## Continuous build & demo site

`.github/workflows/build-and-deploy.yml` runs on GitHub:

* **Pull requests:** build the bundles and run the tests.
* **Merge to `master`:** build, test, commit any rebuilt `js/` and `css/` files back to `master` (as "Rebuild bundles from src [skip ci]"), then publish the static demo to GitHub Pages: the library, the `songs/*.htm` demos and the landing page in `site/index.html`.

The demo also includes a static **Songbook** (`songbook/`): the song list with quick search, and every song in the Song-a-matic editor. Everything that runs in the browser works (appearance, transpose, tunings, Chord Builder, Fullscreen); saving, new songs and login need the server, so they're left out. Build it yourself with:

```bash
npm run build:static
```

It writes `dist/static/` (`songbook/` + `css/ js/ img/`) with relative links only, so it works on any static host, at the domain root or under a sub-path (use `--out dir` and `--songs dir` to change where it reads and writes).

To refresh another static site (e.g. ukegeeks.org) with the current build:

```bash
npm run sync:site -- /path/to/site --dry-run
```

It replaces `songbook/` entries and overwrites library files in `js/`, `css/` and `img/`, but never deletes files that exist only on that site. Drop `--dry-run` to write.

## Authors

* [Buz Carter](http://pizzabytheslice.com) (buz@ukegeeks.org)

## Contributors

* David Calam ([djc-503](https://github.com/djc-503))
* [louis-coding](https://github.com/louis-coding)
* AceLan Kao ([acelan](https://github.com/acelan))
* [hutzelknecht](https://github.com/hutzelknecht)

## What's New...

#### Next release (unreleased)
* General
  * **Songs are rendered by [Song Formatter](https://github.com/buzcarter/song-formatter)** 1.0.0-beta, the TypeScript successor to the Scriptasaurus library, with the same `ukeGeeks.*` API. Pages load `js/song-formatter.bundle.js` instead of `js/ukeGeeks.scriptasaurus.min.js`, and chord diagrams and tablature are SVG instead of `<canvas>`. The old library (`src/js/scriptasaurus/`) and `excanvas.js` are gone.
  * Same output as before: all 16 sample songs render with the same text, chords, diagrams and tabs, in standard, baritone and ADF#B tunings and with mini-diagrams.

#### V1.5.1
* General
  * **No more jQuery.** The editor now uses plain DOM APIs (`querySelector`, `classList`, `fetch`, CSS transitions); jQuery 1.9.1, Bootstrap's typeahead and the jQuery draggable plugin are gone. Pages run under a strict Content-Security-Policy.
* Scriptasaurus Core
  * `ukeGeeks.scriptasaurus.run(markup)` renders ChordPro text you pass in, instead of reading the `#ukeSongText` element (idea from [hutzelknecht](https://github.com/hutzelknecht), [PR #13](https://github.com/buzcarter/UkeGeeks/pull/13)). See "Rendering From Your Own Markup" below.
* "Song-a-matic" editor
  * Quick search (song list) is a small built-in dropdown: arrow keys + Enter or click, matches titles in any script.

#### V1.5.0
* General
  * **Node.js songbook server** (`npm start`, no runtime dependencies): same pages, URLs and editor as the PHP site, no PHP needed.
  * Security fixes across the PHP site: path traversal, XSS, CSRF, session handling, password hashes.
  * `npm run build` builds the JS/CSS bundles; GitHub Actions rebuilds them and deploys the [live demo](https://buzcarter.github.io/UkeGeeks/) on merge to `master`.
  * Third-party song sheets removed; new Maestro Saurus favicon.
* "Song-a-matic" editor
  * Quick search finds non-Latin (e.g. Chinese) titles and ignores accents.
  * Fullscreen (ACE) editor works again; ADF#B alternate tuning reaches the minified build.

#### V1.4.4
* "Song-a-matic" editor additions:
  * Settings. Override Song Editor's default settings by creating a single JSON file.

#### V1.4.3
* General
  * Minified JS files now use closure compression
  * Moved source files under "src" directory (may be safely discarded for deployment)
* "Song-a-matic" editor additions:
  * _Change to ugsphp/Config.php_ -- now sets application AppDirectory. Important that folks upgrading merge this change.
  * Set sort order of reference diagrams
  * User-defined settings via settings.json file
  * Refactor some methods to use events in order to lessen tight module coupling
* Scriptasaurus Core
  * Minor YuiDoc fixes, naming convention applied;

#### V1.14
* "Song-a-matic" editor additions:
  * **Chord Builder**. A point-n-click way to generate ChordPro define tags. The "mechanics" and "UI wireup" live in separate JS namespaces (new "chordBuilder" and existing "ugsEditorPlus", respectively)
  * **Themes**. Expanded from Standard and Reversed to include more colors and font options
  * Broke out the Stylesheet (from 2 to 6 files, including merged and minified versions for deployment)
* Scriptasaurus Core
  * Add "tacet chords" support (ignores various [NC] phrases).
  * Fix bug that allowed empty pre tags to be emitted
  * Fix mini-diagrams above 5th fret text overlap

#### V1.13
* Song-a-matic Editor
  * mostly converted to use jQuery
  * revamped, slightly iPad-friendlier UI
  * scale text independently from chord diagrams
* Scriptasaurus Core
  * option to ignore common chords

#### V1.12
* Includes "Song-a-matic" editor for easy printing & transposing
  * Reads both "plain text" or ChordPro markup
  * Transpose and switch between Soprano or Baritone tuning
  * Zoom! From 7pt to 14pt text
* Refactored PHP more closely adheres to a true MVC pattern
* Option to lockdown your songs with user accounts
* Choose which (if any) users you want to be able to Add and Edit songs
* Two flavors of songbook: bare-bones demo or detailed, styled ready-to-use
* Optional .htaccess with mod_rewrite configured for RESTful URLs
* ChordPro "hidden" comment support (lines beginning with #)

### What's Old

* HTML5 markup. Chord diagrams and tablature are drawn as SVG
* Includes sample songs (HTML) & Dreamweaver Templates
* Includes working PHP songbook generating app
* The song renderer ([Song Formatter](https://github.com/buzcarter/song-formatter)) as a single minified file; the editor as individual class files, a merged version, and a merged & minified version
* All JavaScript class methods are document using JavaDoc format
* Most common ukulele chords - a library of 300+

### What's Missing
- [x] Password protection
- [x] Chord overlap, aka "crash" detection
- [X] Mini-diagrams above 5th fret are misdrawn
- [_] Add-in chord libraries (augment built-in library)
- [x] Hide common chords option (end editable lists)
- [_] Per-user preferences (hello, cookie!)
- [_] CSS scrub -- tighten vertical spaces between blocks

-----------------------------------
## What's In This Project/Download
The UkeGeeks GitHub repostitory contains:

* **Static HTML Demos** illustrating how you can use only the minimum CSS & JS on your existing pages. This includes _Dreamweaver Templates_, if that makes your life easier, fantastic. If not, ignore them and, if you choose, remove any HTML comments you'll see refering to them.
* **PHP Powered Songbook Application** is a complete, plug-n-play application that dynamically reads ChordPro text files and generates a song listing page in addition to the individual song pages.

### Demos
To illustrate the similarities of the static HTML and PHP-driven versions we have two presentations of "My Little Grass Shack in Kealakekua" (note: links point to ukegeeks.org but will run on your web server):

* [Demo Static HTML](http://ukegeeks.org/songs/my-little-grass-shack-in-kealakekua.htm) _(see section Static Site Info below)_
* [Demo Songbook App's Song View](http://ukegeeks.org/music.php?action=song&song=my-little-grass-shack-in-kealakekuahttp://ukegeeks.org/music.php?action=song&song=my-little-grass-shack-in-kealakekua) _(see section "Getting Started With PHP Songbook" below)_

### Overview
Scriptasaurus does two things:
1. formats HTML;
2. generates chord diagrams.

It does these by reading a text block and rewriting it with additional HTML tags (&lt;code&gt;) wrapping any chords it detects (a chord is any text enclosed within square brackets, i.e. [Fmaj7])

It recognizes several ChordPro tags (for the most detailed info on supported tags visit [Uke Geek's User's Guide: ChordPro Markup Reference](http://blog.ukegeeks.org/users-guide/chordpro-markup-reference/))

#### About Names and Scope
Many files and CSS class names are prefaced with **"UGS"**: Uke Geeks Scriptasaurus. _"Uke Geeks"_ is the whole schmeer, the collection of projects. _"Scriptasuarus"_ (or "Core Library") refers to the single JavaScript library that does the heavy lifting.

Thus Scriptasuarus forms the heart of all Uke Geeks projects.

So the Editor uses Scriptasaurus PLUS an additional class library ("ugsEditorPlus.min.js"), but to merely render a song one only needs Scriptasaurus ("song-formatter.bundle.js"). Since the next release, Scriptasaurus is [Song Formatter](https://github.com/buzcarter/song-formatter), which keeps the same `ukeGeeks.scriptasaurus` API. (see note on "Merged versus Min" below)

This raises an important point:

> **Neither Scriptasaurus nor the editor use jQuery** (or any other library; the editor only lazy-loads the ACE editor for its "Fullscreen" mode).

#### Rendering From Your Own Markup
Normally `ukeGeeks.scriptasaurus.run()` reads the song from the `#ukeSongText` element's HTML. Pass ChordPro text to render that instead -- handy for editors, previews, or songs fetched via AJAX:

```js
ukeGeeks.scriptasaurus.init(false);
var song = ukeGeeks.scriptasaurus.run(document.getElementById('myTextarea').value);
// song.title, song.chords, ...
```

The page still needs the usual song container, diagrams and text elements (`#ukeSongContainer`, `#ukeChordsCanvas`, `#ukeSongText`); the song is drawn into them. The markup is treated as plain text: `<`, `>` and stray `&` are HTML-escaped before rendering (existing entities such as `&amp;` or `&copy;` are kept), so it's safe to pass what a user typed.

-----------------------------------
## More Files Than You Need

In the JavaScript and CSS directories you'll find "merged" and "min" (minified) versions of the libraries. These are all you need to start using the applications. However, if you want to tinker or see under the hood then you'll find the individual JS class libraries (or stylesheets) under the subdirectories helpful.

#### Merged versus Min
To better organize and maintain the JavaScript classes I've tried to follow strict "one class per file" and "one purpose, one class" policies. Thus, as you'll notice, there are a LOT of files which would clearly be a perfomance issue if they were linked individually. Fortunately [PHP minify](https://code.google.com/p/minify/) allows us to smush them all into a single file. In addition, minify allows us to further compact our merged files, removing comments and unneeded white-space.

Thus you'll find the individual class files as well as single merged and minified files. For a true production environment use the min version. To reverse engineer the project try the merged or single class files.

-----------------------------------
## Static Site Info

If you'll be hand building your HTML or adding it to your exising site pages I'll refer you to the sample songs under the "songs" directory.

Note: If you are serving static pages (no server application language such as PHP) I recommend using Dreamweaver's Templating system -- though this is entirely up to you. It's consistent, fast, and prevents you from accidentally editing a critical part of your file. This download includes sample templates used by the static HTML song page (located in the "`templates`" directory).

-----------------------------------
## Getting Started With PHP Songbook

The Songbook implements a rudamentary [Model-View-Controller architecture](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller). Why? This approach allows you to modify _Views_ (pages made mostly of HTML with a few PHP tags for emitting dynamic content) without need to worry about breaking any of the inner workings (hint: there aren't many inner workings either).

### A Poorboy's "Lite" MVC Architecture
All access to the application goes through a single file, "music.php" -- the only PHP file that lives outside of the ugsphp directory. Music.php instantiates the program's core class, Ugs, which bootstraps the system -- it's the Controller.

Ugs loads all class files, including Config.php, and chooses which action is required.

**The Config class is where you enable various options and customize your installation.**

Here's the ugsphp directory breakdown:

- **builders** : _handles Actions for the Controller._ Builder classes all end with "_vmb" suffix and have a public Build method that returns a ViewModel
- **cache** : _optional directory contains pre-indexed songs_
- **classes** : _Helper classes/Libraries_
- **viewmodels** : _Entity classes passed to Views_ These are the data objects available within the View pages.
- **views** : _display HTML_ All views are PHP files that have a predefined $model variable (the corresponding View Model)

### Using mod_rewrite For Pretty URL's

Without `mod_rewrite` your PHP Songbook will work fine, you'll just see page requests like this:
````
music.php?action=song&amp;song=filename
````

This URL's "query param" named "song" tells the Builder class which song file to read and prep for easy rendering via Scriptasaurus.

However, instead of surfacing rather klunky URLs make use of Apache's `mod_rewrite` engine to convert a doopey URL such as:

````
http://mysite.com/music.php?action=song&amp;song=my-favorite-martian
````

To the more friendly:
````
http://mysite.com/songbook/my-favorite-martian
````

The included `.htacces.txt` file has an easy rule for doing just this. If you already have an .htacces file just merge in the contents, otherwise remove the ".txt" portion. Make sure you've enabled MOD_REWRITE in your apache config (if you're just now enabling it remember to restart Apache).

### Caching
If you've enabled the "detailed" song lists the system automatically switches to using a cached list of the songs. Therefore, the cache must be rebuilt each time a song file is manually added (cache is automatically rebuilt after each Add or Update if editing is enabled)

To manually reindex your songs use this url (second is available if you've enabled mod_rewrite):

````
your-song-site.com/music.php?action=reindex
your-song-site.com/reindex
````

You'll need to make sure that the Apache/PHP group has the correct write permission on the cache directory.

```
chgrp -R _www /httpdocs/ukegeeks/ugsphp/cache
chmod -R u+r+w+x,g+r+w+x,o+r-w+x /httpdocs/ukegeeks/ugsphp/cache
```

You probably will need to "sudo" to have these commands work (run -- or "do" -- the command as "super user", thus "sudo"):

```
$ sudo chgrp -R _www /httpdocs/ukegeeks/ugsphp/cache
$ sudo chmod -R u+r+w+x,g+r+w+x,o+r-w+x /httpdocs/ukegeeks/ugsphp/cache
```
And, of course, restart apache

```
$ sudo /usr/sbin/apachectl restart
```

##### Overriding Song-A-Matic's Default Settings

There's a good chance that your prefered editor appearance differs from mine -- perhaps you'd like the initial font size much bigger, or you need baritone tuning, or you'd just like a different theme applied. You can easily change all these by creating a settings file that includes whichever values you want.

In the "ugsphp" folder you'll find a file named "settings.json_example" copy this file as "settings.json" and open it in your editor of choice. This file contains a small bit of JSON (JavaScript Object Notation) and a lot of comments. In here you'll see all of the available settings you're able to change along with their default and allowed values. Uncomment the ones you want by removing the double-slashes (line comment marker) at the beginning of the line:

````
{
/* If true the Edit Song box is shown when the page loads; false hides it.
 * Allowed values (number): 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 13, 14
 */
"fontSize": 9
}
````

Back in your web browser reload your song to see your settings applied. If they are not then the odds are that you have a minor typo -- a misplaced comma, an extra semicolon, or a missing closing quote. The app (tries) to display an alert box if there's a problem. If you get this error and cannot quickly resolve the issue then look online for a "JSON validator".

You may safely delete any unused options and comment blocks from your JSON settings, however, retain the original, unedited settings.json_example for future reference.

### Installing In A Different Directory

The Songbook assumes that it's installed in your web server's root directory, but you might want it in a subdirectory. Perhaps you want the URLs to be "mysite.com/hobbies/ukulele/music.php", for example. Excellent! To do this we just need to open `config.php` and change the subdirectory.

By default this is set to the root:

````
    const Subdirectory = '/';
````

You can just modify it to whatever you wish (include leading and trailing last forward slashes "/")

````
    const Subdirectory = '/hobbies/ukulele/';
````

If you're using caching (and by default the Songbook does) then the only remaining task is to reindex your ChordPro songs (the song URLs are stored along with the song meta-info). Type this into your browser's location bar:

````
http://mysite.com/hobbies/ukulele/music.php?action=reindex
````
##### Moving Uke Geek Asset Directories

You may also move the JavaScript, Stylesheet, and Image "static" directories, however, they all should live in the same directory in order for the styles to work correctly.

For example, you may change the `StaticsPrefix` option from the root `'/'` to:

````
const StaticsPrefix = '/uke-static/';
````

The Editor, for example, will now link to:

````
http://mysite.com/uke-static/js/song-formatter.bundle.js'
````

### Actions
Whether running mod_rewrite or using query params ("mysite.com/songbook" versus "mysite.com/music.php?action=songbook") there are a set of supported actions (verbs):

* **song**: view a single song
* **reindex**: (optional) rebuilds the song list cache by reading every CPM file
* **source**: view the "raw" ChordPro song
* **edit**: open a single song in the editor
* **login**: (optional) login a user
* **logout**: logs out the currently logged in user
* **ajaxnewsong**: (JavaScript call) create a new song using minimal inputs (title and artist)
* **ajaxupdatesong**: (JavaScript call) update existing song, key is file name

## Trouble Shooting
* **Nothing's happening on sample songs** : Make sure the page is finding the CSS and JavaScript files. You might need to&hellip;
  * adjust your web server "root" directory (did you install this in default directory?)
  * edit the page's script source and stylesheet link tags
* **Server error: _"File Not Found: 404"_** : Check file locations.
* **PHP error: _"Warning: include_once(ugsphp/Ugs.php) [function.include-once]: failed to open stream_** : Check where you've installed the MVC files used by the views. You may move them, but be sure that the config and the Views are able to locate the required files.


## License

This library is licensed under GNU General Public License.

* [http://www.gnu.org/licenses/gpl.html](http://www.gnu.org/licenses/gpl.html)

Use it, change it, fork it, but please leave the author attribution.