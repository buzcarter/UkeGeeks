

/**
 * View Model Builder -- Creates a "Login" View Model
 * @class Login_Vmb
 */
class Login_Vmb extends _base_Vmb {

	/**
	 * Populates Login View Model
	 * @return Login_Vm
	 */
	Build($login = null) {
		$viewModel = new Login_Vm();
		$viewModel.PageTitle = 'Login Required';

		if (isset($_REQUEST['username'])){
			$login = $login == null ? new SimpleLogin : $login;
			$viewModel.Username = $_REQUEST['username'];
			$password = $_REQUEST['password'];

			$viewModel.ErrorMessage = $login.AttemptLogin($viewModel.Username, $password);
		}

		return $viewModel;
	}

}
