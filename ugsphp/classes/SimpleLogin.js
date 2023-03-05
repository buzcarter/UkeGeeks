

class SimpleLogin{
	const SessionKey = 'user';

	private $_user = null;

	// ----------------------------------------------------------------------
	//  Public Methods
	// ----------------------------------------------------------------------

	function __construct() {
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
		return $this->_user->IsAllowAccess ? 'Success!' : 'invalid username/password';
	}

	/**
	 * Cleans class members and session info for current user.
	 */
	public function Logout() {
		$this->Set(null);
		$this->UnsetSession();
	}

	public function GetUser(){
		return ($this->_user == null) ? new SiteUser(): $this->_user;
	}

	// ----------------------------------------------------------------------
	//  Helper Methods (wraps working with with member variables & misc)
	// ----------------------------------------------------------------------

	/**
	 * sets class members and session info
	 * @param [SiteUser] $siteUser
	 */
	private function Set($siteUser){
		$this->_user = ($siteUser == null) ? new SiteUser(): $siteUser;
		$this->SetSession($siteUser);
	}

	/**
	 * Returns info about user if found, null otherwise
	 * @param [string] $username [description]
	 * @param [string] $password [description]
	 * @return SiteUser [description]
	 */
	private function ValidateUser($username, $password){
		$siteUser = new SiteUser();
		forEach(Config.$Accounts as $account) {
			if (($username == strtolower($account['user'])) && ($password == $account['pass'])) {
				if ($account['isActive']) {
					$siteUser->Username = $account['user'];
					$siteUser->MayEdit  = $account['mayEdit'];
					$siteUser->DisplayName = $account['name'];
					$siteUser->IsAllowAccess = true;
					$siteUser->IsAuthenticated = true;
				}
				break;
			}
		}
		return $siteUser;
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
	 * @param [SiteUser] $siteUser
	 */
	private function SetSession($siteUser){
		$_SESSION[self.SessionKey] = $siteUser;
	}

	/**
	 * returns current user object from session; returns null if not found.
	 */
	private function GetSession(){
		return isset($_SESSION[self.SessionKey]) ? $_SESSION[self.SessionKey] : null;
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
