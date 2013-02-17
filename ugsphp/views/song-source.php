<?php

include_once('ugsphp/Ugs.php');

$builder = Ugs::GetBuilder(Actions::Source);
$model = $builder->Build();

header('Content-Type: text/plain');
echo($model->Body);

// echo($model->PageTitle);
