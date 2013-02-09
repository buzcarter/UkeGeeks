<?php

class Config {
	const PageTitleSuffix = ' | UkeGeek\'s Scriptasaurus';
	const SongDirectory = 'cpm/';
	const FileExtension = '.cpm.txt';
	const FileNamePattern = '/(.*?)\.cpm\.txt$/';
	
	const MaxFileSize = 100000;
	const NotFound_404File = 'error.txt';	
	
	const PoweredBy = 'UkeGeeks-Scriptasaurus-v1.0';
	
	const UseModRewrite = false;
	
	function Config($appRoot) {
		$this->AppRoot = $appRoot;
		$this->BuilderPath = $appRoot . '/builders/';
		$this->ViewModelPath = $appRoot . '/viewmodels/';
	}
}
