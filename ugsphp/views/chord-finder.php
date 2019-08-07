<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title><?php echo $model->PageTitle; ?> | <?php echo Config::SongbookHeadline?></title>
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.merged.css" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/chordEditorBeta.css" />
  <meta name="viewport" content="width=device-width" />
</head>
<body class="narrow">

  <section>
    <h1><?php echo Lang::Get('chord_finder')?></h1>
    <div class="bigLists">
      <select id="chordFinderRootNote"></select>
      <select id="chordFinderChordType"></select>
    </div>
    <canvas id="chordFinderMyCanvas" width="300" height="270"></canvas>
  </section>

<script type="text/javascript">
  // Ugggglyyyyyyyyyyy
  var ugs_il8n = <?php echo Lang::GetJsonData() ?>;
</script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ukeGeeks.scriptasaurus.merged.js"></script>
<script type="text/javascript" src="<?php echo($model->StaticsPrefix); ?>js/ugsEditorPlus.merged.js"></script>
<script type="text/javascript">
  // Init chord finder
  var chordFinder = new ugsChordBuilder.chordFinder();
  chordFinder.run();
</script>
</body>
</html>
