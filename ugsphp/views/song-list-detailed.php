<?php

/**
 * Convert a Song object to custom HTML
 */
function MakeRowHtml($song){
	$html = '<strong class="songTitle">' . $song->Title . '</strong>';

	if (strlen($song->Artist) > 0){
		$html .= ' <em class="songArtist">' . $song->Artist . '</em>';
	}

	if (!$song->HasInfo){
		$html .= ' <em class="songIncomplete">(incomplete)</em>';
	}

	if (strlen($song->Subtitle) > 0){
		$html .= '<p><em class="songSubtitle">' . $song->Subtitle . '</em><p>';
	}

	if (strlen($song->Album) > 0){
		$html .= '<p><em class="songAlbum">' . $song->Album . '</em><p>';
	}


	return '<a href="' . $song->Uri . '">' . $html  . '</a>';
}

/* ------------------------------------------------
 * HTML begins below (tip: keep this area clean)
 * ------------------------------------------------*/
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>List All Songs</title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
	<link rel="stylesheet" href="/css/ugsphp.css" />
</head>
<body class="songListPage">
<div class="contentWrap">
	<h2>Sample Styled Songbook &raquo;</h2>
	<h1>The BIG UKE Book</h1>
	<p><? echo(count($model->SongList)); ?> Songs</p>
	<ol class="songList">
		<?php
		foreach($model->SongList as $song){
			echo('<li>' . MakeRowHtml($song) . '</li>');
		}
		?>
	</ol>
</div>
</body>
</html>