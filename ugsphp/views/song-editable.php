<?php

function GetDisplayStyle($value){
	return (strlen($value) > 0) ? 'block' : 'none';
}

$editDlgCssClassName = $model->IsUpdateAllowed ? '' : 'ugsEditor-isHidden';

?>
<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo(h($model->PageTitle)); ?></title>
<script type="text/javascript">var isLegacyIe = false;</script>
<!--[if lt IE 9]>
<script type="text/javascript">isLegacyIe = true;document.getElementsByTagName('html')[0].className='legacyIe';</script>
<script type="text/javascript" src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.legacyIe.css" />
<![endif]-->
<link href='//fonts.googleapis.com/css?family=Peralta|Smokum|Cherry+Cream+Soda|Ranchers|Creepster|Lobster|Permanent+Marker|Architects+Daughter|Bree+Serif' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/yuiReset.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/basic-page-layout.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.music.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.min.css" title="ugsEditorCss" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.print.css" media="print" />
</head>
<body class="editableSongPage pageWidth_screen">
<section id="scalablePrintArea" class="scalablePrintArea">
	<header class="ugs-songInfo">
		<h1 id="songTitle" class="ugs-songTitle"><?php echo(h($model->SongTitle)); ?></h1>
		<h2 id="songSubtitle" class="ugs-songSubtitle" style="display:<?php echo(GetDisplayStyle($model->Subtitle)); ?>;"><?php echo(h($model->Subtitle)); ?></h2>
		<h2 id="songArtist" class="ugs-songArtist" style="display:<?php echo(GetDisplayStyle($model->Artist)); ?>;"><?php echo(h($model->Artist)); ?></h2>
		<h2 id="songAlbum" class="ugs-songAlbum" style="display:<?php echo(GetDisplayStyle($model->Album)); ?>;"><?php echo(h($model->Album)); ?></h2>
	</header>
	<div class="metaInfo" id="songMeta"> </div>
	<article id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
		<aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
		<article id="ukeSongText" class="ugs-source-wrap">
			<pre><?php echo(h($model->Body)); ?></pre>
		</article>
	</article>
	<footer>
		<p>Note: <span id="footTuningInfo"><strong>GCEA</strong> Standard Ukulele</span> Tuning. <small>Powered by <a href="http://ukegeeks.org/" title="Uke Geeks for free ukulele JavaScript tools">UkeGeeks' Scriptasaurus</a> &bull; ukegeeks.org</small></p>
	</footer>
</section>
<!-- EDIT SONG (DIALOG) -->
<section id="songSourceDlg" class="ugsEditor-overlay <?php echo($editDlgCssClassName); ?>">
	<header class="ugsEditor-overlayHeader">
		<h3>Edit Song</h3>
	</header>
	<div>
		<button type="button" title="close this" class="ugsEditor-closeBtn">Close</button>
		<button type="button" title="switch to fullscreen editor" class="ugsEditor-resizeBtn">Fullscreen</button>
		<p class="ugsEditor-btnBar">
			<span id="messageBox" class="ugsEditor-updateMessage">
				<em>
					<img src="<?php echo($model->StaticsPrefix); ?>img/editor/busy.gif" id="loadingSpinner" style="display:none;" alt="" />
					<span id="sourceFeedback"></span>
				</em>
			</span>
			<input type="button" id="updateBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="Update" title="Rebuild digarams and music" />
			<?php if ($model->IsUpdateAllowed) { ?><input type="button" id="saveBtn" class="ugsEditor-baseBtn ugsEditor-orange" value="Save" title="Save" style="margin-right:1.6em;" /><?php } ?>
			<button type="button" id="cdBldOpenBtn" data-dialog="cdBldDlg" class="ugsEditor-alternateBtn" title="Add custom &amp; alternate chord diagrams">Chord Builder</button>
		</p>
		<textarea id="chordProSource" wrap="off"><?php echo(hText($model->Body)); ?></textarea>
	</div>
