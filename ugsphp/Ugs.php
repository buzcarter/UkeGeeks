<?php
/**
 * Enum for possible Actions (url to ViewModel mappings)
 * @class Actions
 * @namespace ugsPhp
 */
class Actions {
	const Song = 'song';
	const SongList = 'songList';
	const Source = 'source';
}
	
/**
 * a "lite" MVC Controller 
 * @class Ugs
 * @namespace ugsPhp
 */
class Ugs{
	private static $config;
	
	public static function GetBuilder($controller) {
		Ugs::_Init();
		switch($controller){
			case Actions::Song:
				include_once(ugs::$config->BuilderPath . 'Song_Vmb.php');
				$builder = new Song_Vmb();
				break;
			case Actions::Source:
				include_once(ugs::$config->BuilderPath . 'Source_Vmb.php');
				$builder = new Source_Vmb();
				break;
			default:
				include_once(ugs::$config->BuilderPath . 'SongList_Vmb.php');
				$builder = new SongList_Vmb();
				break;
		}
		return $builder;
	}

	private static function _Init(){
		$appRoot = dirname(__FILE__);
		include_once($appRoot . '/Config.php');
		include_once($appRoot . '/viewmodels/_base_Vm.php');
		Ugs::$config = new Config($appRoot);
	}
}