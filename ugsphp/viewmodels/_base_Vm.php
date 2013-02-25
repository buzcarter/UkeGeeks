<?php

abstract class _base_Vm{
	public $PoweredBy = Config::PoweredBy;
	public $PageTitle = '';
	public $SupportEmail = Config::SupportEmail;
	public $IsJson = false;
	public $SiteUser = null;
}