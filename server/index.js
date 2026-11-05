#!/usr/bin/env node
'use strict';
/**
 * UkeGeeks songbook server: a dependency-free Node.js port of the PHP mini-site
 * (music.php + ugsphp/). Routes mirror htaccess.txt's pretty URLs:
 *
 *   GET  /                    songbook (song list)
 *   GET  /songbook/:song      song page (editable Song-a-matic view by default)
 *   GET  /edit/:song          editable song page
 *   GET  /source/:song        raw ChordPro text
 *   GET  /reindex             rebuild the song list cache
 *   GET  /login, POST /login, GET /logout
 *   POST /ajaxnewsong, /ajaxupdatesong   (JSON; editors only)
 *   GET  /music.php?action=…&song=…      legacy PHP-style links (redirected)
 *   GET  /css/*, /js/*, /img/*, /songs/* static files
 */
const http = require('node:http');

const cfg = require('./config');
const views = require('./views');
const { SongRepository, readEditorSettings } = require('./lib/songs');
const { Auth } = require('./lib/auth');
const {
  HttpError,
  newNonce,
  securityHeaders,
  sendHtml,
  sendText,
  sendJson,
  redirect,
  readJson,
  readForm,
  isSameOrigin,
  serveStatic,
} = require('./lib/http');

const STATIC_DIRS = ['css', 'js', 'img', 'songs'];
const JSON_LIMIT = cfg.maxFileSize * 4 + 4096; // headroom for JSON string escaping
const FORM_LIMIT = 8 * 1024;

const songs = new SongRepository(cfg);
const auth = new Auth(cfg);

const baseModel = (nonce, siteUser) => ({
  nonce,
  siteUser,
  poweredBy: cfg.poweredBy,
  supportEmail: cfg.supportEmail,
});

const mayEdit = (user) => user.mayEdit && user.isAuthenticated;

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function songbook(req, res, ctx) {
  if (!cfg.useDetailedLists) {
    return sendHtml(res, 200, views.songList({ ...ctx.model, songList: await songs.getSimpleSongList() }));
  }
  sendHtml(
    res,
    200,
    views.songListDetailed({
      ...ctx.model,
      pageTitle: cfg.songbookHeadline + ' ' + cfg.pageTitleSuffix,
      headline: cfg.songbookHeadline,
      subHeadline: cfg.songbookSubHeadline,
      songList: await songs.getSongList(),
      isNewAllowed: mayEdit(ctx.user),
      showLoginLink: auth.hasAccounts,
    })
  );
}

function makePageTitle(song, fallback) {
  let title = '';
  if (song.isOK) {
    title = song.title;
    if (song.artist) title += ' - ' + song.artist;
    else if (song.subtitle) title += ' - ' + song.subtitle;
  }
  return (title || fallback) + ' ' + cfg.pageTitleSuffix;
}

async function songPage(req, res, ctx, songId, { editable }) {
  const { filename, song } = await songs.load(songId);
  const id = filename || '';
  const encoded = encodeURIComponent(id || songId || '');
  const model = {
    ...ctx.model,
    pageTitle: makePageTitle(song, songId || 'Not Found'),
    songTitle: song.title,
    subtitle: song.subtitle,
    artist: song.artist,
    album: song.album,
    body: song.body,
    meta: song.meta,
    sourceUri: '/source/' + encoded,
    editUri: '/edit/' + encoded,
    id,
    isUpdateAllowed: Boolean(filename) && mayEdit(ctx.user),
    editorSettings: editable ? await readEditorSettings(cfg.editorSettingsFile) : null,
  };
  const status = song.isOK ? 200 : 404;
  sendHtml(res, status, editable ? views.songEditable(model) : views.song(model));
}

async function sourcePage(req, res, ctx, songId) {
  const { song } = await songs.load(songId);
  if (!song.isOK) return sendText(res, 404, 'Song not found.');
  sendText(res, 200, song.body);
}

async function reindex(req, res, ctx) {
  const start = process.hrtime.bigint();
  const list = await songs.getSongList({ force: true });
  const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
  sendHtml(res, 200, views.rebuildCache({ ...ctx.model, songCount: list.length, elapsedTime: elapsed.toFixed(5) }));
}

async function loginPage(req, res, ctx) {
  if (ctx.user.isAuthenticated) return redirect(res, '/');

  const model = { ...ctx.model, pageTitle: 'Login Required', username: '', errorMessage: '' };
  if (req.method === 'POST') {
    if (!isSameOrigin(req)) throw new HttpError(403, 'Cross-site request refused');
    const form = await readForm(req, FORM_LIMIT);
    model.username = form.get('username') || '';
    const result = await auth.login(req, res, model.username, form.get('password') || '');
    if (result.ok) return redirect(res, '/', 303);
    model.errorMessage = result.message;
  }
  sendHtml(res, model.errorMessage ? 401 : 200, views.login(model));
}

function logout(req, res) {
  auth.logout(req, res);
  redirect(res, cfg.isLoginRequired ? '/login' : '/');
}

/** Shape expected by ugsEditorPlus.newSong / updateSong (see JsonResponse_Vm.php) */
const jsonResponse = (props) => ({ HasErrors: true, Message: '', Id: '', ContinueUri: '', ...props });

async function ajaxGuard(req, ctx) {
  if (req.method !== 'POST') throw new HttpError(405, 'POST required');
  if (!isSameOrigin(req)) throw new HttpError(403, 'Cross-site request refused');
  if (!mayEdit(ctx.user)) throw new HttpError(403, 'You are not allowed to edit songs.');
  return readJson(req, JSON_LIMIT);
}