</section>
<!-- APP TOOLBAR -->
<section id="ugsAppToolbar" class="ugsAppMenuBar">
	<ul>
		<li class="ugsEditor-navEdit" data-dialog="songSourceDlg"> <button type="button" title="View &amp; edit the song source"><span></span>Edit</button> </li>
		<li class="ugsEditor-navLayout ugsEditor-showOptionsBox"> <button type="button" data-target="layoutOptions" title="Resize fonts &amp; chord diagrams. Customize layout &amp; colors."><span></span>Appearance</button> </li>
		<li class="ugsEditor-navInstruments ugsEditor-showOptionsBox"> <button type="button" data-target="tuningOptions" title="Transpose song's key &amp; choose your prefered ukulele tuning"><span></span>Transpose</button> </li>
		<li class="ugsEditor-navOptions ugsEditor-showOptionsBox"> <button type="button" data-target="optionsDlg" title="Advanced options &amp; settings"><span></span>Options</button> </li>
		<li class="ugsEditor-showDlgBtn ugsEditor-showOptionsBox"> <button type="button" data-target="helpDlg" title="Help &amp; Quick tips on formatting your song">?</button> </li>
	</ul>
	<h2 class="ugsLogo">Uke Geeks Song-a-Matic</h2>
</section>
<!-- LAYOUT OPTIONS -->
<aside class="ugsEditor-arrowBox ugsEditor-layoutOptions" id="layoutOptions">
	<fieldset class="ugsEditor-arrowBoxContent ugsEditor-enablePseudoSelects">
		<dl>
			<dt><label for="fontSizePicker"><span>Font size 12pt</span> <em>&#9658;</em></label></dt>
			<dd id="fontSizePicker" data-action="zoomFonts">
				<ul class="ugsEditor-pseudoSelect">
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
					<li class="ugsEditor-checked"><a href="#12">12 pt </a></li>
					<li><a href="#13">13 pt </a></li>
					<li><a href="#14">14 pt </a></li>
				</ul>
			</dd>
			<dt><label for="diagramSizePicker"><span>Stupid Large diagrams</span> <em>&#9658;</em></label></dt>
			<dd id="diagramSizePicker" data-action="zoomDiagrams">
				<ul class="ugsEditor-pseudoSelect">
					<li><a href="#40">Tiny </a></li>
					<li><a href="#65">Small </a></li>
					<li><a href="#80">Medium </a></li>
					<li><a href="#90">Large </a></li>
					<li class="ugsEditor-checked"><a href="#100">Stupid Large </a></li>
				</ul>
			</dd>
			<dt><label for="diagramPositionPicker"><span>Reference diagrams on left</span> <em>&#9658;</em></label></dt>
			<dd id="diagramPositionPicker" data-action="layout">
				<ul class="ugsEditor-pseudoSelect">
					<li class="ugsEditor-checked"><a href="#left">On left side</a></li>
					<li><a href="#top">At the top</a></li>
					<li><a href="#none">Don't show</a></li>
				</ul>
			</dd>
			<dt><label for="lyricChordsPicker"><span>Chord names above lyrics</span> <em>&#9658;</em></label></dt>
			<dd id="lyricChordsPicker" data-action="placement">
				<ul class="ugsEditor-pseudoSelect">
					<li><a href="#inline">Chord names inline </a></li>
					<li class="ugsEditor-checked"><a href="#above">Chord names above </a></li>
					<li><a href="#miniDiagrams">Names &amp; diagrams above </a></li>
				</ul>
			</dd>
			<dt><label for="colorPicker"><span>Normal colors (white paper) </span><em>&#9658;</em></label></dt>
			<dd id="colorPicker" data-action="colors">
				<ul class="ugsEditor-pseudoSelect"></ul>
			</dd>
		</dl>
	</fieldset>
</aside>
<!-- TUNING OPTIONS -->
<aside class="ugsEditor-arrowBox ugsEditor-tuningOptions" id="tuningOptions">
	<fieldset class="ugsEditor-arrowBoxContent ugsEditor-enablePseudoSelects">
		<dl>
			<dt><label for="transposePicker"><span>Original key</span> <em>&#9658;</em></label></dt>
			<dd id="transposePicker" data-action="transpose">
				<ul class="ugsEditor-pseudoSelect" id="transposeOptions">
					<li><a href="#down_6">-6 <em>F#</em></a></li>
					<li><a href="#down_5">-5 <em>G</em></a></li>
					<li><a href="#down_4">-4 <em>G#</em></a></li>
					<li><a href="#down_3">-3 <em>A</em></a></li>
					<li><a href="#down_2">-2 <em>A#</em></a></li>
					<li><a href="#down_1">-1 <em>B</em></a></li>
					<li class="ugsEditor-checked"><a href="#up_0">Original <em>C</em></a></li>
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
				<ul class="ugsEditor-pseudoSelect">
					<li class="ugsEditor-checked"><a href="#soprano">GCEA Standard</a></li>
					<li><a href="#baritone">DGBE Baritone</a></li>
					<li><a href="#alternate">ADF#B Alternate</a></li>
				</ul>
			</dd>
		</dl>
	</fieldset>
