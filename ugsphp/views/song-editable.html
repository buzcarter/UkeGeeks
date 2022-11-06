<?php

function GetDisplayStyle($value){
	return (strlen($value) > 0) ? 'block' : 'none';
}

$editDlgCssClassName = $model->IsUpdateAllowed ? '' : 'isHidden';

?>
<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo($model->PageTitle); ?></title>
<script type="text/javascript">var isLegacyIe = false;</script>
<!--[if lt IE 9]>
<script type="text/javascript">isLegacyIe = true;document.getElementsByTagName('html')[0].className='legacyIe';</script>
<script type="text/javascript" src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<script type="text/javascript" src="//explorercanvas.googlecode.com/svn/trunk/excanvas.js"></script>
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.legacyIe.css" />
<![endif]-->
<link href='http://fonts.googleapis.com/css?family=Peralta|Smokum|Cherry+Cream+Soda|Ranchers|Creepster|Lobster|Permanent+Marker|Architects+Daughter|Bree+Serif' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/yuiReset.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/basic-page-layout.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.music.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.min.css" title="ugsEditorCss" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.print.css" media="print" />
</head>
<body class="editableSongPage pageWidth_screen">
<section id="scalablePrintArea" class="scalablePrintArea">
	<header>
		<hgroup class="ugs-songInfo">
			<h1 id="songTitle" class="ugs-songTitle"><?php echo($model->SongTitle); ?></h1>
			<h2 id="songSubtitle" class="ugs-songSubtitle" style="display:<?php echo(GetDisplayStyle($model->Subtitle)); ?>;"><?php echo($model->Subtitle); ?></h2>
			<h2 id="songArtist" class="ugs-songArtist" style="display:<?php echo(GetDisplayStyle($model->Artist)); ?>;"><?php echo($model->Artist); ?></h2>
			<h2 id="songAlbum" class="ugs-songAlbum" style="display:<?php echo(GetDisplayStyle($model->Album)); ?>;"><?php echo($model->Album); ?></h2>
		</hgroup>
	</header>
	<div class="metaInfo" id="songMeta"> </div>
	<article id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
		<aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
		<article id="ukeSongText" class="ugs-source-wrap">
			<pre><?php echo($model->Body); ?></pre>
		</article>
	</article>
	<footer>
		<p>Note: <span id="footTuningInfo">Standard <strong>GCEA</strong> Soprano Ukulele</span> Tuning. <small>Powered by <a href="http://ukegeeks.com/" title="Uke Geeks for free ukulele JavaScript tools">UkeGeeks' Scriptasaurus</a> &bull; ukegeeks.com</small></p>
	</footer>
</section>
<!-- EDIT SONG (DIALOG) -->
<section id="songSourceDlg" class="overlay <?php echo($editDlgCssClassName); ?>">
	<hgroup>
		<h3>Edit Song</h3>
	</hgroup>
	<div>
		<a title="close this" href="#close" class="closeBtn">Close</a>
		<a title="switch to fullscreen editor" href="#resize" class="resizeBtn">Fullscreen</a>
		<p class="btnBar">
			<span id="messageBox" class="updateMessage">
				<em>
					<img src="<?php echo($model->StaticsPrefix); ?>img/editor/busy.gif" id="loadingSpinner" style="display:none;" />
					<span id="sourceFeedback"></span>
				</em>
			</span>
			<input type="button" id="updateBtn" class="baseBtn blueBtn" value="Update" title="Rebuild digarams and music" />
			<?php if ($model->IsUpdateAllowed) { ?>
				<input type="button" id="saveBtn" class="baseBtn orange" value="Save" title="Save" style="margin-right:1.6em;" />
			<?php } ?>
			<a href="#chordBuilder" id="cdBldOpenBtn" data-dialog="cdBldDlg" class="alternateBtn" title="Add custom &amp; alternate chord diagrams">Chord Builder</a>
		</p>
		<textarea id="chordProSource" wrap="off"><?php echo($model->Body); ?></textarea>
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
			<dt><label for="tuningPicker"><span>Soprano ukulele tuning</span> <em>&#9658;</em></label></dt>
			<dd id="tuningPicker" data-action="tuning">
				<ul class="pseudoSelect">
					<li class="checked"><a href="#soprano">Soprano</a></li>
					<li><a href="#baritone">Baritone</a></li>
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
			<li><a href="http://blog.ukegeeks.com/users-guide/" target="_blank" title="View the complete documentation including ChordPro tips">User Guide</a></li>
			<li><a href="http://ukegeeks.com/tools/chord-finder.htm" target="_blank" title="Access the UkeGeeks library of common chords">Chord Finder</a></li>
			<li><a href="http://ukegeeks.com/tools/reverse-chord-finder.htm" target="_blank" title="Find chord names by drawing the diagram">Reverse Chord Lookup</a></li>
		</ul>
	</fieldset>
</aside>

<!-- REFORMAT (DIALOG) -->
<section id="reformatDlg" class="reformatDlg overlay isHidden">
	<hgroup>
		<h3>Use Auto-Formated Version?</h3>
	</hgroup>
	<div>
		<!-- <a title="resize this" href="#resize" class="resizeBtn">Resize</a> -->
		<p class="instructions">Whoa! I didn't find any chords in your song -- it's probably not in ChordPro format. Here's the converted version&hellip;</p>
		<p class="btnBar">
			<input type="button" id="reformatYesBtn" class="baseBtn blueBtn" value="OK, Use This!" />
			<a id="reformatNoBtn" href="#noThanks" class="noThanks">No, Thanks!</a>
		</p>
		<textarea id="reformatSource" wrap="off"></textarea>
		<p class="instructions small">Want to make more adjustments? Click &ldquo;No Thanks&rdquo; and try the <a href="http://ukegeeks.com/tools" target="_blank" title="open the reformat tool in a new window">Reformater Tool</a> instead.</p>
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
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery.draggable.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ukeGeeks.scriptasaurus.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.min.js"></script>
<script type="text/javascript">
var ugs_settings = <?php echo($model->EditorSettingsJson); ?>;
if (ugs_settings && ugs_settings.invalidJson){
	alert(ugs_settings.invalidJson);
	ugs_settings = {};
}
</script>
<script type="text/javascript">
$(function() {
	var ugs_settings = window.ugs_settings || {};
	ugs_settings.useLegacyIe = isLegacyIe;
	ugsEditorPlus.songAmatic.init(ugs_settings);

<?php if ($model->IsUpdateAllowed) {
	?>
	ugsEditorPlus.updateSong.init("<?php echo($model->UpdateAjaxUri); ?>", "<?php echo($model->Id); ?>");
	<?php
	}
?>
});
</script>
</body>
</html>