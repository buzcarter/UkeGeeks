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

  <section style='text-align:center'>
    <h1><?php echo Lang::Get('reverse_chord_finder')?></h1>
    <div class="editorSurface" style="width: 300px; height: 270px">
      <canvas id="reverseChordFinderCursorCanvas" width="300" height="270"></canvas>
      <canvas id="reverseChordFinderDiagramCanvas" width="300" height="270"></canvas>
    </div>
    <ul id="reverseChordFinderMyMatches" class="matches"></ul>
    <p id="reverseChordFinderFingerprint" class="fingerprint"></p>
  </section>

  <hr>

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
  // Init reverse chord finder
  var reverseChordFinder = new ugsChordBuilder.reverseFinder();
  reverseChordFinder.run();

  // Init chord finder
  var chordFinder = new ugsChordBuilder.chordFinder();
  chordFinder.run();
</script>
</body>
</html>
