<?php

/**
 * View Model Builder -- Creates a "Login" View Model
 * @class Login_Vmb
 */
class Login_Vmb extends _base_Vmb {

	/**
	 * Populates Login View Model
	 * @return Login_Vm
	 */
	public function Build($login = null) {
		$viewModel = new Login_Vm();
		$viewModel->PageTitle = 'Login Required';

		// only a same-site form POST may attempt a login (no GET, no cross-site posts)
		if (($_SERVER['REQUEST_METHOD'] === 'POST') && isset($_POST['username']) && is_string($_POST['username']) && Ugs::IsSameOrigin()){
			$login = $login == null ? new SimpleLogin : $login;
			$viewModel->Username = $_POST['username'];
			$password = isset($_POST['password']) && is_string($_POST['password']) ? $_POST['password'] : '';

			$viewModel->ErrorMessage = $login->AttemptLogin($viewModel->Username, $password);
		}

		return $viewModel;
	}

}

