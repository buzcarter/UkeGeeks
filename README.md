# UkeGeeks-ng

![Ukegeeks-ng](./img/screenshot.png)
![Ukegeeks-ng song](./img/screenshot2.png)

This fork is an attempt at an *enhanced/updated/modified/edited_to_fits_my_needs* version of UkeGeeks    
(since the original doesn't seems to accept pull request since early 2015).

UkeGeeks is a songbook editor for ukulele originally created by [Buz Carter](http://pizzabytheslice.com) (buz@ukegeeks.com) :)

### What's changed so far :

#### Major features/changes

- Chords now **stay on top** when **scrolling** a song
- Added a **DELETE SONG** button to the EDITOR
- Added **Auto-Scrolling** of song
- Added a **SONGBOOK** button when viewing a song (to go back)
- **Sorted the song list** by artist and song name + layout change for better search
- Removed **legacy browser** support
- Added full **TRANSLATION support**. Currently :
  - ENGLISH
  - FRENCH
  - GERMAN (thanks to Louis-Coding)
  - (you can contribute :p)
- Removed 'no detailed list' and 'no editable song' mode. We want full functionality, all the time

#### Improvements, small fixes, QoL changes

- Removed the **edit** button if **no write access** allowed
- Added some missing **chords**
- Proper **404 handling** (on **page** missing and on **song** missing)
- **Non-intrusive popup** on missing chords
- Various pseudo-security fixes (.gitignore, separate config file, preventing some things to READ only users, ...)
- Switched some calls to HTTPS
- Removed useless SOPRANO tuning references on each pages
- Login page cleanup + ability to hide email
- Made the advanced editor link more obvious + help displayed on startup

_______________________________________________________
# Installation

Nothing special here, you need Apache / Php.  
Mod_rewrite is really recommanded too (for prettier url).

Just download the source and unzip-it (or use git clone) on your hosting space.

**Important : By default, the Songbook assumes that it's installed in your web server's root directory.**
If you want to change this, read below (installing in a different directory).

## Setup username, preferences

- **Step 1** : Rename the file **/ugsphp/Config_example.php** to **Config.php** and edit-it to suits your needs (username, passwords, language, etc)
- **Step 2** : Rename the **/ugsphp/settings.js_example** to **settings.js** and edit-it to suits your preferences (diagram size, position, default theme, ...).

And that's it, you should be good to go. Start adding songs :)

#### Optional : installing in a different directory
The Songbook assumes that it's installed in your web server's root directory, but you might want it in a subdirectory. Perhaps you want the URLs to be "mysite.com/hobbies/ukulele/music.php", for example. Excellent! To do this we just need to open config.php and change the subdirectory.

By default this is set to the root:

    const Subdirectory = '/';
    
You can just modify it to whatever you wish (include leading and trailing last forward slashes "/")

    const Subdirectory = '/hobbies/ukulele/';
 
#### Optional : changing Asset directories

You may also move the JavaScript, Stylesheet, and Image "static" directories, however, they all should live in the same directory in order for the styles to work correctly.

For example, you may change the StaticsPrefix option from the root '/' to:

const StaticsPrefix = '/uke-static/';

The Editor, for example, will now link to:

http://mysite.com/uke-static/js/ukeGeeks.scriptasaurus.merged.js'
