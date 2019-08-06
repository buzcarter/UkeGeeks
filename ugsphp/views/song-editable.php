<?php

function GetDisplayStyle($value){
	return (strlen($value) > 0) ? 'block' : 'none';
}

$editDlgCssClassName = $model->IsUpdateAllowed ? '' : 'isHidden';
?>
<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8" />
<title><?php echo($model->PageTitle); ?> | <?php echo Config::SongbookHeadline?></title>
<link href='https://fonts.googleapis.com/css?family=Peralta|Smokum|Cherry+Cream+Soda|Ranchers|Creepster|Lobster|Permanent+Marker|Architects+Daughter|Bree+Serif' rel='stylesheet' type='text/css' />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/yuiReset.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/basic-page-layout.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.music.css" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.merged.css" title="ugsEditorCss" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.print.css" media="print" />
</head>
<body class="editableSongPage pageWidth_screen" style="display: none;">
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
    <div id="ukeChordsCanvasWrapper" class="ugs-diagrams-wrap ugs-grouped">
      <aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
    </div>
		<article id="ukeSongText" class="ugs-source-wrap">
			<pre><?php echo($model->Body); ?></pre>
		</article>
	</article>
    <?php
      if(!$model->isOK)
      {
        echo '<div style="margin-top:30px"><a href="/" class="baseBtn blueBtn">'.Lang::Get('not_found_click_here').'</div>';
      }
    ?></a>
	<footer>
    <?php //echo ($model->PoweredBy!=''?"Powered by ".$model->PoweredBy:''); ?>
	</footer>
</section>
<!-- EDIT SONG (DIALOG) -->
<section id="songSourceDlg" style="display: none;" class="overlay <?php echo($editDlgCssClassName); ?>">
	<hgroup>
		<h3><?php echo Lang::Get('edit_song'); ?></h3>
	</hgroup>
	<div>
		<a title="<?php echo Lang::Get('close');?>" href="#close" class="closeBtn"><?php echo Lang::Get('close');?></a>
		<a title="<?php echo Lang::Get('switch_adv_editor_desc')?>" href="#resize" class="resizeBtn">[<?php echo Lang::Get('switch_adv_editor'); ?>]</a>
		<p class="btnBar">
			<span id="messageBox" class="updateMessage">
				<em>
					<img src="<?php echo($model->StaticsPrefix); ?>img/editor/busy.gif" id="loadingSpinner" style="display:none;" />
					<span id="sourceFeedback"></span>
				</em>
			</span>
			<input type="button" id="updateBtn" class="baseBtn blueBtn" value="<?php echo Lang::Get('update');?>" title="<?php echo Lang::Get('update_descr');?>" />
			<?php if ($model->IsUpdateAllowed) { ?>
				<input type="button" id="saveBtn" class="baseBtn orange" value="<?php echo Lang::Get('save');?>" title="<?php echo Lang::Get('save');?>" style="margin-right:1.6em;" />
				<input type="button" id="deleteBtn" class="baseBtn red" value="<?php echo Lang::Get('delete');?>" title="<?php echo Lang::Get('delete');?>" style="margin-right:1.6em;" />
			<?php } ?>
			<a href="#chordBuilder" id="cdBldOpenBtn" data-dialog="cdBldDlg" class="alternateBtn" title="<?php echo Lang::Get('chord_builder_desc')?>"><?php echo Lang::Get('chord_builder')?></a>
		</p>
		<textarea id="chordProSource" wrap="off"><?php echo($model->Body); ?></textarea>
	</div>
