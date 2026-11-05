<?php

if (!$model->IsFound) {
	http_response_code(404);
}
header('Content-Type: text/plain; charset=utf-8');
header('X-Content-Type-Options: nosniff');
echo($model->Body);
