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
	public $StaticsPrefix = '/';

	function __construct()
	{
		$this->StaticsPrefix = defined('Config::StaticsPrefix') ? Config::StaticsPrefix : '/';
	}
}