</section>
<!-- AUTOSCROLL CONTROLS -->
<div style='display: none;' id='autoScrollCtrl'>AutoScroll <span class='autoscrollBtn' id='autoscrollStateBtn'>OFF</span> <span class='autoscrollBtn' id='autoscrollFasterBtn'>+</span> <span class='autoscrollBtn' id='autoscrollSlowerBtn'>-</span></div>
<!-- APP TOOLBAR -->
<?php if($model->isOK) {?>
<section id="ugsAppToolbar" class="ugsAppMenuBar">
	<ul>
		<li class="navHome"> <a href="/" title="<?php echo Lang::Get('tb_songbook_desc')?>"><span></span><?php echo Lang::Get('tb_songbook')?></a> </li>
		<li class="navLayout showOptionsBox"> <a href="#layoutOptions" title="<?php echo Lang::Get('tb_layout_descr')?>"><span></span><?php echo Lang::Get('tb_layout')?></a></li>
		<li class="navInstruments showOptionsBox"> <a href="#tuningOptions" title="<?php echo Lang::Get('tb_tuning_descr')?>"><span></span><?php echo Lang::Get('tb_tuning')?></a></li>
		<li class="navOptions showOptionsBox"> <a href="#optionsDlg" title="<?php echo Lang::Get('tb_options_descr')?>"><span></span><?php echo Lang::Get('tb_options')?></a> </li>
		<li class="showDlgBtn showOptionsBox"> <a href="#helpDlg" title="<?php echo Lang::Get('tb_help_descr')?>">?</a> </li>
    <?php if ($model->IsUpdateAllowed) { ?>
		<li class="navEdit" data-dialog="songSourceDlg"> <a href="#songSourceDlg" title="<?php echo Lang::Get('tb_edit_descr')?>"><span></span><?php echo Lang::Get('tb_edit')?></a> </li>
    <?php } ?>
	</ul>
</section>
<? } ?>
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
					<li><a href="#40"><?php echo Lang::Get('tiny')?></a></li>
					<li><a href="#65"><?php echo Lang::Get('small')?></a></li>
					<li><a href="#80"><?php echo Lang::Get('medium')?></a></li>
					<li><a href="#90"><?php echo Lang::Get('large')?></a></li>
					<li class="checked"><a href="#100"><?php echo Lang::Get('stupid_large')?></a></li>
				</ul>
			</dd>
			<dt><label for="diagramPositionPicker"><span>Reference diagrams on left</span> <em>&#9658;</em></label></dt>
			<dd id="diagramPositionPicker" data-action="layout">
				<ul class="pseudoSelect">
					<li class="checked"><a href="#left"><?php echo Lang::Get('left_side')?></a></li>
					<li><a href="#top"><?php echo Lang::Get('top')?></a></li>
					<li><a href="#none"><?php echo Lang::Get('do_not_show')?></a></li>
				</ul>
			</dd>
			<dt><label for="lyricChordsPicker"><span>Chord names above lyrics</span> <em>&#9658;</em></label></dt>
			<dd id="lyricChordsPicker" data-action="placement">
				<ul class="pseudoSelect">
					<li><a href="#inline"><?php echo Lang::Get('chord_name_inline')?></a></li>
					<li class="checked"><a href="#above"><?php echo Lang::Get('chord_name_above')?></a></li>
					<li><a href="#miniDiagrams"><?php echo Lang::Get('chord_and_name_above')?></a></li>
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
					<li class="checked"><a href="#up_0"><?php echo Lang::Get('original_transpose')?><em>C</em></a></li>
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
					<li class="checked"><a href="#soprano"><?php echo Lang::Get('standard_tun')?></a></li>
					<li><a href="#baritone"><?php echo Lang::Get('baritone_tun')?></a></li>
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
					<li><a href="#screen"><?php echo Lang::Get('fullscreen')?></a></li>
				</ul>
			</dd>
		</dl>
	</fieldset>
	<fieldset class="arrowBoxContent">
		<p class="checkboxBlock">
			<input type="checkbox" value="true" id="chkEnclosures" checked="checked" />
			<label for="chkEnclosures"><?php echo Lang::Get('hide_chord_enclosure')?>
				<span class="checkBoxFinePrint"><?php echo Lang::Get('hide_chord_enclosure_desc')?></span>
			</label>
		</p>
		<p class="checkboxBlock">
			<input type="checkbox" value="true" id="chkSortAlpha" checked="checked" />
			<label for="chkSortAlpha"><?php echo Lang::Get('sort_ref_diagram_alpha')?>
				<span class="checkBoxFinePrint"><?php echo Lang::Get('sort_ref_diagram_alpha_desc')?></span>
			</label>
		</p>
		<p class="checkboxBlock">
			<input type="checkbox" value="true" id="chkIgnoreCommon" checked="checked" />
			<label for="chkIgnoreCommon"><?php echo Lang::Get('ignore_common_chords')?>
				<span class="checkBoxFinePrint"><?php echo Lang::Get('ignore_common_chords_desc')?></span>
			</label>
			<input type="text" id="commonChordList" value="" />
		</p>
		<p class="checkboxBlock">
			<input type="checkbox" value="true" id="chkEnableAutoScroll" />
			<label for="chkEnableAutoScroll"><?php echo Lang::Get('auto_scroll')?>
				<span class="checkBoxFinePrint"><?php echo Lang::Get('auto_scroll_descr')?></span>
			</label>
		</p>
	</fieldset>
