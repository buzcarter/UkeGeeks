<?php 

class RebuildSongCache_Vm extends _base_Vm {
	public $ElapsedTime = 0.0;
	public $SongCount = 0;

	function __construct(){
		parent::__construct();
		$this->SongbooktUri = Ugs::MakeUri(Actions::Songbook);
	}
}