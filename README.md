# UkeGeeks Scriptasaurus

When added to your webpage this JavaScript library creates ukulele chord fingering diagrams and nicely formated songsheets by reading songs from directly within HTML &lt;pre&gt; tags.

The optional PHP mini-website let's you start publishing your own songbooks.

Visit the [UkeGeeks website](http://ukegeeks.com) for more information.

Follow [@ukegeeks](https://twitter.com/ukegeeks)

Ongoing discussions and "How To" videos posted at [blog.ukegeeks.com](http://blog.ukegeeks.com). Also read the [User Guide and Chord Pro mark-up reference](http://ukegeeks.com/users-guide.htm) for more demos and examples.

## Authors

* [Buz Carter](http://pizzabytheslice.com) (buz@ukegeeks.com)

## What's New In V1.12

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
- [ ] Chord overlap, aka "crash" detection
- [ ] Mini-diagrams above 5th fret
- [ ] Add-in chord libraries (augment built-in library)
- [ ] Hide common chords option (end editable lists)
- [ ] Per-user preferences (hello, cookie!)
- [ ] CSS scrub -- tighten vertical spaces between blocks

-----------------------------------
## Getting Started With PHP Site

All access to the application goes through a single file, "music.php" -- the only PHP file that lives outside of the ugsphp directory. Music.php instantiates the program's core class, Ugs, which bootstraps the system -- it's the Controller.

Ugs loads all class files, including Config.php, and chooses which action is required.

**The Config class is where you enable various options and customize your installation.**

Here's the ugsphp directory breakdown:

- **builders** : _handles Actions for the Controller._ Builder classes all end with "_vmb" suffix and have a public Build method that returns a ViewModel
- **cache** : _optional directory contains pre-indexed songs_
- **classes** : _Helper classes/Libraries_
- **viewmodels** : _Entity classes passed to Views_
- **views** : _display HTML_ All views are PHP files that have a predefined $model variable (the corresponding View Model)

###Caching###
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

## License

This library is licensed under GNU General Public License.

* [http://www.gnu.org/licenses/gpl.html](http://www.gnu.org/licenses/gpl.html)

Use it, change it, fork it, but please leave the author attribution.