</aside>
<!-- OTHER OPTIONS -->
<aside class="ugsEditor-arrowBox ugsEditor-otherOptions" id="optionsDlg">
	<fieldset class="ugsEditor-arrowBoxContent">
		<dl class="ugsEditor-enablePseudoSelects">
			<dt><label for="pagePicker"><span>Paper</span> <em>&#9658;</em></label></dt>
			<dd id="pagePicker" data-action="paper">
				<ul class="ugsEditor-pseudoSelect" id="pageWidth">
					<li class="ugsEditor-checked"><a href="#letter">US Letter (8.5 x 11 in)</a></li>
					<li><a href="#a4">A4 (21 x 29.7 cm)</a></li>
					<li><a href="#screen">full screen</a></li>
				</ul>
			</dd>
		</dl>
	</fieldset>
	<fieldset class="ugsEditor-arrowBoxContent">
		<p class="ugsEditor-checkboxBlock">
			<input type="checkbox" value="true" id="chkEnclosures" checked="checked" />
			<label for="chkEnclosures">Hide chord enclosures
				<span class="ugsEditor-checkBoxFinePrint">don't put [brackets] around chord names</span>
			</label>
		</p>
		<p class="ugsEditor-checkboxBlock">
			<input type="checkbox" value="true" id="chkSortAlpha" checked="checked" />
			<label for="chkSortAlpha">Sort reference diagrams alphabetically
				<span class="ugsEditor-checkBoxFinePrint">otherwise &ldquo;song order&rdquo; is used</span>
			</label>
		</p>
		<p class="ugsEditor-checkboxBlock">
			<input type="checkbox" value="true" id="chkIgnoreCommon" checked="checked" />
			<label for="chkIgnoreCommon">Ignore common chords
				<span class="ugsEditor-checkBoxFinePrint">don't create master chord diagrams for these chords:</span>
			</label>
			<input type="text" id="commonChordList" value="" />
		</p>
	</fieldset>
</aside>
<!-- HELP (DIALOG) -->
<aside class="ugsEditor-arrowBox ugsEditor-helpOptions" id="helpDlg">
	<fieldset class="ugsEditor-arrowBoxContent ugsEditor-linksList">
		<ul>
			<li><a href="http://blog.ukegeeks.org/users-guide/" target="_blank" rel="noopener" title="View the complete documentation including ChordPro tips">User Guide</a></li>
			<li><a href="http://ukegeeks.org/tools/chord-finder.htm" target="_blank" rel="noopener" title="Access the UkeGeeks library of common chords">Chord Finder</a></li>
			<li><a href="http://ukegeeks.org/tools/reverse-chord-finder.htm" target="_blank" rel="noopener" title="Find chord names by drawing the diagram">Reverse Chord Lookup</a></li>
		</ul>
	</fieldset>
</aside>

<!-- REFORMAT (DIALOG) -->
<section id="reformatDlg" class="ugsEditor-reformatDlg ugsEditor-overlay ugsEditor-isHidden">
	<header class="ugsEditor-overlayHeader">
		<h3>Use Auto-Formated Version?</h3>
	</header>
	<div>
		<p class="ugsEditor-instructions">Whoa! I didn't find any chords in your song -- it's probably not in ChordPro format. Here's the converted version&hellip;</p>
		<p class="ugsEditor-btnBar">
			<input type="button" id="reformatYesBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="OK, Use This!" />
			<button type="button" id="reformatNoBtn" class="ugsEditor-noThanks">No, Thanks!</button>
		</p>
		<textarea id="reformatSource" wrap="off"></textarea>
		<p class="ugsEditor-instructions ugsEditor-small">Want to make more adjustments? Click &ldquo;No Thanks&rdquo; and try the <a href="http://ukegeeks.org/tools" target="_blank" rel="noopener" title="open the reformat tool in a new window">Reformater Tool</a> instead.</p>
		<p class="ugsEditor-instructions ugsEditor-small"><input type="checkbox" value="true" id="reformatDisable" /> <label for="reformatDisable">Don't perform this check again.</label></p>
	</div>
