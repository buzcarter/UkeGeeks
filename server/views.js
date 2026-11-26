'use strict';
/**
 * Page templates, ported 1:1 from ugsphp/views/*.php. All interpolations are
 * HTML-escaped by the `html` tag; inline scripts carry the per-request CSP nonce.
 */
const { html, raw, jsonForScript } = require('./lib/html');
// copied from @ukegeeks/song-editor by scripts/build.js
const { editorHtml } = require('./vendor/song-editor/markup');

// Asset/link prefix comes from the model: m.base is '/' for the server, or a relative
// path like '../../' for the static build (scripts/build-static.js).

const GREETINGS = ['Aloha', 'Bonjour', 'Ciao', "Greetin's", 'Guten Tag', 'Hallo', '¡Hola', 'Howdy', 'Hej', 'Konnichiwa', 'Mabuhay', 'Nǐ hǎo', 'Whassup', 'Yo'];
const sayHello = () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

const displayStyle = (value) => (value && value.length > 0 ? 'block' : 'none');

// ---------------------------------------------------------------------------
// Song list (detailed): song-list-detailed.php
// ---------------------------------------------------------------------------
function songRow(song) {
  return html`<a href="${song.uri}"><strong class="songTitle">${song.title}</strong>${
    song.artist ? html` <em class="songArtist">${song.artist}</em>` : ''
  }${!song.hasInfo ? html` <em class="songIncomplete">(incomplete)</em>` : ''}${
    song.subtitle ? html`<p><em class="songSubtitle">${song.subtitle}</em></p>` : ''
  }${song.album ? html`<p><em class="songAlbum">${song.album}</em></p>` : ''}</a>`;
}

