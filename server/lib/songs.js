'use strict';
/**
 * Song file access: listing, safe filename resolution, ChordPro metadata parsing,
 * the (in-memory) song list cache, creating and updating songs.
 * Ports ugsphp/classes/{FileHelper,SongHelper,SongListCacheManager,FileWriter}.php
 *
 * Security model: a song id from a URL or request body is NEVER joined onto a path
 * directly. It's normalized to a bare filename, then must match a file that actually
 * exists in the song directory listing. That makes path traversal impossible.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const NOT_FOUND_SONG = Object.freeze({
  isOK: false,
  title: 'Sorry... Song Not Found',
  subtitle: 'Check your link, please',
  artist: '',
  album: '',
  body: '[D]Where, oh, where has this [A7]stupid file gone?\nOh, [G]where or where can it [D]be?',
  meta: [],
});

function firstMatch(text, regex, group) {
  const m = regex.exec(text);
  return m ? m[group].trim() : '';
}

/**
 * Pulls title/subtitle/artist/album/meta tags out of ChordPro text.
 * @param {string|null} text
 */
function parseSong(text) {
  if (!text) {
    return { ...NOT_FOUND_SONG, meta: [] };
  }
  const meta = [];
  for (const m of text.matchAll(/{(?:ukegeeks-meta|meta)\s*:\s*(.+?)}/gi)) {
    meta.push(m[1]);
  }
  return {
    isOK: true,
    title: firstMatch(text, /{(t|title)\s*:\s*(.+?)}/i, 2),
    subtitle: firstMatch(text, /{(st|subtitle)\s*:\s*(.+?)}/i, 2),
    artist: firstMatch(text, /{artist\s*:\s*(.+?)}/i, 1),
    album: firstMatch(text, /{album\s*:\s*(.+?)}/i, 1),
    meta,
    body: text,
  };
}

/** "The Rose" -> "Rose, The" */
function fixLeadingArticle(title) {
  return title.replace(/^(the|a|an) (.*)$/i, '$2, $1');
}

