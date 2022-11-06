<?php

/**
 * All site visitors have an instance of Site User, by
 * default user is "anonymous" with minimum access.
 */
class SiteUser
{
	public $Username = 'anon';
	public $DisplayName = 'Guest';
	public $MayEdit = false;
	/**
	 * May user access any of the site -- this does NOT mean that
	 * they've logged in as would be the case where Config does not
	 * require login.
	 * @var boolean
	 */
	public $IsAllowAccess = false;
	/**
	 * Has this user successfully logged-in (using Account info)
	 * @var boolean
	 */
	public $IsAuthenticated = false;
}