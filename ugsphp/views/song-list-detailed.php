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
	<link rel="stylesheet" href="/css/editorv2/ugsEditorPlus.css" />
	<link rel="stylesheet" href="/css/ugsphp.css" />
</head>
<body class="songListPage">
	<section class="contentWrap">

		<?php if ($model->SiteUser->IsAuthenticated) { ?>
			<aside style="float:right;">
				<em style="font-size:.8em; padding-right:1.5em; color:#BCB59C;">Howdy, <?php echo($model->SiteUser->DisplayName); ?>!
					(<a href="<?php echo($model->LogoutUri); ?>">Logout</a>)
				</em>

				<?php if ($model->IsNewAllowed) {
					?>
					<input type="button" id="openNewDlgBtn" class="baseBtn blueBtn" value="New Song" title="Start editing a new song" />
					<?php
				}
				?>
			</aside>
		<?php } ?>
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
	</section>
	<?php if ($model->IsNewAllowed) {
		?>
		<section class="overlay" style="top:100px; right:40%; display:none;" id="newSongForm">
			<hgroup>
				<h3>Add Song</h3>
			</hgroup>
			<div><a title="close this" href="#close" id="hideNewSongBtn" class="closeBtn">Close</a>
				<p class="errorMessage" style="display:none;"></p>
				<label for="songTitle">Title</label>
				<input type="text" name="songTitle" id="songTitle" value="" />
				<label for="songArtist">Artist</label>
				<input type="text" name="songArtist" id="songArtist" value="" />
				<input type="button" id="newSongBtn" class="baseBtn blueBtn" value="Continue" title="Save &amp; continue editing" />
</div>
		</section>
		<script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>
		<script type="text/javascript" src="/js/ugsEditorPlus.newSong.js"></script>
		<script type="text/javascript">
		ugsEditorPlus.newSong.init("<?php echo($model->EditAjaxUri); ?>");
		</script>
		<?php
	}
	?>
</body>
</html>