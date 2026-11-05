'use strict';
/**
 * Page templates, ported 1:1 from ugsphp/views/*.php. All interpolations are
 * HTML-escaped by the `html` tag; inline scripts carry the per-request CSP nonce.
 */
const { html, jsonForScript } = require('./lib/html');

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
        ${m.isNewAllowed ? html`<input type="button" id="openNewDlgBtn" class="baseBtn blueBtn" value="New Song" title="Start editing a new song" />` : ''}
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
  ${m.isNewAllowed
    ? html`<section class="overlay" style="top:100px; right:40%; display:none;" id="newSongForm">
      <hgroup>
        <h3>Add Song</h3>
      </hgroup>
      <div><a title="close this" href="#close" id="hideNewSongBtn" class="closeBtn">Close</a>
        <p id="loadingSpinner"><img src="${m.base}img/editor/busy.gif" alt="" /> Saving&hellip;</p>
        <p class="errorMessage" style="display:none;"></p>
        <label for="songTitle">Title</label>
        <input type="text" name="songTitle" id="songTitle" value="" />
        <label for="songArtist">Artist</label>
        <input type="text" name="songArtist" id="songArtist" value="" />
        <input type="button" id="newSongBtn" class="baseBtn blueBtn" value="Continue" title="Save &amp; continue editing" />
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
<script src="${m.base}js/ukeGeeks.scriptasaurus.min.js"></script>
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
<section id="scalablePrintArea" class="scalablePrintArea">
  <header>
    <hgroup class="ugs-songInfo">
      <h1 id="songTitle" class="ugs-songTitle">${m.songTitle}</h1>
      <h2 id="songSubtitle" class="ugs-songSubtitle" style="display:${displayStyle(m.subtitle)};">${m.subtitle}</h2>
      <h2 id="songArtist" class="ugs-songArtist" style="display:${displayStyle(m.artist)};">${m.artist}</h2>
      <h2 id="songAlbum" class="ugs-songAlbum" style="display:${displayStyle(m.album)};">${m.album}</h2>
    </hgroup>
  </header>
  <div class="metaInfo" id="songMeta"> </div>
  <article id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
    <aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
    <article id="ukeSongText" class="ugs-source-wrap">
      <pre>${m.body}</pre>
    </article>
  </article>
  <footer>
    <p>Note: <span id="footTuningInfo"><strong>GCEA</strong> Standard Ukulele</span> Tuning. <small>Powered by <a href="http://ukegeeks.org/" title="Uke Geeks for free ukulele JavaScript tools">UkeGeeks' Scriptasaurus</a> &bull; ukegeeks.org</small></p>
  </footer>
</section>
<!-- EDIT SONG (DIALOG) -->
<section id="songSourceDlg" class="overlay ${m.isUpdateAllowed ? '' : 'isHidden'}">
  <hgroup>
    <h3>Edit Song</h3>
  </hgroup>
  <div>
    <a title="close this" href="#close" class="closeBtn">Close</a>
    <a title="switch to fullscreen editor" href="#resize" class="resizeBtn">Fullscreen</a>
    <p class="btnBar">
      <span id="messageBox" class="updateMessage">
        <em>
          <img src="${m.base}img/editor/busy.gif" id="loadingSpinner" style="display:none;" alt="" />
          <span id="sourceFeedback"></span>
        </em>
      </span>
      <input type="button" id="updateBtn" class="baseBtn blueBtn" value="Update" title="Rebuild digarams and music" />
      ${m.isUpdateAllowed ? html`<input type="button" id="saveBtn" class="baseBtn orange" value="Save" title="Save" style="margin-right:1.6em;" />` : ''}
      <a href="#chordBuilder" id="cdBldOpenBtn" data-dialog="cdBldDlg" class="alternateBtn" title="Add custom &amp; alternate chord diagrams">Chord Builder</a>
    </p>
    <textarea id="chordProSource" wrap="off">${m.body}</textarea>
  </div>
</section>
<!-- APP TOOLBAR -->
<section id="ugsAppToolbar" class="ugsAppMenuBar">
  <ul>
    <li class="navEdit" data-dialog="songSourceDlg"> <a href="#songSourceDlg" title="View &amp; edit the song source"><span></span>Edit</a> </li>
    <li class="navLayout showOptionsBox"> <a href="#layoutOptions" title="Resize fonts &amp; chord diagrams. Customize layout &amp; colors."><span></span>Appearance</a></li>
    <li class="navInstruments showOptionsBox"> <a href="#tuningOptions" title="Transpose song's key &amp; choose your prefered ukulele tuning"><span></span>Transpose</a></li>
    <li class="navOptions showOptionsBox"> <a href="#optionsDlg" title="Advanced options &amp; settings"><span></span>Options</a> </li>
    <li class="showDlgBtn showOptionsBox"> <a href="#helpDlg" title="Help &amp; Quick tips on formatting your song">?</a> </li>
  </ul>
  <h2 class="ugsLogo">Uke Geeks Song-a-Matic</h2>
</section>
<!-- LAYOUT OPTIONS -->
<aside class="arrowBox layoutOptions" id="layoutOptions">
  <fieldset class="arrowBoxContent enablePseudoSelects">
    <dl>
      <dt><label for="fontSizePicker"><span>Font size 12pt</span> <em>&#9658;</em></label></dt>
      <dd id="fontSizePicker" data-action="zoomFonts">
        <ul class="pseudoSelect">
          <li><a href="#6">6 pt </a></li>
          <li><a href="#6.5">6.5 pt </a></li>
          <li><a href="#7">7 pt </a></li>
          <li><a href="#7.5">7.5 pt </a></li>
          <li><a href="#8">8 pt </a></li>
          <li><a href="#8.5">8.5 pt </a></li>
          <li><a href="#9">9 pt </a></li>
          <li><a href="#9.5">9.5 pt </a></li>
          <li><a href="#10">10 pt </a></li>
          <li><a href="#11">11 pt </a></li>
          <li class="checked"><a href="#12">12 pt </a></li>
          <li><a href="#13">13 pt </a></li>
          <li><a href="#14">14 pt </a></li>
        </ul>
      </dd>
      <dt><label for="diagramSizePicker"><span>Stupid Large diagrams</span> <em>&#9658;</em></label></dt>
      <dd id="diagramSizePicker" data-action="zoomDiagrams">
        <ul class="pseudoSelect">
          <li><a href="#40">Tiny </a></li>
          <li><a href="#65">Small </a></li>
          <li><a href="#80">Medium </a></li>
          <li><a href="#90">Large </a></li>
          <li class="checked"><a href="#100">Stupid Large </a></li>
        </ul>
      </dd>
      <dt><label for="diagramPositionPicker"><span>Reference diagrams on left</span> <em>&#9658;</em></label></dt>
      <dd id="diagramPositionPicker" data-action="layout">
        <ul class="pseudoSelect">
          <li class="checked"><a href="#left">On left side</a></li>
          <li><a href="#top">At the top</a></li>
          <li><a href="#none">Don't show</a></li>
        </ul>
      </dd>
      <dt><label for="lyricChordsPicker"><span>Chord names above lyrics</span> <em>&#9658;</em></label></dt>
      <dd id="lyricChordsPicker" data-action="placement">
        <ul class="pseudoSelect">
          <li><a href="#inline">Chord names inline </a></li>
          <li class="checked"><a href="#above">Chord names above </a></li>
          <li><a href="#miniDiagrams">Names &amp; diagrams above </a></li>
        </ul>
      </dd>
      <dt><label for="colorPicker"><span>Normal colors (white paper) </span><em>&#9658;</em></label></dt>
      <dd id="colorPicker" data-action="colors">
        <ul class="pseudoSelect"></ul>
      </dd>
    </dl>
  </fieldset>
</aside>
<!-- TUNING OPTIONS -->
<aside class="arrowBox tuningOptions" id="tuningOptions">
  <fieldset class="arrowBoxContent enablePseudoSelects">
    <dl>
      <dt><label for="transposePicker"><span>Original key</span> <em>&#9658;</em></label></dt>
      <dd id="transposePicker" data-action="transpose">
        <ul class="pseudoSelect" id="transposeOptions">
          <li><a href="#down_6">-6 <em>F#</em></a></li>
          <li><a href="#down_5">-5 <em>G</em></a></li>
          <li><a href="#down_4">-4 <em>G#</em></a></li>
          <li><a href="#down_3">-3 <em>A</em></a></li>
          <li><a href="#down_2">-2 <em>A#</em></a></li>
          <li><a href="#down_1">-1 <em>B</em></a></li>
          <li class="checked"><a href="#up_0">Original <em>C</em></a></li>
          <li><a href="#up_1">+1 <em>C#</em></a></li>
          <li><a href="#up_2">+2 <em>D</em></a></li>
          <li><a href="#up_3">+3 <em>D#</em></a></li>
          <li><a href="#up_4">+4 <em>E</em></a></li>
          <li><a href="#up_5">+5 <em>F</em></a></li>
          <li><a href="#up_6">+6 <em>F#</em></a></li>
        </ul>
      </dd>
      <dt><label for="tuningPicker"><span>Standard ukulele tuning</span> <em>&#9658;</em></label></dt>
      <dd id="tuningPicker" data-action="tuning">
        <ul class="pseudoSelect">
          <li class="checked"><a href="#soprano">GCEA Standard</a></li>
          <li><a href="#baritone">DGBE Baritone</a></li>
          <li><a href="#alternate">ADF#B Alternate</a></li>
        </ul>
      </dd>
    </dl>
  </fieldset>
</aside>
<!-- OTHER OPTIONS -->
<aside class="arrowBox otherOptions" id="optionsDlg">
  <fieldset class="arrowBoxContent">
    <dl class="enablePseudoSelects">
      <dt><label for="pagePicker"><span>Paper</span> <em>&#9658;</em></label></dt>
      <dd id="pagePicker" data-action="paper">
        <ul class="pseudoSelect" id="pageWidth">
          <li class="checked"><a href="#letter">US Letter (8.5 x 11 in)</a></li>
          <li><a href="#a4">A4 (21 x 29.7 cm)</a></li>
          <li><a href="#screen">full screen</a></li>
        </ul>
      </dd>
    </dl>
  </fieldset>
  <fieldset class="arrowBoxContent">
    <p class="checkboxBlock">
      <input type="checkbox" value="true" id="chkEnclosures" checked="checked" />
      <label for="chkEnclosures">Hide chord enclosures
        <span class="checkBoxFinePrint">don't put [brackets] around chord names</span>
      </label>
    </p>
    <p class="checkboxBlock">
      <input type="checkbox" value="true" id="chkSortAlpha" checked="checked" />
      <label for="chkSortAlpha">Sort reference diagrams alphabetically
        <span class="checkBoxFinePrint">otherwise &ldquo;song order&rdquo; is used</span>
      </label>
    </p>
    <p class="checkboxBlock">
      <input type="checkbox" value="true" id="chkIgnoreCommon" checked="checked" />
      <label for="chkIgnoreCommon">Ignore common chords
        <span class="checkBoxFinePrint">don't create master chord diagrams for these chords:</span>
      </label>
      <input type="text" id="commonChordList" value="" />
    </p>
  </fieldset>
</aside>
<!-- HELP (DIALOG) -->
<aside class="arrowBox helpOptions" id="helpDlg">
  <fieldset class="arrowBoxContent linksList">
    <ul>
      <li><a href="http://blog.ukegeeks.org/users-guide/" target="_blank" rel="noopener" title="View the complete documentation including ChordPro tips">User Guide</a></li>
      <li><a href="http://ukegeeks.org/tools/chord-finder.htm" target="_blank" rel="noopener" title="Access the UkeGeeks library of common chords">Chord Finder</a></li>
      <li><a href="http://ukegeeks.org/tools/reverse-chord-finder.htm" target="_blank" rel="noopener" title="Find chord names by drawing the diagram">Reverse Chord Lookup</a></li>
    </ul>
  </fieldset>
</aside>

<!-- REFORMAT (DIALOG) -->
<section id="reformatDlg" class="reformatDlg overlay isHidden">
  <hgroup>
    <h3>Use Auto-Formated Version?</h3>
  </hgroup>
  <div>
    <p class="instructions">Whoa! I didn't find any chords in your song -- it's probably not in ChordPro format. Here's the converted version&hellip;</p>
    <p class="btnBar">
      <input type="button" id="reformatYesBtn" class="baseBtn blueBtn" value="OK, Use This!" />
      <a id="reformatNoBtn" href="#noThanks" class="noThanks">No, Thanks!</a>
    </p>
    <textarea id="reformatSource" wrap="off"></textarea>
    <p class="instructions small">Want to make more adjustments? Click &ldquo;No Thanks&rdquo; and try the <a href="http://ukegeeks.org/tools" target="_blank" rel="noopener" title="open the reformat tool in a new window">Reformater Tool</a> instead.</p>
    <p class="instructions small"><input type="checkbox" value="true" id="reformatDisable" /> <label for="reformatDisable">Don't perform this check again.</label></p>
  </div>
</section>

<!-- CHORD BUILDER (DIALOG) -->
<section id="cdBldDlg" class="overlay chordBuilderDlg isHidden chordBuilderNarrow">
  <hgroup>
    <h3>Chord Builder</h3>
  </hgroup>
  <div>
    <a title="close this" href="#close" class="closeBtn">Close</a>
    <div id="cdBldChooserPanel">
      <ul id="cdBldPick" class="ugsChordChooser"></ul>
    </div>
    <div id="cdBldBuilderPanel" style="display:none">
      <p class="">
        <label for="cdBldChordName">Chord Name: <input class="chordName" type="text" id="cdBldChordName" value="CHORDNAME" /></label>
      </p>
      <div class="editorSurface" id="cdBldEditorSurface">
        <div class="toolboxEdgeShadow leftEdge"></div>
        <div id="cdBldToolbox" class="chordToolbox leftEdge">
          <div class="chordToolboxInner">
            <a href="#dots" id="cdBldDotsBtn" class="toolChip selected">Add Dots <span class="bigDot"></span></a>
            <a href="#fingers" id="cdBldFingersBtn" class="toolChip">Set Fingers <span id="cdBldBtnDiagram" class="fingerToolImage finger1"><span class="fingerDot"></span></span><span id="cdBldBtnFingerName"></span></a>
          </div>
        </div>
        <div class="toolboxEdgeShadow rightEdge"></div>
        <div class="chordToolbox rightEdge">
          <div class="chordToolboxInner">
            <label for="cdBldStartingFret" class="toolChip">Starting Fret
              <select id="cdBldStartingFret"></select>
            </label>
            <a href="#slide-up" id="toolboxSlideUpBtn" class="toolChip arrowUp" data-direction="up" title="move all dots -1 fret">Slide Up</a>
            <a href="#slide-down" id="toolboxSlideDownBtn" class="toolChip arrowDown" data-direction="down" title="move all dots +1 fret">Slide Down</a>
          </div>
        </div>
        <canvas id="cdBldCursorCanvas" width="462" height="300"></canvas>
        <canvas id="cdBldDiagramCanvas" width="462" height="300"></canvas>
      </div>

      <p class="">
        <label for="cdBldShowOutputBtn"><input id="cdBldShowOutputBtn" type="checkbox" value="0" /> Show ChordPro output</label>
      </p>
      <p class="btnBar">
        <input type="button" value="Add" class="baseBtn blueBtn" id="cdBldSaveBtn">
        <a href="#closeBuilder" id="cdBldCancelBtn" class="noThanks">Cancel</a>
      </p>
      <div id="cdBldOutputBox" class="outputBox collapseOutput" style="clear:right;">
        <pre id="cdBldOutput" class="chordPro-statement" title="Your ChordPro define tag"></pre>
      </div>
    </div>
  </div>
</section>

<!-- SCRIPTS -->
<script src="${m.base}js/ukeGeeks.scriptasaurus.min.js"></script>
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
<section class="overlay">
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
      <li class="btnBar">
        <input type="submit" value="Login" name="loginBtn" class="baseBtn blueBtn" />
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
