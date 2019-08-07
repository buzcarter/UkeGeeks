<?php

/**
 * base class for all View Models with visible Views (as opposed to AJAX etc)
 * @class _base_Vm
 */
abstract class _base_Vm{
	public $PoweredBy = Config::PoweredBy;
	public $PageTitle = '';
	public $SupportEmail = Config::SupportEmail;
	public $IsJson = false;
	public $SiteUser = null;
	public $StaticsPrefix = '';

	function __construct()
	{
		$this->StaticsPrefix = defined('Config::Subdirectory') ? Config::Subdirectory : '/';

    // Did the user forget the leading slash ?
    if(substr($this->StaticsPrefix, 0, 1) != '/')
      $this->StaticsPrefix = '/'.$this->StaticsPrefix;

    // Did the user forget the trailing slash ?
    if(substr($this->StaticsPrefix, -1) != '/')
      $this->StaticsPrefix = $this->StaticsPrefix.'/';
	}
}
