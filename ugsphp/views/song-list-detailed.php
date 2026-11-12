<?php

function SayHello(){
	$greetings = array('Aloha', 'Bonjour', 'Ciao', 'Greetin\'s', 'Guten Tag', 'Hallo', '¡Hola', 'Howdy', 'Hej', 'Konnichiwa', 'Mabuhay', 'Nǐ hǎo', 'Whassup', 'Yo');
	return $greetings[rand(0, count($greetings) - 1)];
}

/**
 * Convert a Song object to custom HTML
 */
function MakeRowHtml($song){
	$html = '<strong class="songTitle">' . h($song->Title) . '</strong>';

	if (strlen($song->Artist) > 0){
		$html .= ' <em class="songArtist">' . h($song->Artist) . '</em>';
	}

	if (!$song->HasInfo){
		$html .= ' <em class="songIncomplete">(incomplete)</em>';
	}

	if (strlen($song->Subtitle) > 0){
		$html .= '<p><em class="songSubtitle">' . h($song->Subtitle) . '</em></p>';
	}

	if (strlen($song->Album) > 0){
		$html .= '<p><em class="songAlbum">' . h($song->Album) . '</em></p>';
	}


	return '<a href="' . h($song->Uri) . '">' . $html  . '</a>';
}

/* ------------------------------------------------
 * HTML begins below (tip: keep this area clean)
 * ------------------------------------------------*/
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo(h($model->PageTitle)); ?></title>
	<meta name="generator" content="<?php echo(h($model->PoweredBy)) ?>" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.min.css" title="ugsEditorCss" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.typeahead.css" />
</head>
<body class="songListPage">
	<section class="contentWrap">
		<?php if ($model->SiteUser->IsAuthenticated) { ?>
			<aside style="float:right;">
				<em style="font-size:.8em; padding-right:1.5em; color:#BCB59C;"><?php echo(h(SayHello() . ', '. $model->SiteUser->DisplayName)); ?>!
					(<a href="<?php echo(h($model->LogoutUri)); ?>">Logout</a>)
				</em>
				<?php if ($model->IsNewAllowed) {
					?>
					<input type="button" id="openNewDlgBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="New Song" title="Start editing a new song" />
					<?php
				}
				?>
			</aside>
		<?php } ?>
	<h2><?php echo($model->SubHeadline); ?></h2>
	<h1><?php echo($model->Headline); ?></h1>
	<p><?php echo(count($model->SongList)); ?> Songs.
		<label for="quickSearch">Quick search:</label> <input class="quickSearch" id="quickSearch" autocomplete="off" type="text" /></p>
	<ol class="songList">
		<?php
		foreach($model->SongList as $song){
			echo('<li>' . MakeRowHtml($song) . '</li>');
		}
		?>
	</ol>
	</section>

	<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.min.js"></script>
	<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsSongList.min.js"></script>
	<?php if ($model->IsNewAllowed) {
		?>
		<section class="ugsEditor-overlay" style="top:100px; right:40%; display:none;" id="newSongForm">
			<hgroup>
				<h3>Add Song</h3>
			</hgroup>
			<div><a title="close this" href="#close" id="hideNewSongBtn" class="ugsEditor-closeBtn">Close</a>
				<p id="loadingSpinner"><img src="<?php echo($model->StaticsPrefix); ?>img/editor/busy.gif" /> Saving&hellip;</p>
				<p class="errorMessage" style="display:none;"></p>
				<label for="songTitle">Title</label>
				<input type="text" name="songTitle" id="songTitle" value="" />
				<label for="songArtist">Artist</label>
				<input type="text" name="songArtist" id="songArtist" value="" />
				<input type="button" id="newSongBtn" class="ugsEditor-baseBtn ugsEditor-blueBtn" value="Continue" title="Save &amp; continue editing" />
			</div>
		</section>
		<script type="text/javascript">
		ugsEditorPlus.newSong.init(<?php echo(js($model->EditAjaxUri)); ?>);
		</script>
		<?php
	}
	?>

<script type="text/javascript">
var qkSrch = ugsEditorPlus.typeahead();
qkSrch.initialize();
</script>
</body>
</html>