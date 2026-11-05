<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Song Index Rebuilt</title>
	<meta http-equiv="refresh" content="4;URL=<?php echo(h($model->SongbooktUri)) ?>" />
</head>
<body>
	<h1>Cache Rebuilt</h1>
	<h3><?php echo((int) $model->SongCount); ?> songs indexed in <?php echo(h($model->ElapsedTime)); ?> seconds.</h3>
	<p>(you'll be redirected to the songbook in a few seconds, if you're impatient <a href="<?php echo(h($model->SongbooktUri)) ?>">click here</a>)</p>
</body>
</html>