</aside>
<!-- HELP (DIALOG) -->
<aside class="arrowBox helpOptions" id="helpDlg">
	<fieldset class="arrowBoxContent linksList">
		<ul>
      <li><a href="https://github.com/bloodybowlers/UkeGeeks-ng" target="_blank">UkeGeeks-NG website</a></li>
      <li><hr></li>
      <li><a href="http://ukegeeks.com" target="_blank">Original UkeGeeks website</a></li>
			<li><a href="http://blog.ukegeeks.com/users-guide/" target="_blank" title="View the complete documentation including ChordPro tips">Online Ukegeeks's User Guide</a></li>
			<li><a href="http://ukegeeks.com/tools/chord-finder.htm" target="_blank" title="Access the UkeGeeks library of common chords">Online Ukegeeks's Chord Finder</a></li>
			<li><a href="http://ukegeeks.com/tools/reverse-chord-finder.htm" target="_blank" title="Find chord names by drawing the diagram">Online Ukegeeks's Reverse Chord Lookup</a></li>
		</ul>
	</fieldset>
</aside>

<!-- REFORMAT (DIALOG) -->
<section id="reformatDlg" class="reformatDlg overlay isHidden">
	<hgroup>
		<h3><?php echo Lang::Get('use_auto_format')?></h3>
	</hgroup>
	<div>
		<p class="instructions"><?php echo Lang::Get('chords_not_found')?></p>
		<p class="btnBar">
			<input type="button" id="reformatYesBtn" class="baseBtn blueBtn" value="<?php echo Lang::Get('ok_use_this')?>" />
			<a id="reformatNoBtn" href="#noThanks" class="noThanks"><?php echo Lang::Get('no_thanks')?></a>
		</p>
		<textarea id="reformatSource" wrap="off"></textarea>
		<p class="instructions small"><input type="checkbox" value="true" id="reformatDisable" /> <label for="reformatDisable"><?php echo Lang::Get('no_chord_check_again')?></label></p>
	</div>
</section>

