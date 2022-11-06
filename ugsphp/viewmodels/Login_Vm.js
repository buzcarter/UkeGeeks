const BaseViewModel = require('./_base_Vm');


class Login_Vm extends BaseViewModel {
	public $ErrorMessage = '';
	public $Username = '';
	public $FormPostUri = '';

	function __construct(){
		parent::__construct();
		$this->FormPostUri = Ugs::MakeUri(Actions::Login);
	}
}
