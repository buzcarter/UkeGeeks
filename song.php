<?php

include_once('ugsphp/Ugs.php');

$builder = Ugs::GetBuilder(Actions::Song);
$model = $builder->Build();

?>
<!DOCTYPE HTML>
<html lang="en">
<head>
<meta charset="utf-8" />
<title><?php echo($model->PageTitle); ?> </title>
<script type="text/javascript">var isLegacyIe = false;</script>
<!--[if lt IE 9]>
<script type="text/javascript">
isLegacyIe = true;
document.getElementsByTagName('html')[0].className = 'ie';
</script>
<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<script type="text/javascript" src="../js/excanvas.js"></script>
<![endif]-->
<link rel="stylesheet" type="text/css" href="/css/yuiReset.css" />
<link rel="stylesheet" type="text/css" href="/css/basic-page-layout.css" media="all" />
<link rel="stylesheet" type="text/css" href="/css/ukeGeeks.music.css" media="all" />
<link rel="stylesheet" href="/css/ukeGeeks.musicPrint.css" media="print" />
<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
</head>
<body>
<section>
	<header>
		<hgroup>
			<aside><a href="<?php echo($model->SourceUri); ?>" target="_blank" title="view original song text">Source</a></aside>
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
	<div id="ukeSongContainer" class="ugsLayoutTwoColumn">
		<aside id="ukeChordsCanvas" class="ugs-diagrams-wrap ugs-grouped"></aside>
		<article id="ukeSongText" class="ugs-source-wrap"><pre><?php echo($model->Body); ?></pre></article>
	</div>
</section>
<footer>
	<p>Note: Standard <strong>GCEA</strong> Soprano Ukulele Tuning. <small>Powered by UkeGeeks' Scriptasaurus &bull; ukegeeks.com</small></p>
</footer>
<script type="text/javascript" src="/js/ukeGeeks.namespace.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.settings.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.data.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.toolsLite.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.chordImport.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.transpose.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.definitions.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.definitions.sopranoUkuleleGcea.js"></script>
<script type="text/javascript" src="/js/ukeGeeks.canvasTools.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.chordBrush.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.chordParser.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.cpmParser.js"></script> 
<script type="text/javascript" src="/js/ukeGeeks.chordPainter.js"></script>
<script type="text/javascript" src="/js/ukeGeeks.tabs.js"></script>
<script type="text/javascript" src="/js/ukeGeeks.scriptasaurus.js"></script>
<script type="text/javascript" src="/js/startup.js"></script>
</body>
</html>