function filenameToTitle(name) {
  return name
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Makes a string safe to use as (part of) a filename on macOS, Linux and Windows,
 * while keeping Unicode titles (e.g. Chinese) readable.
 */
function scrubForFilename(value, maxLength = 120) {
  const cleaned = String(value || '')
    .normalize('NFC')
    .replace(/[\/\\:*?"<>|\x00-\x1f\x7f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, '');
  return Array.from(cleaned).slice(0, maxLength).join('').trim();
}

/** Text used inside a ChordPro {tag: ...}; braces and newlines would break the tag. */
function scrubForTag(value) {
  return String(value || '').replace(/[{}\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

class SongRepository {
  /**
   * @param {{songDirectory: string, fileExtension: string, maxFileSize: number, sortLocale?: string}} cfg
   */
  constructor(cfg) {
    this.dir = cfg.songDirectory;
    this.ext = cfg.fileExtension;
    this.maxFileSize = cfg.maxFileSize;
    this.collator = new Intl.Collator(cfg.sortLocale || undefined, { sensitivity: 'base', numeric: true });
    /** @type {Map<string, {stamp: string, entry: object}>} */
    this.cache = new Map();
  }

  isSongFilename(name) {
    return name.length > this.ext.length && name.toLowerCase().endsWith(this.ext);
  }

  /** Filename without the ".cpm.txt" extension, used in song URLs. */
  baseName(filename) {
    return filename.slice(0, filename.length - this.ext.length);
  }

  /** @returns {Promise<string[]>} song filenames in the song directory (regular files only) */
  async listFilenames() {
    let entries;
    try {
      entries = await fs.readdir(this.dir, { withFileTypes: true });
    } catch (err) {
      console.error(`[songs] can't read song directory ${this.dir}: ${err.message}`);
      return [];
    }
    return entries
      .filter((e) => e.isFile() && this.isSongFilename(e.name))
      .map((e) => e.name)
      .sort();
  }

  /**
   * Converts a song id (from a URL or JSON body) to the filename of an existing song.
   * Accepts "name", "name.cpm.txt" or legacy "name.html". Returns null when the id
   * is malformed or no such song exists.
   * @param {unknown} id
   * @returns {Promise<string|null>}
   */
  async resolve(id) {
    if (typeof id !== 'string') return null;
    let name = id.normalize('NFC').trim();
    if (!name || name.length > 255 || /[\/\\\0]/.test(name) || name.startsWith('.')) {
      return null;
    }
    if (!this.isSongFilename(name)) {
      name = name.replace(/\.html?$/i, '') + this.ext;
    }
    const names = await this.listFilenames();
    if (names.includes(name)) return name;
    // macOS may hand back decomposed (NFD) filenames
    return names.find((n) => n.normalize('NFC') === name) || null;
  }

  /** Absolute path for a filename returned by resolve()/listFilenames(). */
  pathFor(filename) {
    const full = path.join(this.dir, filename);
    if (path.dirname(full) !== this.dir) {
      throw new Error('refusing path outside song directory');
    }
    return full;
  }

  /** @returns {Promise<string|null>} song text, or null if missing/unreadable */
  async read(filename) {
    try {
      return await fs.readFile(this.pathFor(filename), 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') console.error(`[songs] read ${filename}: ${err.message}`);
      return null;
    }
  }

  /** Reads + parses a song by id. Returns {filename, song} (song is the not-found stub if missing). */
  async load(id) {
    const filename = await this.resolve(id);
    const text = filename ? await this.read(filename) : null;
    return { filename, song: parseSong(text) };
  }

  songUri(filename) {
    return '/songbook/' + encodeURIComponent(this.baseName(filename));
  }

  async buildEntry(filename) {
    const parsed = parseSong(await this.read(filename));
    const base = this.baseName(filename);
    return {
      filename,
      uri: this.songUri(filename),
      hasInfo: parsed.title.length + parsed.artist.length > 0,
      title: fixLeadingArticle(parsed.title || filenameToTitle(base)),
      subtitle: parsed.subtitle,
      album: parsed.album,
      artist: parsed.artist,
    };
  }

  /**
   * Detailed song list, sorted by title. Entries are cached and only re-parsed when a
   * file's size or modified time changes, so new/edited files show up without a reindex.
   * @param {{force?: boolean}} [opts]
   */
  async getSongList({ force = false } = {}) {
    if (force) this.cache.clear();
    const names = await this.listFilenames();
    const live = new Set(names);

    const list = await Promise.all(
      names.map(async (filename) => {
        let stamp = '';
        try {
          const st = await fs.stat(this.pathFor(filename));
          stamp = `${st.size}:${st.mtimeMs}`;
        } catch {
          /* vanished between readdir and stat; parse will yield a stub */
        }
        const hit = this.cache.get(filename);
        if (hit && hit.stamp === stamp) return hit.entry;
        const entry = await this.buildEntry(filename);
        this.cache.set(filename, { stamp, entry });
        return entry;
      })
    );

    for (const key of this.cache.keys()) {
      if (!live.has(key)) this.cache.delete(key);
    }

    return list.sort(
      (a, b) => this.collator.compare(a.title, b.title) || this.collator.compare(a.filename, b.filename)
    );
  }

  /** Simple list (titles derived from filenames), like SongList_Vmb.php */
  async getSimpleSongList() {
    const names = await this.listFilenames();
    return names
      .map((filename) => ({
        uri: this.songUri(filename),
        title: fixLeadingArticle(filenameToTitle(this.baseName(filename))),
      }))
      .sort((a, b) => this.collator.compare(a.title, b.title));
  }

  /**
   * Creates a new song stub named "Title - Artist.cpm.txt" (made unique if taken).
   * @returns {Promise<string>} the new filename
   */
  async create(title, artist) {
    const cleanTitle = scrubForTag(title);
    const cleanArtist = scrubForTag(artist);

    let base = scrubForFilename(cleanArtist ? `${cleanTitle} - ${cleanArtist}` : cleanTitle) || 'untitled';
    const content =
      `{title: ${cleanTitle || 'untitled'}}\n` +
      `{artist: ${cleanArtist || 'traditional'}}\n` +
      '\nTYPE_YOUR_SONG_HERE\n';

    for (let n = 1; n <= 50; n++) {
      const filename = (n === 1 ? base : `${base} (${n})`) + this.ext;
      try {
        // "wx" fails if the file exists: never overwrites, no race between check and write
        await fs.writeFile(this.pathFor(filename), content, { flag: 'wx' });
        return filename;
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
    }
    // pathological: 50 songs with the same name, fall back to a random suffix
    const filename = `${base}.${crypto.randomBytes(4).toString('hex')}${this.ext}`;
    await fs.writeFile(this.pathFor(filename), content, { flag: 'wx' });
    return filename;
  }

  /**
   * Replaces an existing song's text (atomic: temp file + rename).
   * @param {string} filename must come from resolve()
   * @param {string} text
   */
  async update(filename, text) {
    const target = this.pathFor(filename);
    const tmp = path.join(this.dir, `.${crypto.randomBytes(6).toString('hex')}.ugs-tmp`);
    try {
      await fs.writeFile(tmp, text, { flag: 'wx' });
      await fs.rename(tmp, target);
    } catch (err) {
      await fs.rm(tmp, { force: true });
      throw err;
    }
    this.cache.delete(filename);
  }
}

/**
 * Reads the optional editor settings file. It's "JSON with comments" (see
 * ugsphp/settings.json_example); comments are stripped before parsing.
 * @returns {Promise<object>}
 */
async function readEditorSettings(file) {
  if (!file) return {};
  let text;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch {
    return {};
  }
  const json = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[ \t])\/\/.*$/gm, '$1');
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return { invalidJson: 'There is a problem with your settings: invalid JSON. Please check for typos.' };
  }
}

module.exports = { SongRepository, parseSong, fixLeadingArticle, scrubForFilename, readEditorSettings };
