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
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/editorv2/ugsEditorPlus.legacyIe.css" />
<![endif]-->
<link href='http://fonts.googleapis.com/css?family=Peralta' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/yuiReset.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/basic-page-layout.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.music.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/editor/ugsEditorPlus.css" title="ugsEditorCss" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/editor/ugsEditorPlus.print.css" media="print" />
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
		<p>Note: Standard <strong>GCEA</strong> Soprano Ukulele Tuning. <small>Powered by <a href="http://ukegeeks.com/" title="Uke Geeks for free ukulele JavaScript tools">UkeGeeks' Scriptasaurus</a> &bull; ukegeeks.com</small></p>
	</footer>
</section>
<!-- EDIT SONG (DIALOG) -->
<section id="songSourceDlg" class="overlay <?php echo($editDlgCssClassName); ?>">
	<hgroup>
		<h3>Edit Song</h3>
	</hgroup>
	<div>
		<a title="close this" href="#close" class="closeBtn">Close</a>
		<a title="resize this" href="#resize" class="resizeBtn">Resize</a>
		<p class="btnBar">
			<span id="messageBox" class="updateMessage">
				<em>
					<img src="/img/ugs/busy.gif" id="loadingSpinner" style="display:none;" />
					<span id="sourceFeedback"></span>
				</em>
			</span>
			<input type="button" id="updateBtn" class="baseBtn blueBtn" value="Update" title="Rebuild digarams and music" />
			<?php if ($model->IsUpdateAllowed) {
				?>
				<input type="button" id="saveBtn" class="baseBtn orange" value="Save" title="Save" style="margin-right:1.6em;" />
				<?php
			}
			?>
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
				<ul class="pseudoSelect">
					<li class="checked"><a href="#normal">Normal (white paper)</a></li>
					<li><a href="#reversed">Reversed for projectors</a></li>
				</ul>
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
			<li><a href="http://ukegeeks.com/users-guide.htm" target="_blank" title="View the complete documentation including ChordPro tips">User Guide</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#how_do_i_markup" target="_blank">How do I &quot;mark-up&quot; my music?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#chordNames" target="_blank">How do I name chords?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#chordpro_markup_reference" target="_blank">ChordPro markup reference</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#saveBtn" target="_blank">Where's the &quot;Save&quot; button?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#defined_chords" target="_blank">What chords are already defined?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#more_chord_definitions" target="_blank">How can I use an alternate chord fingering?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#muted_strings" target="_blank">How can I indicate muted strings?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#barre_chords" target="_blank">How can I make a barre chord?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#formatter" target="_blank">What if my song has the chords above the lyrics?</a></li>
		</ul>
	</fieldset>
</aside>

<!-- REFORMAT (DIALOG) -->
<section id="reformatDlg" class="reformatDlg overlay isHidden">
	<hgroup>
		<h3>Use Auto-Formated Version?</h3>
	</hgroup>
	<div>
		<a title="resize this" href="#resize" class="resizeBtn">Resize</a>
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

<!-- SCRIPTS -->
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery.draggable.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ukeGeeks.scriptasaurus.merged.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.merged.js"></script>
<script type="text/javascript">
if (isLegacyIe){
	window.attachEvent('onload', ugsEditorPlus.attachIe);
}
else{
	window.onload = ugsEditorPlus.attach;
}
</script>
<?php if ($model->IsUpdateAllowed) {
	?>
	<script type="text/javascript">
	ugsEditorPlus.updateSong.init("<?php echo($model->UpdateAjaxUri); ?>", "<?php echo($model->Id); ?>");
	</script>
	<?php
	}
?>
</body>
</html>