<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo($model->PageTitle); ?> </title>
<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>/css/yuiReset.css" />
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>/css/basic-page-layout.css" media="all" />
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>/css/ukeGeeks.music.css" media="all" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>/css/ukeGeeks.musicPrint.css" media="print" />
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
				<a href="<?php echo($model->EditUri); ?>" title="switch to Edit/Customize view (great for Print!)">Customize</a>
				<a href="<?php echo($model->SourceUri); ?>" target="_blank" title="view original song text">Source</a>
			</aside>
			<h1 class="ugsSongTitle"><?php echo($model->SongTitle); ?></h1>
			<?php if (strlen($model->Artist) > 0): ?>
				<h2 class="ugsArtist"><?php echo($model->Artist); ?></h2>
			<?php endif; ?>
			<h2 class="ugsSubtitle"><?php echo($model->Subtitle); ?></h2>
			<?php if (strlen($model->Album) > 0): ?>
				<h3 class="ugsAlbum"><?php echo($model->Album); ?></h3>
			<?php endif; ?>
		</hgroup>
	</header>
		<?php
		if ($model->UgsMeta){
			echo('<div class="metaInfo">');
			foreach($model->UgsMeta as $meta){
				echo('<p>' . $meta . '</p>');
			}
			echo('</div><!-- /.metaInfo -->');
		}
		?>
	<div id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
		<aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
		<article id="ukeSongText" class="ugs-source-wrap"><pre><?php echo($model->Body); ?></pre></article>
	</div>
</section>
<footer>
  <?php echo ($model->PoweredBy!=''?"Powered by ".$model->PoweredBy:''); ?>
</footer>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>/js/ukeGeeks.scriptasaurus.merged.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>/js/startup.js"></script>
</body>
</html>
