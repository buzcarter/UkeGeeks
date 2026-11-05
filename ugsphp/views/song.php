<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo(h($model->PageTitle)); ?></title>
<meta name="generator" content="<?php echo(h($model->PoweredBy)) ?>" />
<script type="text/javascript">var isLegacyIe = false;</script>
<!--[if lt IE 9]>
<script type="text/javascript">
isLegacyIe = true;
document.getElementsByTagName('html')[0].className = 'ie';
</script>
<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/excanvas.js"></script>
<![endif]-->
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>css/yuiReset.css" />
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>css/basic-page-layout.css" media="all" />
<link rel="stylesheet" type="text/css" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.music.css" media="all" />
<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ukeGeeks.musicPrint.css" media="print" />
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
				<a href="<?php echo(h($model->EditUri)); ?>" title="switch to Edit/Customize view (great for Print!)">Customize</a>
				<a href="<?php echo(h($model->SourceUri)); ?>" target="_blank" title="view original song text">Source</a>
			</aside>
			<h1 class="ugsSongTitle"><?php echo(h($model->SongTitle)); ?></h1>
			<?php if (strlen($model->Artist) > 0): ?>
				<h2 class="ugsArtist"><?php echo(h($model->Artist)); ?></h2>
			<?php endif; ?>
			<h2 class="ugsSubtitle"><?php echo(h($model->Subtitle)); ?></h2>
			<?php if (strlen($model->Album) > 0): ?>
				<h3 class="ugsAlbum"><?php echo(h($model->Album)); ?></h3>
			<?php endif; ?>
		</hgroup>
	</header>
		<?php
		if ($model->UgsMeta){
			echo('<div class="metaInfo">');
			foreach($model->UgsMeta as $meta){
				echo('<p>' . h($meta) . '</p>');
			}
			echo('</div><!-- /.metaInfo -->');
		}
		?>
	<div id="ukeSongContainer" class="ugsLayoutTwoColumn ugs-song-wrap">
		<aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
		<article id="ukeSongText" class="ugs-source-wrap"><pre><?php echo(h($model->Body)); ?></pre></article>
	</div>
</section>
<footer>
	<p>Note: <strong>GCEA</strong> Standard Ukulele Tuning. <small>Powered by UkeGeeks' Scriptasaurus &bull; ukegeeks.org</small></p>
</footer>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ukeGeeks.scriptasaurus.min.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/startup.js"></script>
</body>
</html>
