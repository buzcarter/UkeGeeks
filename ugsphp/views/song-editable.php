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
<link rel="stylesheet" href="/css/editorv2/ugsEditorPlus.legacyIe.css" />
<![endif]-->
<link href='http://fonts.googleapis.com/css?family=Peralta' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="/css/yuiReset.css" />
<link rel="stylesheet" href="/css/basic-page-layout.css" />
<link rel="stylesheet" href="/css/ukeGeeks.music.css" />
<link rel="stylesheet" href="/css/editorv2/ugsEditorPlus.css" title="ugsEditorCss" />
<link rel="stylesheet" href="/css/editorv2/ugsEditorPlus.print.css" media="print" />
</head>
<body class="editableSongPage pageWidth_screen">
<section id="scalablePrintArea" class="scalablePrintArea">
	<header>
		<hgroup>
			<h1 id="songTitle"><?php echo($model->SongTitle); ?></h1>
			<h2 id="songSubtitle" style="display:<?php echo(GetDisplayStyle($model->Subtitle)); ?>;"><?php echo($model->Subtitle); ?></h2>
			<h2 id="songArtist" style="display:<?php echo(GetDisplayStyle($model->Artist)); ?>;"><?php echo($model->Artist); ?></h2>
			<h2 id="songAlbum" style="display:<?php echo(GetDisplayStyle($model->Album)); ?>;"><?php echo($model->Album); ?></h2>
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
<section id="songSourceDlg" class="overlay <?php echo($editDlgCssClassName); ?>">
	<hgroup>
		<h3>Song Source</h3>
	</hgroup>
	<div> <a title="close this" href="#close" id="hideSourceBtn" class="closeBtn">Close</a>
		<p class="btnBar">
			<span id="sourceFeedback"></span>
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
<section id="helpDlg" class="helpDlg overlay isHidden">
	<hgroup>
		<h3>Help</h3>
	</hgroup>
	<div class="normalHtml"> <a title="close this" href="#close" id="hideHelpBtn" class="closeBtn">Close</a>
		<p><a href="http://ukegeeks.com/users-guide.htm" target="_blank" title="View the complete documentation including ChordPro tips">User Guide</a> topics:</p>
		<ul>
			<li><a href="http://ukegeeks.com/users-guide.htm#how_do_i_markup" target="_blank">How Do I &quot;Mark-Up&quot; My Music?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#chordNames" target="_blank">How Do I Name Chords?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#chordpro_markup_reference" target="_blank">ChordPro Markup Reference</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#more_chord_definitions" target="_blank">Defining Alternate Chords</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#saveBtn" target="_blank">Where's the &quot;Save&quot; Button?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#defined_chords" target="_blank">What Chords Are Already Defined?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#more_chord_definitions" target="_blank">How Can I Use An Alternate Chord Fingering?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#muted_strings" target="_blank">How Can I Indicate Muted Strings?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#barre_chords" target="_blank">How Can I Make a Barre Chord?</a></li>
			<li><a href="http://ukegeeks.com/users-guide.htm#formatter" target="_blank">What If My Song Has The Chords Above The Lyrics?</a></li>
		</ul>
		<p>Updates coming shortly <strong style="font-weight: bold; color: #03C;">:D</strong></p>
	</div>
