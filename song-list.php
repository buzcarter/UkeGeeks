<?php

include_once('ugsphp/Ugs.php');

$builder = Ugs::GetBuilder(Actions::SongList);
$model = $builder->Build();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>List All Songs</title>
<meta name="generator" content="<?php echo($model->PoweredBy) ?>" />
</head>
<body>
<h1>List All Songs</h1>
	<ol>
	<?php 
	foreach($model->SongList as $song){
		echo('<li><a href="' . $song->Uri . '">' . $song->Title . '</a></li>');
	}
	?>
	</ol>
</body>
</html>