</section>

<!-- CHORD BUILDER (DIALOG) -->
<section id="cdBldDlg" class="ugsEditor-overlay ugsEditor-chordBuilderDlg ugsEditor-isHidden ugsEditor-chordBuilderNarrow">
	<header class="ugsEditor-overlayHeader">
		<h3>Chord Builder</h3>
	</header>
	<div>
		<button type="button" title="close this" class="ugsEditor-closeBtn">Close</button>
		<div id="cdBldChooserPanel">
			<ul id="cdBldPick" class="ugsChordChooser"></ul>
		</div>
		<div id="cdBldBuilderPanel" style="display:none">
			<p class="">
				<label for="cdBldChordName">Chord Name: <input class="ugsEditor-chordName" type="text" id="cdBldChordName" value="CHORDNAME" /></label>
			</p>
			<div class="ugsEditor-editorSurface" id="cdBldEditorSurface">
				<div class="ugsEditor-toolboxEdgeShadow ugsEditor-leftEdge"></div>
				<div id="cdBldToolbox" class="ugsEditor-chordToolbox ugsEditor-leftEdge">
					<div class="ugsEditor-chordToolboxInner">
						<button type="button" id="cdBldDotsBtn" class="ugsEditor-toolChip ugsEditor-selected" data-tool="dots">Add Dots <span class="ugsEditor-bigDot"></span></button>
						<button type="button" id="cdBldFingersBtn" class="ugsEditor-toolChip" data-tool="fingers">Set Fingers <span id="cdBldBtnDiagram" class="ugsEditor-fingerToolImage ugsEditor-finger1"><span class="ugsEditor-fingerDot"></span></span><span id="cdBldBtnFingerName"></span></button>
					</div>
				</div>
				<div class="ugsEditor-toolboxEdgeShadow ugsEditor-rightEdge"></div>
				<div class="ugsEditor-chordToolbox ugsEditor-rightEdge">
					<div class="ugsEditor-chordToolboxInner">
						<label for="cdBldStartingFret" class="ugsEditor-toolChip">Starting Fret
							<select id="cdBldStartingFret"></select>
						</label>
						<button type="button" id="toolboxSlideUpBtn" class="ugsEditor-toolChip ugsEditor-arrowUp" data-direction="up" title="move all dots -1 fret">Slide Up</button>
						<button type="button" id="toolboxSlideDownBtn" class="ugsEditor-toolChip ugsEditor-arrowDown" data-direction="down" title="move all dots +1 fret">Slide Down</button>
					</div>
				</div>
				<canvas id="cdBldCursorCanvas" width="462" height="300"></canvas>
				<canvas id="cdBldDiagramCanvas" width="462" height="300"></canvas>
			</div>

			<p class="">
				<label for="cdBldShowOutputBtn"><input id="cdBldShowOutputBtn" type="checkbox" value="0" /> Show ChordPro output</label>
			</p>
			<p class="ugsEditor-btnBar">
				<input type="button" value="Add" class="ugsEditor-baseBtn ugsEditor-blueBtn" id="cdBldSaveBtn">
				<button type="button" id="cdBldCancelBtn" class="ugsEditor-noThanks">Cancel</button>
			</p>
			<div id="cdBldOutputBox" class="ugsEditor-outputBox ugsEditor-collapseOutput" style="clear:right;">
				<pre id="cdBldOutput" class="chordPro-statement" title="Your ChordPro define tag"></pre>
			</div>
		</div>
	</div>
</section>

<!-- SCRIPTS -->

<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/song-formatter.bundle.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.min.js"></script>
<script type="text/javascript">
var ugs_settings = <?php echo($model->EditorSettingsJson); ?>;
if (ugs_settings && ugs_settings.invalidJson){
	alert(ugs_settings.invalidJson);
	ugs_settings = {};
}
</script>
<script type="text/javascript">
(function() {
	// scripts are at the end of <body>, so the page is ready
	var ugs_settings = window.ugs_settings || {};
	ugs_settings.useLegacyIe = isLegacyIe;
	ugsEditorPlus.songAmatic.init(ugs_settings);

<?php if ($model->IsUpdateAllowed) {
	?>
	ugsEditorPlus.updateSong.init(<?php echo(js($model->UpdateAjaxUri)); ?>, <?php echo(js($model->Id)); ?>);
	<?php
	}
?>
}());
</script>
</body>
</html>
