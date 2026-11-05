<?php

class JsonResponse_Vm {
	public $HasErrors = true;
	public $Message = '';
	public $Id = '';
	public $ContinueUri = '';
	public $IsJson = true;
	/** HTTP status sent when HasErrors (removed from the JSON output) */
	public $StatusCode = 500;
}