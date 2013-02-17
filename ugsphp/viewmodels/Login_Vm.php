<?php

class Login_Vm extends _base_Vm {
	public $ErrorMessage = '';
	public $Username = '';
	public $FormPostUri = '';

	function Login_Vm(){
		$this->FormPostUri = Ugs::MakeUri(Actions::Login);
	}
}
