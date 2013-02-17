<?php

class SimpleLogin{
	const SessionKey = 'user';

	public $IsLoggedIn = false;
	public $UserInfo = null;

	// ----------------------------------------------------------------------
	//  Public Methods
	// ----------------------------------------------------------------------

	/**
	 * constructor
	 */
	function SimpleLogin() {
		$this->StartSession();
		$this->Set($this->GetSession());
	}

	/**
	 * Redirects if successful login; otherwise returns a message
	 * @return  string message describing error or blank if no error
	 */
	public function AttemptLogin($username, $password) {
		$username = strtolower(trim($username));
		$password = trim($password);
		$this->Set($this->ValidateUser($username, $password));
		return $this->IsLoggedIn ? 'Success!' : 'invalid username/password';
	}

	/**
	 * Cleans class members and session info for current user.
	 */
	public function Logout() {
		$this->Set(null);
		$this->UnsetSession();
	}

	// ----------------------------------------------------------------------
	//  Helper Methods (wraps working with with member variables & misc)
	// ----------------------------------------------------------------------

	/**
	 * sets class members and session info
	 * @param [userObject] $userInfo
	 */
	private function Set($userInfo){
		$this->UserInfo = $userInfo;
		$this->IsLoggedIn = $userInfo != null;
		$this->SetSession($userInfo);
	}

	/**
	 * Returns info about user if found, null otherwise
	 * @param [string] $username [description]
	 * @param [string] $password [description]
	 */
	private function ValidateUser($username, $password){
		$userInfo = null;
		foreach(Config::$Accounts as $account) {
			if (($username == strtolower($account['user'])) && ($password == $account['pass'])) {
				if ($account['isActive']) {
					$userInfo = (object) array(
						'name'=>$account['user']
					);
				}
				break;
			}
		}
		return $userInfo;
	}

	// ----------------------------------------------------------------------
	// Session Management Methods
	// ----------------------------------------------------------------------

	/**
	 * Nukes session info
	 */
	private function UnsetSession(){
		session_unset();
		session_destroy();
	}

	/**
	 * Sets session info for current User.
	 * @param [object] $userInfo
	 */
	private function SetSession($userInfo){
		$_SESSION[self::SessionKey] = $userInfo;
	}

	/**
	 * returns current user object from session; returns null if not found.
	 */
	private function GetSession(){
		return isset($_SESSION[self::SessionKey]) ? $_SESSION[self::SessionKey] : null;
	}

	/**
	 * Preps the current user's session, however, it's important to remember a session isn't
	 * actually created until a value is set.
	 */
	private function StartSession(){
		if(!isset($_SESSION)) {
			session_start();
		}
	}

}
