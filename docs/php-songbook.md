# Running the songbook with PHP

[← Back to the README](../README.md)

The Node.js server (`npm start`) is the easiest way to run the songbook. If your web host runs PHP and Apache instead, the PHP site serves the same pages.

There's also a video walkthrough: [Installing the Songbook application, part 1](https://ukegeeks.org/blog/installing-the-songbook-application-video-tutorial-part-1/).

## Setup

1. Copy the project to your web server.
2. Copy `ugsphp/Config.php.example` to `ugsphp/Config.php`. **This is where you turn on options and customize your installation**, including user accounts.
3. Put your songs in `cpm/` as `.cpm.txt` files.
4. Open `music.php` in your browser.

## How it's organized

The Songbook uses a rudimentary [Model-View-Controller architecture](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller). Why? You can change the _views_ (pages that are mostly HTML with a few PHP tags for the dynamic content) without worrying about breaking the inner workings (hint: there aren't many inner workings, either).

Every request goes through one file, `music.php`, the only PHP file outside the `ugsphp` directory. It creates the program's core class, `Ugs`, which bootstraps the system: it's the controller. `Ugs` loads all the class files, including `Config.php`, and picks the action to run.

The `ugsphp` directory:

- **builders**: handle the controller's actions. Builder classes end with a `_vmb` suffix and have a public `Build` method that returns a view model.
- **cache**: optional; holds the pre-indexed song list.
- **classes**: helper classes and libraries.
- **viewmodels**: the data objects passed to the views.
- **views**: the HTML. Every view is a PHP file with a predefined `$model` variable (its view model).

## Actions

Whether you use `mod_rewrite` or query params (`mysite.com/songbook` versus `mysite.com/music.php?action=songbook`), these actions are supported:

- **song**: view a single song.
- **reindex**: (optional) rebuild the song list cache by reading every song file.
- **source**: view the raw ChordPro song.
- **edit**: open a song in the editor.
- **login**: (optional) log a user in.
- **logout**: log the current user out.
- **ajaxnewsong**: (JavaScript call) create a new song from a title and artist.
- **ajaxupdatesong**: (JavaScript call) update an existing song; the key is the file name.

## Pretty URLs with mod_rewrite

Without `mod_rewrite` the Songbook works fine; you'll just see URLs like:

```text
http://mysite.com/music.php?action=song&song=my-favorite-martian
```

The `song` query param tells the builder which song file to read. Apache's `mod_rewrite` turns that into the friendlier:

```text
http://mysite.com/songbook/my-favorite-martian
```

The included `htaccess.txt` has the rule for this. If you already have an `.htaccess` file, merge its contents in; otherwise rename it to `.htaccess`. Make sure `mod_rewrite` is enabled in your Apache config (restart Apache if you've just turned it on), and set `UseModRewrite` to `true` in `Config.php`.

## Caching

With the "detailed" song lists turned on (`UseDetailedLists`), the Songbook uses a cached list of songs. Rebuild the cache each time you add a song file by hand. (Adding or updating a song in the editor rebuilds it for you.)

To reindex your songs, open one of these URLs (the second needs `mod_rewrite`):

```text
your-song-site.com/music.php?action=reindex
your-song-site.com/reindex
```

The Apache/PHP group needs write permission on the cache directory. You'll probably need `sudo` for these:

```bash
sudo chgrp -R _www /httpdocs/ukegeeks/ugsphp/cache
```

```bash
sudo chmod -R u+r+w+x,g+r+w+x,o+r-w+x /httpdocs/ukegeeks/ugsphp/cache
```

Then restart Apache:

```bash
sudo /usr/sbin/apachectl restart
```

## Installing in a subdirectory

The Songbook assumes it's installed in your web server's root, but you might want it in a subdirectory, such as `mysite.com/hobbies/ukulele/music.php`. Open `ugsphp/Config.php` and change `Subdirectory`. The default is the root:

```php
const Subdirectory = '/';
```

Change it to your path, with leading and trailing slashes:

```php
const Subdirectory = '/hobbies/ukulele/';
```

If you're using caching (the default), reindex your songs, since the song URLs are stored with each song's info:

```text
http://mysite.com/hobbies/ukulele/music.php?action=reindex
```

### Moving the static asset directories

You can also move the JavaScript, stylesheet and image directories, but keep them together in the same parent directory so the styles work. For example, change `StaticsPrefix` from the root `'/'` to:

```php
const StaticsPrefix = '/uke-static/';
```

The editor will then load, for example:

```text
http://mysite.com/uke-static/js/song-formatter.bundle.js
```

## Editor settings

To change the editor's defaults (font size, tuning, theme and so on), see [Editor default settings](configuration.md#editor-default-settings).

## Troubleshooting

- **Nothing happens on the sample songs:** make sure the page finds its CSS and JavaScript files. You might need to adjust your web server's root directory (did you install in the default directory?), or edit the page's `<script>` and `<link>` tags.
- **Server error "File Not Found: 404":** check your file locations.
- **PHP error "Warning: include_once(ugsphp/Ugs.php) … failed to open stream":** check where you installed the MVC files the views use. You can move them, but the config and the views must be able to find them.