</section>
<section id="ugsAppToolbar" class="ugsAppMenuBar">
	<ul>
		<li class="navEdit" id="showSourceBtn"> <a href="#songSourceDlg" title="edit/view song source"><span></span>Edit</a> </li>
		<li class="navZoom" id="zoomBtn"> <a href="#zoom" title="Resize to better fit on your printed page"><span></span>Zoom</a>
			<ul class="subMenu" id="printScale">
			</ul>
		</li>
		<li class="navLayout"> <a href="#layout" title="Choose where big chord diagrams appear"><span></span>Layout</a>
			<ul class="subMenu">
				<li><a href="#top" title="Diagrams at top">Top</a></li>
				<li class="checked"><a href="#left" title="Diagrams on left side">Left</a></li>
				<li><a href="#none" title="Don't show any chord diagrams">None</a></li>
			</ul>
		</li>
		<li class="navDiagrams"> <a href="#placement" title="Choose how chords appear within the lyrics"><span></span>Chords</a>
			<ul class="subMenu">
				<li class="checked"><a href="#above">Names above</a></li>
				<li><a href="#inline">Names inline</a></li>
				<li><a href="#miniDiagrams">Diagrams above</a></li>
			</ul>
		</li>
		<li class="navInstruments"> <a href="#tuning" title="Choose your prefered ukulele tuning"><span></span>Tuning</a>
			<ul class="subMenu">
				<li class="checked"><a href="#soprano">Soprano</a></li>
				<li><a href="#baritone">Baritone</a></li>
			</ul>
		</li>
		<li class="navTranspose"> <a href="#transpose" title="Shift chords up/down by semitone steps"><span></span>Transpose</a>
			<ul class="subMenu" id="transposeOptions">
				<li><a href="#down_6">-6 <em></em></a></li>
				<li><a href="#down_5">-5 <em></em></a></li>
				<li><a href="#down_4">-4 <em></em></a></li>
				<li><a href="#down_3">-3 <em></em></a></li>
				<li><a href="#down_2">-2 <em></em></a></li>
				<li><a href="#down_1">-1 <em></em></a></li>
				<li class="checked"><a href="#up_0">Original <em></em></a></li>
				<li><a href="#up_1">+1 <em></em></a></li>
				<li><a href="#up_2">+2 <em></em></a></li>
				<li><a href="#up_3">+3 <em></em></a></li>
				<li><a href="#up_4">+4 <em></em></a></li>
				<li><a href="#up_5">+5 <em></em></a></li>
				<li><a href="#up_6">+6 <em></em></a></li>
			</ul>
		</li>
		<li class="navColors"><a href="#colors" title="Set your color scheme for optimal reading"><span></span>Colors</a>
			<ul class="subMenu">
				<li class="checked"><a href="#normal">Normal</a></li>
				<li><a href="#reversed">Reversed</a></li>
			</ul>
		</li>
		<li class="navOptions" id="showOptionsBtn"> <a href="#optionsDlg" title="advanced options &amp; settings"><span></span>Options</a> </li>
		<li id="showHelpBtn"> <a href="#helpDlg" title="Help &amp; Quick Tips on formatting your song">?</a> </li>
	</ul>
	<h2 class="ugsLogo">Uke Geeks Song-a-Matic</h2>
</section>
<section id="optionsDlg" class="optionsDlg overlay isHidden">
	<hgroup>
		<h3>Options</h3>
	</hgroup>
	<div class=""> <a title="close this" href="#close" id="hideOptionsBtn" class="closeBtn">Close</a>
	<ul>
		<li><label for="pageWidth">Paper:</label> <select id="pageWidth"><option value="letter">US Letter (8.5 x 11 in)</option><option value="a4">A4 (21 x 29.7 cm)</option><option value="screen" selected>None/full-screen</option></select></li>
		<li><input type="checkbox" value="hideEnclosures" id="chkEnclosures" checked="checked"> <label for="chkEnclosures">Hide chord enclosures <br /><span style="font-size:.85em; padding-left: 2.5em;">don't put [ &amp; ] brackets around chord names</span></label></li>
	</ul>
	</div>
</section>
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
		<p class="instructions small">Want to make more adjustments? Click &ldquo;No Thanks&rdquo; and try the <a href="/tools" target="_blank" title="open the reformat tool in a new window">Reformater Tool</a> instead.</p>
		<p class="instructions small"><input type="checkbox" value="true" id="reformatDisable" /> <label for="reformatDisable">Don't perform this check again.</label></p>
	</div>
</section>
<script type="text/javascript" src="/js/ukeGeeks.scriptasaurus.merged.js"></script>
<script type="text/javascript" src="/js/ugsEditorPlus.merged.js"></script>
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
	<script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>
	<script type="text/javascript" src="/js/ugsEditorPlus.updateSong.js"></script>
	<script type="text/javascript">
	ugsEditorPlus.updateSong.init("<?php echo($model->UpdateAjaxUri); ?>", "<?php echo($model->Id); ?>");
	</script>
	<?php
	}
?>
</body>
</html>