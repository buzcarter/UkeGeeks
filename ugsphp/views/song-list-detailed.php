<?php

// Sort by ARTIST and then by TITLE
function strCompareArtist($obj1, $obj2)
{ 
    if(strtoupper($obj1->Artist) == strtoupper($obj2->Artist))
      return strcasecmp($obj1->Title, $obj2->Title);
    else
      return strcasecmp($obj1->Artist, $obj2->Artist);
} 

// Build a songlist, alphabetically ordered, by ARTIST
function BuildSongList($SongList)
{
    usort($SongList, 'strCompareArtist');

    $currentLetter = '';
    $songLetter = '';
    $currentArtist = '';
    foreach($SongList as $song)
    {
      $songLetter = substr($song->Artist, 0, 1);

      if($currentLetter != $songLetter)
      {
        $currentLetter = $songLetter;
        echo "<div class='SongListLetter'>".strtoupper($currentLetter)."</div>";
      }

      if(strtoupper($song->Artist) != strtoupper($currentArtist))
      {
        if($currentArtist != '')
        {
          echo '</ul></div>';
        }
        $currentArtist = $song->Artist;
        echo '<div class="SongListArtist">'.$currentArtist.'<ul>';
      }

      echo '<li>';
      echo '  <a href="'.$song->Uri.'"><span class="SongListSong" data-searchable="'.$song->Artist.' - '.$song->Title.'">'.$song->Title.'</span></a>';
      echo '</li>';
    }
}

/* ------------------------------------------------
 * HTML begins below (tip: keep this area clean)
 * ------------------------------------------------*/
?>
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="utf-8" />
	<title><?php echo($model->PageTitle); ?></title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.merged.css" title="ugsEditorCss" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.typeahead.css" />
</head>
<body class="songListPage">
	<section class="contentWrap">
		<?php if ($model->SiteUser->IsAuthenticated) { ?>
			<aside class='SongListAside'>
				<em style="font-size:.8em; padding-right:1.5em; color:#BCB59C;"><?php echo Lang::Get('hello').', '. $model->SiteUser->DisplayName; ?> !
					(<a href="<?php echo($model->LogoutUri); ?>"><?php echo Lang::Get('logout')?></a>)
				</em>
				<?php if ($model->IsNewAllowed) {
					?>
					<input type="button" id="openNewDlgBtn" class="baseBtn blueBtn" value="<?php echo Lang::Get('new_song')?>" title="<?php echo Lang::Get('new_song_descr')?>" />
					<?php
				}
				?>
			</aside>
		<?php } ?>
  <div class='SongListTitle'>
    <h2><?php echo($model->SubHeadline); ?></h2>
    <h1><?php echo($model->Headline); ?></h1>
  </div>
	<div>
		<input class="quickSearch" id="quickSearch" autocomplete="off" type="text" placeholder="<?php echo Lang::Get('search_bar_placeholder')?>" />
  </div>
	<div class="songList">
		<?php
      BuildSongList($model->SongList);
		?>
	</div>
  <footer class='SongListFooter'><?php echo Lang::Get('poweredby')?> <a href='https://github.com/bloodybowlers/UkeGeeks-ng' target=_blank><?php echo $model->PoweredBy?></a></footer>
	</section>

  <script type="text/javascript">
    // Uglyyyyyyyyyyyyyy
    var ugs_il8n = <?php echo Lang::GetJsonData() ?>;
  </script>

	<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.merged.js"></script>
	<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/jquery-1.9.1.min.js"></script>
  <script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/bootstrap-typeahead.min.js"></script>
  <script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/back-to-top.js"></script>

	<?php if ($model->IsNewAllowed) {
		?>
		<section class="overlay" style="top:100px; right:40%; display:none;" id="newSongForm">
			<hgroup>
				<h3><?php echo Lang::Get('new_song')?></h3>
			</hgroup>
			<div><a title="<?php echo Lang::Get('close');?>" href="#close" id="hideNewSongBtn" class="closeBtn"><?php echo Lang::Get('close');?></a>
				<p id="loadingSpinner"><img src="<?php echo($model->StaticsPrefix); ?>img/editor/busy.gif" /> <?php echo Lang::Get('saving')?>&hellip;</p>
				<p class="errorMessage" style="display:none;"></p>
				<label for="songTitle"><?php echo Lang::Get('title');?></label>
				<input type="text" name="songTitle" id="songTitle" value="" />
				<label for="songArtist"><?php echo Lang::Get('artist');?></label>
				<input type="text" name="songArtist" id="songArtist" value="" />
				<input type="button" id="newSongBtn" class="baseBtn blueBtn" value="<?php echo Lang::Get('continue');?>" title="<?php echo Lang::Get('continue_new_song');?>" />
			</div>
		</section>
		<script type="text/javascript">
		ugsEditorPlus.newSong.init("<?php echo($model->EditAjaxUri); ?>");
		</script>
		<?php
	}
	?>

  <script type="text/javascript">
    $(window).load(function() {
      // Init Quick Search
      var qkSrch = ugsEditorPlus.typeahead();
      qkSrch.initialize();

      // Init Back To Top button
      BackToTop.init();
    }());
  </script>

</body>
</html>