async function ajaxNewSong(req, res, ctx) {
  const json = await ajaxGuard(req, ctx);
  const title = typeof json.songTitle === 'string' ? json.songTitle.trim() : '';
  const artist = typeof json.songArtist === 'string' ? json.songArtist.trim() : '';
  if (!title) {
    return sendJson(res, 200, jsonResponse({ Message: "Song title is required, sorry." }));
  }
  try {
    const filename = await songs.create(title, artist);
    sendJson(res, 200, jsonResponse({ HasErrors: false, Id: filename, ContinueUri: '/edit/' + encodeURIComponent(filename) }));
  } catch (err) {
    console.error('[ajaxnewsong]', err);
    sendJson(res, 500, jsonResponse({ Message: "(e:803) Something's gone wrong whilst saving." }));
  }
}

async function ajaxUpdateSong(req, res, ctx) {
  const json = await ajaxGuard(req, ctx);
  if (typeof json.filename !== 'string' || typeof json.song !== 'string' || !json.filename || !json.song) {
    return sendJson(res, 400, jsonResponse({ Message: 'JSON data is missing.' }));
  }
  if (Buffer.byteLength(json.song, 'utf8') > cfg.maxFileSize) {
    return sendJson(res, 200, jsonResponse({ Message: `Song is too large (max ${cfg.maxFileSize} bytes).` }));
  }
  const filename = await songs.resolve(json.filename);
  if (!filename) {
    return sendJson(res, 404, jsonResponse({ Message: "Song file not found; can't update." }));
  }
  try {
    await songs.update(filename, json.song);
    sendJson(res, 200, jsonResponse({ HasErrors: false, Id: filename, Message: 'Success!' }));
  } catch (err) {
    console.error('[ajaxupdatesong]', err);
    sendJson(res, 500, jsonResponse({ Id: filename, Message: "Something's gone wrong whilst saving." }));
  }
}

/** Old music.php?action=X&song=Y links -> the new URL scheme */
function legacyUrl(params) {
  const action = String(params.get('action') || '').toLowerCase();
  const song = params.get('song') || '';
  const enc = encodeURIComponent(song);
  switch (action) {
    case 'song': return '/songbook/' + enc;
    case 'edit': return '/edit/' + enc;
    case 'source': return '/source/' + enc;
    case 'reindex': return '/reindex';
    case 'login': return '/login';
    case 'logout': return '/logout';
    case 'ajaxnewsong': return '/ajaxnewsong';
    case 'ajaxupdatesong': return '/ajaxupdatesong';
    default: return '/';
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/** "/songbook/Foo%20Bar" -> "Foo Bar" (null if the segment is malformed) */
function songParam(pathname, prefix) {
  try {
    return decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

async function route(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let pathname = url.pathname;

  if ((req.method === 'GET' || req.method === 'HEAD') && serveStatic(req, res, cfg.root, STATIC_DIRS, pathname)) {
    return;
  }

  if (pathname === '/music.php' || pathname === '/index.php') {
    const target = legacyUrl(url.searchParams);
    if (req.method === 'GET' || req.method === 'HEAD') return redirect(res, target, 301);
    pathname = target; // POSTs (old AJAX urls) are handled in place
  }

  const nonce = newNonce();
  securityHeaders(res, nonce);
  const user = auth.getUser(req);
  const ctx = { user, model: baseModel(nonce, user) };
  const isRead = req.method === 'GET' || req.method === 'HEAD';

  if (pathname === '/login') {
    if (!isRead && req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
    return loginPage(req, res, ctx);
  }
  if (pathname === '/logout') return logout(req, res);

  if (!user.isAllowAccess) {
    if (pathname.startsWith('/ajax')) throw new HttpError(401, 'Login required');
    return redirect(res, '/login');
  }

  if (pathname === '/ajaxnewsong') return ajaxNewSong(req, res, ctx);
  if (pathname === '/ajaxupdatesong') return ajaxUpdateSong(req, res, ctx);

  if (!isRead) throw new HttpError(405, 'Method not allowed');

  if (pathname === '/' || pathname === '/songbook' || pathname === '/songbook/') return songbook(req, res, ctx);
  if (pathname === '/reindex' || pathname === '/reindex/') return reindex(req, res, ctx);

  for (const [prefix, handler] of [
    ['/songbook/', (id) => songPage(req, res, ctx, id, { editable: cfg.useEditableSong })],
    ['/edit/', (id) => songPage(req, res, ctx, id, { editable: true })],
    ['/source/', (id) => sourcePage(req, res, ctx, id)],
  ]) {
    if (pathname.startsWith(prefix)) {
      const id = songParam(pathname, prefix);
      if (id === null) throw new HttpError(400, 'Bad song name');
      return handler(id);
    }
  }

  sendHtml(res, 404, views.notFound());
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) console.error(`[${req.method} ${req.url}]`, err);
    if (res.headersSent) return res.destroy();
    const message = status >= 500 ? 'Internal server error' : err.message;
    if (req.url.startsWith('/ajax') || String(req.headers.accept || '').includes('application/json')) {
      sendJson(res, status, jsonResponse({ Message: message }));
    } else {
      sendText(res, status, message);
    }
  });
});

server.headersTimeout = 20000;
server.requestTimeout = 30000;

server.listen(cfg.port, cfg.host, () => {
  const shown = cfg.host === '0.0.0.0' || cfg.host === '::' ? 'localhost' : cfg.host;
  console.log(`UkeGeeks songbook: http://${shown}:${server.address().port}/`);
  console.log(`  songs from ${cfg.songDirectory}`);
  if (cfg.isLoginRequired) console.log('  login required');
});

module.exports = server;