function songListDetailed(m) {
  const user = m.siteUser;
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${m.pageTitle}</title>
  <meta name="generator" content="${m.poweredBy}" />
  <link rel="stylesheet" href="${m.base}css/ugsEditorPlus.min.css" title="ugsEditorCss" />
  <link rel="stylesheet" href="${m.base}css/ugsphp.css" />
  <link rel="stylesheet" href="${m.base}css/ugsEditorPlus.typeahead.css" />
</head>
<body class="songListPage">
  <section class="contentWrap">
    ${user.isAuthenticated
      ? html`<aside style="float:right;">
        <em style="font-size:.8em; padding-right:1.5em; color:#BCB59C;">${sayHello()}, ${user.displayName}!
          (<a href="/logout">Logout</a>)
        </em>
        ${m.isNewAllowed ? html`<input type="button" id="openNewDlgBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="New Song" title="Start editing a new song" />` : ''}
      </aside>`
      : m.showLoginLink
        ? html`<aside style="float:right;"><em style="font-size:.8em; padding-right:1.5em; color:#BCB59C;"><a href="/login">Login</a></em></aside>`
        : ''}
  <h2>${m.subHeadline}</h2>
  <h1>${m.headline}</h1>
  <p>${m.songList.length} Songs.
    <label for="quickSearch">Quick search:</label> <input class="quickSearch" id="quickSearch" autocomplete="off" type="text" /></p>
  <ol class="songList">
    ${m.songList.map((song) => html`<li>${songRow(song)}</li>`)}
  </ol>
  </section>
  <script src="${m.base}js/ugsEditorPlus.min.js"></script>
  <script src="${m.base}js/ugsSongList.min.js"></script>
  ${m.isNewAllowed
    ? html`<section class="ugsEditor-overlay" style="top:100px; right:40%; display:none;" id="newSongForm">
      <hgroup>
        <h3>Add Song</h3>
      </hgroup>
      <div><a title="close this" href="#close" id="hideNewSongBtn" class="ugsEditor-closeBtn">Close</a>
        <p id="loadingSpinner"><img src="${m.base}img/editor/busy.gif" alt="" /> Saving&hellip;</p>
        <p class="errorMessage" style="display:none;"></p>
        <label for="songTitle">Title</label>
        <input type="text" name="songTitle" id="songTitle" value="" />
        <label for="songArtist">Artist</label>
        <input type="text" name="songArtist" id="songArtist" value="" />
        <input type="button" id="newSongBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="Continue" title="Save &amp; continue editing" />
      </div>
    </section>
    <script nonce="${m.nonce}">
    ugsEditorPlus.newSong.init(${jsonForScript('/ajaxnewsong')});
    </script>`
    : ''}
<script nonce="${m.nonce}">
var qkSrch = ugsEditorPlus.typeahead();
qkSrch.initialize();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Song list (simple): song-list.php
// ---------------------------------------------------------------------------
function songList(m) {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>List All Songs</title>
  <meta name="generator" content="${m.poweredBy}" />
</head>
<body>
<h1>List All Songs</h1>
<p>${m.songList.length} songs</p>
<ol>
  ${m.songList.map((song) => html`<li><a href="${song.uri}">${song.title}</a></li>`)}
</ol>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Song, read-only: song.php
// ---------------------------------------------------------------------------
function song(m) {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${m.pageTitle}</title>
<meta name="generator" content="${m.poweredBy}" />
<script nonce="${m.nonce}">var isLegacyIe = false;</script>
<link rel="stylesheet" type="text/css" href="${m.base}css/yuiReset.css" />
<link rel="stylesheet" type="text/css" href="${m.base}css/basic-page-layout.css" media="all" />
<link rel="stylesheet" type="text/css" href="${m.base}css/ukeGeeks.music.css" media="all" />
<link rel="stylesheet" href="${m.base}css/ukeGeeks.musicPrint.css" media="print" />
<style>
header aside a{
  padding-left: 1em;
}
</style>
</head>
<body>
<section>
  <header>
    <hgroup>
      <aside>
        <a href="${m.editUri}" title="switch to Edit/Customize view (great for Print!)">Customize</a>
        <a href="${m.sourceUri}" target="_blank" title="view original song text">Source</a>
      </aside>
      <h1 class="ugsSongTitle">${m.songTitle}</h1>
      ${m.artist ? html`<h2 class="ugsArtist">${m.artist}</h2>` : ''}
      <h2 class="ugsSubtitle">${m.subtitle}</h2>
      ${m.album ? html`<h3 class="ugsAlbum">${m.album}</h3>` : ''}
    </hgroup>
  </header>
  ${m.meta.length > 0 ? html`<div class="metaInfo">${m.meta.map((x) => html`<p>${x}</p>`)}</div><!-- /.metaInfo -->` : ''}
  <div id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
    <aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
    <article id="ukeSongText" class="ugs-source-wrap"><pre>${m.body}</pre></article>
  </div>
</section>
<footer>
  <p>Note: <strong>GCEA</strong> Standard Ukulele Tuning. <small>Powered by UkeGeeks' Scriptasaurus &bull; ukegeeks.org</small></p>
</footer>
<script src="${m.base}js/song-formatter.bundle.js"></script>
<script src="${m.base}js/startup.js"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Song, with Song-a-matic editor toolbar: song-editable.php
// ---------------------------------------------------------------------------
function songEditable(m) {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${m.pageTitle}</title>
<script nonce="${m.nonce}">var isLegacyIe = false;</script>
<link href='https://fonts.googleapis.com/css?family=Peralta|Smokum|Cherry+Cream+Soda|Ranchers|Creepster|Lobster|Permanent+Marker|Architects+Daughter|Bree+Serif' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="${m.base}css/yuiReset.css" />
<link rel="stylesheet" href="${m.base}css/basic-page-layout.css" />
<link rel="stylesheet" href="${m.base}css/ukeGeeks.music.css" />
<link rel="stylesheet" href="${m.base}css/ugsEditorPlus.min.css" title="ugsEditorCss" />
<link rel="stylesheet" href="${m.base}css/ugsEditorPlus.print.css" media="print" />
</head>
<body class="editableSongPage pageWidth_screen">
${raw(editorHtml({
  canSave: m.isUpdateAllowed,
  imgUrl: `${m.base}img/editor/`,
  title: m.songTitle,
  subtitle: m.subtitle,
  artist: m.artist,
  album: m.album,
  body: m.body,
}))}

<!-- SCRIPTS -->
<script src="${m.base}js/song-formatter.bundle.js"></script>
<script src="${m.base}js/ugsEditorPlus.min.js"></script>
<script nonce="${m.nonce}">
var ugs_settings = ${jsonForScript(m.editorSettings)};
if (ugs_settings && ugs_settings.invalidJson){
  alert(ugs_settings.invalidJson);
  ugs_settings = {};
}
(function() {
  // scripts are at the end of <body>, so the page is ready
  var settings = window.ugs_settings || {};
  settings.useLegacyIe = isLegacyIe;
  ugsEditorPlus.songAmatic.init(settings);
  ${m.isUpdateAllowed ? html`ugsEditorPlus.updateSong.init(${jsonForScript('/ajaxupdatesong')}, ${jsonForScript(m.id)});` : ''}
}());
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Login: login.php
// ---------------------------------------------------------------------------
function login(m) {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${m.pageTitle}</title>
  <meta name="generator" content="${m.poweredBy}" />
  <link rel="stylesheet" href="${m.base}css/ugsEditorPlus.min.css" title="ugsEditorCss" />
  <link rel="stylesheet" href="${m.base}css/ugsphp.css" />
</head>
<body class="loginPage">
<section class="contentWrap">
</section>
<section class="ugsEditor-overlay">
  <hgroup>
    <h3>Login</h3>
  </hgroup>
  <div>
  <form method="post" action="/login" id="loginForm">
    <p class="errorMessage" id="loginErrorMessage" style="display: ${m.errorMessage ? 'block' : 'none'}">${m.errorMessage}</p>
    <ul>
      <li>
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" size="20" value="${m.username}" autocomplete="username" />
      </li>
      <li>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" size="20" autocomplete="current-password" />
        <p class="hint">yo! this is cAsEsenSiTIvE.</p>
      </li>
      <li class="ugsEditor-btnBar">
        <input type="submit" value="Login" name="loginBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" />
      </li>
    </ul>
    <p class="help">Problems or you need access? <a href="mailto:${m.supportEmail}?subject=I humbly beseech thee, songbook access, please...">Drop a line.</a></p>
  </form>
</div>
</section>
<script nonce="${m.nonce}">
var ugsLogin = (function(){
  var _public = {};

  _public.init = function(){
    window.onload = readyForm;
    document.getElementById('loginForm').onsubmit = function(){ return doSubmit(); };
  };

  var readyForm = function(){
    var h = document.getElementById('username');
    if (h.value.length < 1){
      h.focus();
    }
    else{
      document.getElementById('password').focus();
    }
  };

  var doSubmit = function(){
    var ok = (document.getElementById('username').value.length > 0) && (document.getElementById('password').value.length > 0);
    var err = document.getElementById('loginErrorMessage');
    if (!ok){
      err.textContent = 'Check your username & password';
      readyForm();
    }
    err.style.display = ok ? 'none' : 'block';
    return ok;
  };

  return _public;
}());

ugsLogin.init();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Reindex: songs-rebuild-cache.php
// ---------------------------------------------------------------------------
function rebuildCache(m) {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Song Index Rebuilt</title>
  <meta http-equiv="refresh" content="4;URL=/" />
</head>
<body>
  <h1>Cache Rebuilt</h1>
  <h3>${m.songCount} songs indexed in ${m.elapsedTime} seconds.</h3>
  <p>(you'll be redirected to the songbook in a few seconds, if you're impatient <a href="/">click here</a>)</p>
</body>
</html>`;
}

function notFound() {
  return html`<!DOCTYPE HTML>
<html lang="en">
<head><meta charset="utf-8" /><title>Not Found</title></head>
<body><h1>Not Found</h1><p>Nothing here. <a href="/">Back to the songbook</a>.</p></body>
</html>`;
}

module.exports = { songListDetailed, songList, song, songEditable, login, rebuildCache, notFound };
