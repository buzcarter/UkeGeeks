<?php

class Login_Vm extends _base_Vm {
	public $ErrorMessage = '';
	public $Username = '';
	public $FormPostUri = '';

	function __construct(){
		parent::__construct();
		$this->FormPostUri = Ugs::MakeUri(Actions::Login);
	}
}
