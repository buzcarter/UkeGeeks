# UkeGeeks Scriptasaurus

When added to your webpage this JavaScript library creates ukulele chord fingering diagrams and nicely formated songsheets by reading songs from directly within HTML &lt;pre&gt; tags.

The optional PHP mini-website let's you start publishing your own songbooks.

Visit the [UkeGeeks website](http://ukegeeks.com) for more information.

Follow [@ukegeeks](https://twitter.com/ukegeeks)

Ongoing discussions and "How To" videos posted at [blog.ukegeeks.com](http://blog.ukegeeks.com). Also read the [User Guide and Chord Pro mark-up reference](http://blog.ukegeeks.com/users-guide/) for more demos and examples.

Lastly, the blog includes a [technical discussion and tips section](http://blog.ukegeeks.com/technical-reference/)

## Authors

* [Buz Carter](http://pizzabytheslice.com) (buz@ukegeeks.com)

## What's New...

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

* HTML5 markup. Chord diagrams are drawn using &lt;canvas /&gt; tag
* Includes sample songs (HTML) & Dreamweaver Templates
* Includes working PHP songbook generating app
* The main JavaScript library (Scriptasaurus) as individual class files, a merged version, and a merged & minified version
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
To illustrate the similarities of the static HTML and PHP-driven versions we have two presentations of "My Little Grass Shack in Kealakekua" (note: links point to UkeGeeks.com but will run on your web server):

* [Demo Static HTML](http://ukegeeks.com/songs/my-little-grass-shack-in-kealakekua.htm) _(see section Static Site Info below)_
* [Demo Songbook App's Song View](http://ukegeeks.com/music.php?action=song&song=my-little-grass-shack-in-kealakekuahttp://ukegeeks.com/music.php?action=song&song=my-little-grass-shack-in-kealakekua) _(see section "Getting Started With PHP Songbook" below)_

### Overview
Scriptasaurus does two things:
1. formats HTML;
2. generates chord diagrams.

It does these by reading a text block and rewriting it with additional HTML tags (&lt;code&gt;) wrapping any chords it detects (a chord is any text enclosed within square brackets, i.e. [Fmaj7])

It recognizes several ChordPro tags (for the most detailed info on supported tags visit [Uke Geek's User's Guide: ChordPro Markup Reference](http://blog.ukegeeks.com/users-guide/chordpro-markup-reference/))

#### About Names and Scope
Many files and CSS class names are prefaced with **"UGS"**: Uke Geeks Scriptasaurus. _"Uke Geeks"_ is the whole schmeer, the collection of projects. _"Scriptasuarus"_ (or "Core Library") refers to the single JavaScript library that does the heavy lifting.

Thus Scriptasuarus forms the heart of all Uke Geeks projects.

So the Editor uses Scritasaurus PLUS an additional class library ("ugsEditorPlus.merged.js"), but to merely render a song one only needs Scriptasaurus (ukeGeeks.Scriptasaurus.merged.js). (see note on "Merged versus Min" below)

This raises an important point:

> **Scriptasuaus does NOT use any jQuery**. The editor, however, is completely dependent upon jQuery.

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
http://mysite.com/uke-static/js/ukeGeeks.scriptasaurus.merged.js'
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