<?php
// requires View Model "NotFound404_Vm"
?>
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="utf-8" />
  <title><?php echo($model->PageTitle); ?> | <?php echo Config::SongbookHeadline?></title>
	<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsEditorPlus.merged.css" title="ugsEditorCss" />
	<link rel="stylesheet" href="<?php echo($model->StaticsPrefix); ?>css/ugsphp.css" />
</head>
<body>
  <h2 style='text-align:center'><?php echo Config::SongbookHeadline?></h2>
  <div class='NotFound404'>
    <h1><?php echo Lang::Get('not_found_msg')?></h1>
    <a class="baseBtn blueBtn" href='<?php echo Config::Subdirectory.(Config::UseModRewrite?'songbook/':'')?>'><?php echo Lang::Get('not_found_click_here')?></a>
  </div>
</body>
</html>
