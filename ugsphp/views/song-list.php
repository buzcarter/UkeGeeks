<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>List All Songs</title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
</head>
<body>
<h1>List All Songs</h1>
<p><?php echo(count($model->SongList)); ?> songs</p>
<ol>
	<?php
	foreach($model->SongList as $song){
		echo('<li><a href="' . $song->Uri . '">' . $song->Title . '</a></li>');
	}
	?>
</ol>
</body>
</html>
