# Configuration

[← Back to the README](../README.md)

## Node.js server: `ugs.config.json`

Copy `ugs.config.example.json` to `ugs.config.json` (it's git-ignored) and edit it. Any key you leave out keeps its default (see `server/config.js`).

- `host`: defaults to `127.0.0.1` (this machine only). Use `0.0.0.0` to share the songbook on your network.
- `port`: defaults to `8080`. The `PORT` environment variable overrides it.
- `songDirectory`: where the songs live; defaults to `cpm`.
- `songbookHeadline`, `songbookSubHeadline`: the titles on the song list page.
- `sortLocale`: how the song list is sorted, e.g. `zh-Hant-u-co-stroke` (stroke count) or `zh-u-co-pinyin`.
- `isLoginRequired`: lock the whole songbook behind a login.
- `accounts`: needed to add or save songs, even when login isn't required (sign in at `/login`). Passwords are stored as hashes. Make one with:

```bash
npm run hash-password
```

New songs are saved as `Title - Artist.cpm.txt`.

### URLs

URLs follow the old `htaccess.txt` rewrites: `/songbook/<song>`, `/edit/<song>`, `/source/<song>`, `/reindex`, `/login`, `/logout`. Old `music.php?action=…&song=…` links redirect to them.

## PHP site: `ugsphp/Config.php`

The PHP songbook keeps its options, including user accounts, in `ugsphp/Config.php`. Copy `ugsphp/Config.php.example` to start. See [Running the songbook with PHP](php-songbook.md).

## Editor default settings

Your preferred editor appearance probably differs from mine: maybe you'd like a much bigger starting font size, baritone tuning, or a different theme. Change any of these with a settings file. It works with both the Node.js and PHP servers.

In the `ugsphp` folder, copy `settings.json_example` to `settings.json` and open it in your editor. It holds a small bit of JSON and a lot of comments listing every setting you can change, with its default and allowed values. Uncomment the ones you want by removing the `//` at the start of the line:

```js
{
/* If true the Edit Song box is shown when the page loads; false hides it.
 * Allowed values (number): 6, 6.5, 7, 7.5, 8, 8.5, 9, 10, 11, 12, 13, 14
 */
"fontSize": 9
}
```

Reload a song in your browser to see your settings. If they don't apply, you probably have a small typo: a misplaced comma, an extra semicolon or a missing closing quote. The app tries to show an alert when it can't read the file. If you can't spot the problem, paste the file into an online "JSON validator".

You can delete any unused options and comment blocks from `settings.json`, but keep the original `settings.json_example` for reference.