<!-- CHORD BUILDER (DIALOG) -->
<section id="cdBldDlg" class="overlay chordBuilderDlg isHidden chordBuilderNarrow">
	<hgroup>
		<h3><?php echo Lang::Get('chord_builder')?></h3>
	</hgroup>
	<div>
		<a title="close this" href="#close" class="closeBtn"><?php echo Lang::Get('close')?></a>
		<div id="cdBldChooserPanel">
			<ul id="cdBldPick" class="ugsChordChooser"></ul>
		</div>
		<div id="cdBldBuilderPanel" style="display:none">
			<p class="">
				<label for="cdBldChordName"><?php echo Lang::Get('chord_name')?> <input class="chordName" type="text" id="cdBldChordName" value="XXXXXXX" /></label>
			</p>
			<div class="editorSurface" id="cdBldEditorSurface">
				<div class="toolboxEdgeShadow leftEdge"></div>
				<div id="cdBldToolbox" class="chordToolbox leftEdge">
					<div class="chordToolboxInner">
						<a href="#dots" id="cdBldDotsBtn" class="toolChip selected"><?php echo Lang::Get('add_dot')?><span class="bigDot"></span></a>
						<a href="#fingers" id="cdBldFingersBtn" class="toolChip"><?php echo Lang::Get('choose_finger')?> <span id="cdBldBtnDiagram" class="fingerToolImage finger1"><span class="fingerDot"></span></span><span id="cdBldBtnFingerName"></span></a>
					</div>
				</div>
				<div class="toolboxEdgeShadow rightEdge"></div>
				<div class="chordToolbox rightEdge">
					<div class="chordToolboxInner">
						<label for="cdBldStartingFret" class="toolChip"><?php echo Lang::Get('starting_fret')?>
							<select id="cdBldStartingFret"></select>
						</label>
						<a href="#slide-up" id="toolboxSlideUpBtn" class="toolChip arrowUp" data-direction="up" title="<?php echo Lang::Get('slide_up_tooltip'); ?>"><?php echo Lang::Get('slide_up')?></a>
						<a href="#slide-down" id="toolboxSlideDownBtn" class="toolChip arrowDown" data-direction="down" title="<?php echo Lang::Get('slide_down_tooltip'); ?>"><?php echo Lang::Get('slide_down')?></a>
					</div>
				</div>
				<canvas id="cdBldCursorCanvas" width="462" height="300"></canvas>
				<canvas id="cdBldDiagramCanvas" width="462" height="300"></canvas>
			</div>

			<p class="">
				<label for="cdBldShowOutputBtn"><input id="cdBldShowOutputBtn" type="checkbox" value="0" /> <?php echo Lang::Get('show_chordpro_output')?></label>
			</p>
			<p class="btnBar">
				<input type="button" value="<?php echo Lang::Get('add')?>" class="baseBtn blueBtn" id="cdBldSaveBtn">
				<a href="#closeBuilder" id="cdBldCancelBtn" class="noThanks"><?php echo Lang::Get('cancel')?></a>
			</p>
			<div id="cdBldOutputBox" class="outputBox collapseOutput" style="clear:right;">
				<pre id="cdBldOutput" class="chordPro-statement" title="Your ChordPro define tag"></pre>
			</div>
		</div>
	</div>
</section>

<!-- SCRIPTS -->
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/lazyload.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/notify.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery.draggable.js"></script>
<script type="text/javascript">
var ugs_settings = <?php echo($model->EditorSettingsJson); ?>;
if (ugs_settings && ugs_settings.invalidJson){
	alert(ugs_settings.invalidJson);
	ugs_settings = {};
}
</script>
<script type="text/javascript">

// Ugggglyyyyyyyyyyy
var ugs_il8n = <?php echo Lang::GetJsonData() ?>;

$(function()
{
  // Page loaded, display the song
  // This prevents flashing of the unrendered chordpro
  $('.editableSongPage').show();

	var ugs_settings = window.ugs_settings || {};
	ugsEditorPlus.songAmatic.init(ugs_settings);

  <?php if ($model->IsUpdateAllowed) {
    ?>
    ugsEditorPlus.updateSong.init("<?php echo($model->UpdateAjaxUri); ?>", "<?php echo($model->Id); ?>");
    ugsEditorPlus.deleteSong.init("<?php echo($model->DeleteAjaxUri); ?>", "<?php echo($model->Id); ?>");
    <?php
    }
  ?>

  // Set scroll listener for the sticky chords
  $(window).scroll(function(e)
  {
    ugsEditorPlus.stickyChords.onScroll();
  });

  // Setup autoscroll if needed
  ugsEditorPlus.autoscroll.init();
});
</script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ukeGeeks.scriptasaurus.merged.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.merged.js"></script>
</body>
</html>
